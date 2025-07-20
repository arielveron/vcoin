import { InvestmentService } from '@/services/investment-service';
import { fondos, students, classes, ClassSettings } from '@/db/pseudo-db';

// Default fallback settings (should rarely be used as pseudo-db has complete data)
const defaultClassSettings: ClassSettings = {
  end_date: new Date("2025-07-18"),
  timezone: "America/Argentina/Buenos_Aires",
  monthly_interest_rate: 0.01  // Default to 1% monthly rate
};

// Server-side data service that handles database/pseudo-db fallback
export class ServerDataService {
  private static service: InvestmentService | null = null;
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
}
