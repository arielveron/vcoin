import { InvestmentService } from '@/services/investment-service';
import { fondos } from '@/db/pseudo-db';

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
    
    // Fallback to pseudo-db
    return fondos.reduce((acc, fondo) => acc + fondo.monto, 0);
  }

  static async getInvestmentsList(studentId: number = 1) {
    const dbAvailable = await this.checkDatabaseAvailability();
    
    if (dbAvailable && this.service) {
      try {
        const investments = await this.service.getInvestmentsByStudent(studentId);
        return investments.map((investment) => ({
          id: investment.id,
          fecha: investment.fecha,
          monto: investment.monto,
          concepto: investment.concepto,
        }));
      } catch (error) {
        console.error('Database error, falling back to pseudo-db:', error);
      }
    }
    
    // Fallback to pseudo-db
    return fondos.map((fondo) => ({
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
    
    // Return default student data for pseudo-db mode
    return [{
      id: 1,
      name: 'Estudiante Demo',
      email: 'demo@ejemplo.com',
      class_id: 1,
      created_at: new Date(),
      updated_at: new Date()
    }];
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
    
    // Return default class data for pseudo-db mode
    return [{
      id: 1,
      name: 'Clase Demo',
      description: 'Clase de demostración usando pseudo-db',
      created_at: new Date(),
      updated_at: new Date()
    }];
  }
}
