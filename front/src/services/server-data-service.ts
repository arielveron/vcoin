import { InvestmentService } from '@/services/investment-service';
import { fondos, students, classes, ClassSettings } from '@/db/pseudo-db';
import { InterestRateHistoryRepository } from '@/repos/interest-rate-history-repo';
import { AchievementRepository } from '@/repos/achievement-repo';

// Default fallback settings (should rarely be used as pseudo-db has complete data)
const defaultClassSettings: ClassSettings = {
  end_date: new Date("2025-07-18"),
  timezone: "America/Argentina/Buenos_Aires",
  current_monthly_interest_rate: 0.01  // Default to 1% monthly rate
};

// Server-side data service that handles database/pseudo-db fallback
export class ServerDataService {
  private static service: InvestmentService | null = null;
  private static rateHistoryRepo: InterestRateHistoryRepository | null = null;
  private static achievementRepo: AchievementRepository | null = null;
  private static dbAvailable: boolean | null = null;

  private static async checkDatabaseAvailability(): Promise<boolean> {
    if (this.dbAvailable !== null) return this.dbAvailable;
    
    try {
      if (!this.service) {
        this.service = new InvestmentService();
      }
      // Test database connection by trying to get classes
      await this.service.getAllClasses();
      this.dbAvailable = true;
      console.log('✅ Using database for data');
      return true;
    } catch (error) {
      console.warn('⚠️ Database not available, using pseudo-db:', (error as Error).message);
      this.dbAvailable = false;
      return false;
    }
  }

  static async getTotalInvested(studentId: number): Promise<number> {
    const dbAvailable = await this.checkDatabaseAvailability();
    
    if (dbAvailable && this.service) {
      try {
        return await this.service.getTotalInvestedByStudent(studentId);
      } catch (error) {
        console.error('Database error, falling back to pseudo-db:', error);
      }
    }
    
    // Fallback to pseudo-db - filter by student_id
    return fondos
      .filter(fondo => fondo.student_id === studentId)
      .reduce((acc, fondo) => acc + fondo.monto, 0);
  }

  static async getInvestmentsList(studentId: number) {
    const dbAvailable = await this.checkDatabaseAvailability();
    
    if (dbAvailable && this.service) {
      try {
        const investments = await this.service.getInvestmentsByStudent(studentId);
        return investments.map((investment) => ({
          id: investment.id,
          fecha: investment.fecha, // Keep as Date from database
          monto: investment.monto,
          concepto: investment.concepto,
        }));
      } catch (error) {
        console.error('Database error, falling back to pseudo-db:', error);
      }
    }
    
    // Fallback to pseudo-db - filter by student_id
    return fondos
      .filter(fondo => fondo.student_id === studentId)
      .map((fondo) => ({
        id: fondo.id,
        fecha: fondo.fecha,
        monto: fondo.monto,
        concepto: fondo.concepto,
      }));
  }

  static async getAllStudents() {
    const dbAvailable = await this.checkDatabaseAvailability();
    
    if (dbAvailable && this.service) {
      try {
        return await this.service.getAllStudents();
      } catch (error) {
        console.error('Database error:', error);
      }
    }
    
    // Return pseudo-db students
    return students;
  }

  static async getAllClasses() {
    const dbAvailable = await this.checkDatabaseAvailability();
    
    if (dbAvailable && this.service) {
      try {
        return await this.service.getAllClasses();
      } catch (error) {
        console.error('Database error:', error);
      }
    }
    
    // Return pseudo-db classes with settings
    return classes;
  }

  static async getClassSettings(classId: number): Promise<ClassSettings> {
    const dbAvailable = await this.checkDatabaseAvailability();
    
    if (dbAvailable && this.service) {
      try {
        const classData = await this.service.getClassById(classId);
        if (classData) {
          // Get current interest rate from history
          const currentRate = await this.getCurrentInterestRate(classId);
          return {
            end_date: classData.end_date, // Use Date object directly
            timezone: classData.timezone,
            current_monthly_interest_rate: currentRate
          };
        }
      } catch (error) {
        console.error('Database error:', error);
      }
    }
    
    // Fallback to pseudo-db
    const classData = classes.find(c => c.id === classId);
    if (classData) {
      // Try to get current rate from history, fallback to hardcoded values for pseudo-db
      let currentRate: number;
      try {
        currentRate = await this.getCurrentInterestRate(classId);
      } catch {
        // Hardcoded fallback rates for pseudo-db classes
        const fallbackRates: Record<number, number> = {
          1: 0.01, // Programación 2024
          2: 0.04, // Finanzas Básicas  
          3: 0.07  // Matemáticas Avanzadas
        };
        currentRate = fallbackRates[classId] || 0.01;
      }
      
      return {
        end_date: classData.end_date,
        timezone: classData.timezone,
        current_monthly_interest_rate: currentRate
      };
    }
    
    // Ultimate fallback to default settings
    return defaultClassSettings;
  }

  static async getStudentClassSettings(studentId: number): Promise<ClassSettings> {
    const dbAvailable = await this.checkDatabaseAvailability();
    
    if (dbAvailable && this.service) {
      try {
        const student = await this.service.getStudentById(studentId);
        if (student) {
          return await this.getClassSettings(student.class_id);
        }
      } catch (error) {
        console.error('Database error:', error);
      }
    }
    
    // Fallback to pseudo-db
    const student = students.find(s => s.id === studentId);
    if (student) {
      return await this.getClassSettings(student.class_id);
    }
    
    // Ultimate fallback
    return defaultClassSettings;
  }

  // New methods for historical rate calculations
  static async getStudentClassId(studentId: number): Promise<number> {
    const dbAvailable = await this.checkDatabaseAvailability();
    
    if (dbAvailable && this.service) {
      try {
        const student = await this.service.getStudentById(studentId);
        if (student) {
          return student.class_id;
        }
      } catch (error) {
        console.error('Database error:', error);
      }
    }
    
    // Fallback to pseudo-db
    const student = students.find(s => s.id === studentId);
    return student?.class_id || 1; // Default to class 1
  }

  static async getCurrentInterestRate(classId: number): Promise<number> {
    if (!this.rateHistoryRepo) {
      this.rateHistoryRepo = new InterestRateHistoryRepository();
    }

    const dbAvailable = await this.checkDatabaseAvailability();
    
    if (dbAvailable) {
      try {
        const currentRate = await this.rateHistoryRepo.getCurrentRate(classId);
        if (currentRate) {
          return currentRate.monthly_interest_rate;
        }
      } catch (error) {
        console.error('Error getting current rate:', error);
      }
    }
    
    // Fallback to hardcoded rates for pseudo-db classes
    const fallbackRates: Record<number, number> = {
      1: 0.01, // Programación 2024
      2: 0.04, // Finanzas Básicas  
      3: 0.07  // Matemáticas Avanzadas
    };
    return fallbackRates[classId] || 0.01;
  }

  static async getLatestRateChange(classId: number) {
    if (!this.rateHistoryRepo) {
      this.rateHistoryRepo = new InterestRateHistoryRepository();
    }

    const dbAvailable = await this.checkDatabaseAvailability();
    
    if (dbAvailable) {
      try {
        return await this.rateHistoryRepo.getLatestRateChange(classId);
      } catch (error) {
        console.error('Error getting rate change:', error);
      }
    }
    
    return null;
  }

  static async getInterestRateHistory(classId: number) {
    if (!this.rateHistoryRepo) {
      this.rateHistoryRepo = new InterestRateHistoryRepository();
    }

    const dbAvailable = await this.checkDatabaseAvailability();
    
    if (dbAvailable) {
      try {
        return await this.rateHistoryRepo.findByClassId(classId);
      } catch (error) {
        console.error('Error getting interest rate history:', error);
      }
    }
    
    return [];
  }

  static async getRatesForGraph(classId: number) {
    if (!this.rateHistoryRepo) {
      this.rateHistoryRepo = new InterestRateHistoryRepository();
    }

    const dbAvailable = await this.checkDatabaseAvailability();
    
    if (dbAvailable) {
      try {
        // Use findByClassId since getRatesForGraph doesn't exist
        const rates = await this.rateHistoryRepo.findByClassId(classId);
        return rates.map(rate => ({
          date: rate.effective_date,
          rate: rate.monthly_interest_rate
        }));
      } catch (error) {
        console.error('Error getting rates for graph:', error);
      }
    }
    
    return [];
  }

  // Standard calculation methods using current rates only
  static async calculateMontoActual(studentId: number): Promise<number> {
    try {
      const [investments, classId, classSettings] = await Promise.all([
        this.getInvestmentsList(studentId),
        this.getStudentClassId(studentId),
        this.getStudentClassSettings(studentId)
      ]);

      // Get the current/latest rate for the class
      const currentRate = await this.getCurrentInterestRate(classId);
      
      // Create class settings with the current rate  
      const currentClassSettings = {
        ...classSettings,
        current_monthly_interest_rate: currentRate
      };

      // Use the standard calculation with current rate applied to ENTIRE investment period
      const { calculateMontoActual } = await import('@/logic/calculations');
      const result = calculateMontoActual(investments, currentClassSettings);
      return result;
    } catch (error) {
      console.error('Error calculating monto actual with current rate:', error);
      // Fallback to calculation with class settings
      const [investments, classSettings] = await Promise.all([
        this.getInvestmentsList(studentId),
        this.getStudentClassSettings(studentId)
      ]);
      const { calculateMontoActual } = await import('@/logic/calculations');
      return calculateMontoActual(investments, classSettings);
    }
  }

  // True historical calculation methods that consider rate changes over time
  static async calculateMontoActualWithHistory(studentId: number): Promise<number> {
    try {
      const [investments, classId, classSettings] = await Promise.all([
        this.getInvestmentsList(studentId),
        this.getStudentClassId(studentId),
        this.getStudentClassSettings(studentId)
      ]);

      // Create getRateForDate function for historical calculations
      const getRateForDate = async (classId: number, date: Date): Promise<number> => {
        if (!this.rateHistoryRepo) {
          this.rateHistoryRepo = new InterestRateHistoryRepository();
        }
        
        try {
          const rate = await this.rateHistoryRepo.getRateForDate(classId, date);
          return rate || await this.getCurrentInterestRate(classId);
        } catch (error) {
          console.error('Error getting rate for date:', error);
          return await this.getCurrentInterestRate(classId);
        }
      };

      // Use the true historical calculation
      const { calculateMontoActualWithHistory } = await import('@/logic/calculations');
      return calculateMontoActualWithHistory(investments, classId, classSettings, getRateForDate);
    } catch (error) {
      console.error('Error calculating monto actual with history:', error);
      // Fallback to standard calculation
      return this.calculateMontoActual(studentId);
    }
  }

  static async calculateGananciaTotal(studentId: number): Promise<number> {
    try {
      const [investments, classId, classSettings] = await Promise.all([
        this.getInvestmentsList(studentId),
        this.getStudentClassId(studentId),
        this.getStudentClassSettings(studentId)
      ]);

      // Get the current/latest rate for the class
      const currentRate = await this.getCurrentInterestRate(classId);
      
      // Create class settings with the current rate
      const currentClassSettings = {
        ...classSettings,
        current_monthly_interest_rate: currentRate
      };

      // Use the standard calculation with current rate
      const { calculateGananciaTotal } = await import('@/logic/calculations');
      return calculateGananciaTotal(investments, currentClassSettings);
    } catch (error) {
      console.error('Error calculating ganancia total with current rate:', error);
      // Fallback to calculation with class settings
      const [investments, classSettings] = await Promise.all([
        this.getInvestmentsList(studentId),
        this.getStudentClassSettings(studentId)
      ]);
      const { calculateGananciaTotal } = await import('@/logic/calculations');
      return calculateGananciaTotal(investments, classSettings);
    }
  }

  static async calculateGananciaTotalWithHistory(studentId: number): Promise<number> {
    try {
      const [investments, classId, classSettings] = await Promise.all([
        this.getInvestmentsList(studentId),
        this.getStudentClassId(studentId),
        this.getStudentClassSettings(studentId)
      ]);

      // Create getRateForDate function for historical calculations
      const getRateForDate = async (classId: number, date: Date): Promise<number> => {
        if (!this.rateHistoryRepo) {
          this.rateHistoryRepo = new InterestRateHistoryRepository();
        }
        
        try {
          const rate = await this.rateHistoryRepo.getRateForDate(classId, date);
          return rate || await this.getCurrentInterestRate(classId);
        } catch (error) {
          console.error('Error getting rate for date:', error);
          return await this.getCurrentInterestRate(classId);
        }
      };

      // Use the true historical calculation
      const { calculateGananciaTotalWithHistory } = await import('@/logic/calculations');
      return calculateGananciaTotalWithHistory(investments, classId, classSettings, getRateForDate);
    } catch (error) {
      console.error('Error calculating ganancia total with history:', error);
      // Fallback to standard calculation
      return this.calculateGananciaTotal(studentId);
    }
  }

  static async calculateMontoEstimado(studentId: number): Promise<number> {
    try {
      const [investments, classId, classSettings] = await Promise.all([
        this.getInvestmentsList(studentId),
        this.getStudentClassId(studentId),
        this.getStudentClassSettings(studentId)
      ]);

      // Get the current/latest rate for the class
      const currentRate = await this.getCurrentInterestRate(classId);
      
      // Create class settings with the current rate
      const currentClassSettings = {
        ...classSettings,
        current_monthly_interest_rate: currentRate
      };

      // Use the standard calculation with current rate
      const { calculateMontoAFinalizacion } = await import('@/logic/calculations');
      return calculateMontoAFinalizacion(investments, currentClassSettings);
    } catch (error) {
      console.error('Error calculating monto estimado with current rate:', error);
      // Fallback to calculation with class settings
      const [investments, classSettings] = await Promise.all([
        this.getInvestmentsList(studentId),
        this.getStudentClassSettings(studentId)
      ]);
      const { calculateMontoAFinalizacion } = await import('@/logic/calculations');
      return calculateMontoAFinalizacion(investments, classSettings);
    }
  }

  static async calculateMontoEstimadoWithHistory(studentId: number): Promise<number> {
    try {
      const [investments, classId, classSettings] = await Promise.all([
        this.getInvestmentsList(studentId),
        this.getStudentClassId(studentId),
        this.getStudentClassSettings(studentId)
      ]);

      // Create getRateForDate function for historical calculations
      const getRateForDate = async (classId: number, date: Date): Promise<number> => {
        if (!this.rateHistoryRepo) {
          this.rateHistoryRepo = new InterestRateHistoryRepository();
        }
        
        try {
          const rate = await this.rateHistoryRepo.getRateForDate(classId, date);
          return rate || await this.getCurrentInterestRate(classId);
        } catch (error) {
          console.error('Error getting rate for date:', error);
          return await this.getCurrentInterestRate(classId);
        }
      };

      // Use the true historical calculation
      const { calculateMontoAFinalizacionWithHistory } = await import('@/logic/calculations');
      return calculateMontoAFinalizacionWithHistory(investments, classId, classSettings, getRateForDate);
    } catch (error) {
      console.error('Error calculating monto estimado with history:', error);
      // Fallback to standard calculation
      return this.calculateMontoEstimado(studentId);
    }
  }

  // Method for historical amount tracking for graphs
  static async getHistoricalAmounts(studentId: number): Promise<Array<{date: Date, amount: number}>> {
    try {
      const [investments, classId, classSettings] = await Promise.all([
        this.getInvestmentsList(studentId),
        this.getStudentClassId(studentId),
        this.getStudentClassSettings(studentId)
      ]);

      if (!investments || investments.length === 0) {
        return [];
      }

      // Get all rate changes for more efficient calculation
      const rateHistory = await this.getInterestRateHistory(classId);
      
      // Create getRateForDate function for historical calculations
      const getRateForDate = async (classId: number, date: Date): Promise<number> => {
        // Use the repository method which correctly handles the logic to find
        // the most recent rate that was effective on or before the given date
        if (!this.rateHistoryRepo) {
          this.rateHistoryRepo = new InterestRateHistoryRepository();
        }
        
        try {
          const rate = await this.rateHistoryRepo.getRateForDate(classId, date);
          return rate || await this.getCurrentInterestRate(classId);
        } catch (error) {
          console.error('Error getting rate for date:', error);
          return await this.getCurrentInterestRate(classId);
        }
      };

      // Get the first investment date and today's date
      // Since investments are already sorted by fecha DESC from PostgreSQL,
      // the last item has the earliest date
      const firstInvestmentDate = investments[investments.length - 1].fecha;
      const today = new Date();
      const endDate = new Date(classSettings.end_date);
      const finalDate = today < endDate ? today : endDate;

      const historicalAmounts: Array<{date: Date, amount: number}> = [];
      
      // Calculate amount for each day from first investment to today/end date
      const { calculateMontoAFechaWithHistory } = await import('@/logic/calculations');
      const startDate = new Date(firstInvestmentDate);

      for (let d = new Date(startDate); d <= finalDate; d.setDate(d.getDate() + 1)) {
        const currentDate = new Date(d);
        
        try {
          // Pass rateHistory to the calculation for efficiency
          const amount = await calculateMontoAFechaWithHistory(currentDate, investments, classId, getRateForDate, rateHistory);
          historicalAmounts.push({
            date: new Date(currentDate),
            amount: amount
          });
        } catch (error) {
          console.error('Error calculating historical amount for date:', currentDate, error);
        }
      }

      return historicalAmounts;
    } catch (error) {
      console.error('Error getting historical amounts:', error);
      return [];
    }
  }

  // Method specifically for the ganancia total graph - shows what the current total would have been on each historical date
  static async getHistoricalAmountsWithCurrentRate(studentId: number): Promise<{
    amounts: Array<{date: Date, amount: number}>,
    investmentMarkers: Array<{date: Date, amount: number}>,
    rateChangeMarkers: Array<{date: Date, rate: number}>
  }> {
    try {
      const [investments, classId, classSettings] = await Promise.all([
        this.getInvestmentsList(studentId),
        this.getStudentClassId(studentId),
        this.getStudentClassSettings(studentId)
      ]);

      if (!investments || investments.length === 0) {
        return { amounts: [], investmentMarkers: [], rateChangeMarkers: [] };
      }

      // Get rate history for markers
      const rateHistory = await this.getInterestRateHistory(classId);

      // Get the first investment date and today's date
      const firstInvestmentDate = investments[investments.length - 1].fecha;
      const today = new Date();
      const endDate = new Date(classSettings.end_date);
      const finalDate = today < endDate ? today : endDate;

      const historicalAmounts: Array<{date: Date, amount: number}> = [];
      
      // Import calculation function
      const { calculateMontoAFecha } = await import('@/logic/calculations');
      const startDate = new Date(firstInvestmentDate);

      for (let d = new Date(startDate); d <= finalDate; d.setDate(d.getDate() + 1)) {
        const currentDate = new Date(d);
        
        try {
          // Get the rate that was current on this specific date
          const rateOnThisDate = await this.getCurrentInterestRateForDate(classId, currentDate);
          
          // Create class settings with the rate that was current on this date
          const dateSpecificClassSettings = {
            ...classSettings,
            current_monthly_interest_rate: rateOnThisDate
          };

          // Calculate what the total would have been on this date, using the rate that was current on this date
          // This shows what the student would have seen as their "current total" if they checked on this date
          const amount = calculateMontoAFecha(currentDate, investments, dateSpecificClassSettings);
          
          historicalAmounts.push({
            date: new Date(currentDate),
            amount: amount
          });
        } catch (error) {
          console.error('Error calculating historical amount for date:', currentDate, error);
        }
      }

      // Create investment markers - calculate the total that would have been visible on each investment date
      const investmentMarkers = [];
      for (const investment of investments) {
        try {
          const rateOnInvestmentDate = await this.getCurrentInterestRateForDate(classId, investment.fecha);
          const dateSpecificClassSettings = {
            ...classSettings,
            current_monthly_interest_rate: rateOnInvestmentDate
          };
          const amountOnInvestmentDate = calculateMontoAFecha(investment.fecha, investments, dateSpecificClassSettings);
          investmentMarkers.push({
            date: investment.fecha,
            amount: amountOnInvestmentDate
          });
        } catch (error) {
          console.error('Error calculating investment marker for date:', investment.fecha, error);
        }
      }

      // Create rate change markers - only for changes within our date range
      const rateChangeMarkers = rateHistory
        .filter(rate => {
          const effectiveDate = new Date(rate.effective_date);
          return effectiveDate >= startDate && effectiveDate <= finalDate;
        })
        .map(rate => ({
          date: new Date(rate.effective_date),
          rate: rate.monthly_interest_rate
        }));

      return {
        amounts: historicalAmounts,
        investmentMarkers,
        rateChangeMarkers
      };
    } catch (error) {
      console.error('Error getting historical amounts with current rate:', error);
      return { amounts: [], investmentMarkers: [], rateChangeMarkers: [] };
    }
  }

  // Helper method to get what the current rate was on a specific historical date
  private static async getCurrentInterestRateForDate(classId: number, date: Date): Promise<number> {
    if (!this.rateHistoryRepo) {
      this.rateHistoryRepo = new InterestRateHistoryRepository();
    }

    try {
      // Get the rate that was effective (current) on this specific date
      const rate = await this.rateHistoryRepo.getRateForDate(classId, date);
      return rate || 0.01; // Fallback to 1%
    } catch (error) {
      console.error('Error getting rate for historical date:', error);
      return 0.01; // Fallback to 1%
    }
  }

  // Achievement-related methods
  static async getStudentAchievements(studentId: number) {
    try {
      if (!this.achievementRepo) {
        this.achievementRepo = new AchievementRepository();
      }
      return await this.achievementRepo.getStudentAchievements(studentId);
    } catch (error) {
      console.error('Error getting student achievements, using fallback:', error);
      // Return empty achievements if database unavailable
      return [];
    }
  }

  static async getStudentAchievementStats(studentId: number) {
    try {
      if (!this.achievementRepo) {
        this.achievementRepo = new AchievementRepository();
      }
      return await this.achievementRepo.getStudentStats(studentId);
    } catch (error) {
      console.error('Error getting student achievement stats, using fallback:', error);
      // Return default stats if database unavailable
      return {
        total_points: 0,
        achievements_unlocked: 0,
        achievements_total: 0
      };
    }
  }
}
