import { InvestmentService } from '@/services/investment-service';
import { fondos, students, classes, ClassSettings } from '@/db/pseudo-db';
import { InterestRateHistoryRepository } from '@/repos/interest-rate-history-repo';
import { 
  calculateMontoActualWithHistory,
  calculateGananciaTotalWithHistory,
  calculateMontoAFinalizacionWithHistory 
} from '@/logic/calculations';

// Default fallback settings (should rarely be used as pseudo-db has complete data)
const defaultClassSettings: ClassSettings = {
  end_date: new Date("2025-07-18"),
  timezone: "America/Argentina/Buenos_Aires",
  monthly_interest_rate: 0.01  // Default to 1% monthly rate
};

// Server-side data service that handles database/pseudo-db fallback
export class ServerDataService {
  private static service: InvestmentService | null = null;
  private static rateHistoryRepo: InterestRateHistoryRepository | null = null;
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

  static async getTotalInvested(studentId: number = 1): Promise<number> {
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

  static async getInvestmentsList(studentId: number = 1) {
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
          return {
            end_date: classData.end_date, // Use Date object directly
            timezone: classData.timezone,
            monthly_interest_rate: classData.monthly_interest_rate
          };
        }
      } catch (error) {
        console.error('Database error:', error);
      }
    }
    
    // Fallback to pseudo-db
    const classData = classes.find(c => c.id === classId);
    if (classData) {
      return {
        end_date: classData.end_date,
        timezone: classData.timezone,
        monthly_interest_rate: classData.monthly_interest_rate
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
    
    // Fallback to class settings
    const classSettings = await this.getClassSettings(classId);
    return classSettings.monthly_interest_rate;
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

  // Enhanced calculation methods using current rates (not historical)
  static async calculateMontoActualWithHistory(studentId: number): Promise<number> {
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
        monthly_interest_rate: currentRate
      };

      // Use the legacy calculation with current rate (no need for historical complexity)
      const { calculateMontoActual } = await import('@/logic/calculations');
      return calculateMontoActual(investments, currentClassSettings);
    } catch (error) {
      console.error('Error calculating monto actual with current rate:', error);
      // Fallback to legacy calculation with class settings
      const [investments, classSettings] = await Promise.all([
        this.getInvestmentsList(studentId),
        this.getStudentClassSettings(studentId)
      ]);
      const { calculateMontoActual } = await import('@/logic/calculations');
      return calculateMontoActual(investments, classSettings);
    }
  }

  static async calculateGananciaTotalWithHistory(studentId: number): Promise<number> {
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
        monthly_interest_rate: currentRate
      };

      // Use the legacy calculation with current rate (no need for historical complexity)
      const { calculateGananciaTotal } = await import('@/logic/calculations');
      return calculateGananciaTotal(investments, currentClassSettings);
    } catch (error) {
      console.error('Error calculating ganancia total with current rate:', error);
      // Fallback to legacy calculation with class settings
      const [investments, classSettings] = await Promise.all([
        this.getInvestmentsList(studentId),
        this.getStudentClassSettings(studentId)
      ]);
      const { calculateGananciaTotal } = await import('@/logic/calculations');
      return calculateGananciaTotal(investments, classSettings);
    }
  }

  static async calculateMontoEstimadoWithHistory(studentId: number): Promise<number> {
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
        monthly_interest_rate: currentRate
      };

      // Use the legacy calculation with current rate (no need for historical complexity)
      const { calculateMontoAFinalizacion } = await import('@/logic/calculations');
      return calculateMontoAFinalizacion(investments, currentClassSettings);
    } catch (error) {
      console.error('Error calculating monto estimado with current rate:', error);
      // Fallback to legacy calculation with class settings
      const [investments, classSettings] = await Promise.all([
        this.getInvestmentsList(studentId),
        this.getStudentClassSettings(studentId)
      ]);
      const { calculateMontoAFinalizacion } = await import('@/logic/calculations');
      return calculateMontoAFinalizacion(investments, classSettings);
    }
  }
}
