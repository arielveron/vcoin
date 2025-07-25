import { ClassRepository } from '../repos/class-repo';
import { StudentRepository } from '../repos/student-repo';
import { InvestmentRepository } from '../repos/investment-repo';
import { InterestRateHistoryRepository } from '../repos/interest-rate-history-repo';
import { InvestmentCategoryRepository } from '../repos/investment-category-repo';
import { 
  Class, 
  Student, 
  Investment, 
  InvestmentWithStudent,
  InvestmentCategory,
  CreateClassRequest, 
  CreateStudentRequest, 
  CreateInvestmentRequest,
  CreateInterestRateRequest,
  CreateInvestmentCategoryRequest
} from '../types/database';

export interface AdminStats {
  totalClasses: number;
  totalStudents: number;
  totalInvestments: number;
  totalInvestmentAmount: number;
  totalInvestmentAmountFormatted: string;
}

// Helper function for consistent date formatting (es-AR)
function formatDateConsistent(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return d.toLocaleDateString('es-AR', {
    year: 'numeric',
    month: '2-digit', 
    day: '2-digit'
  })
}

// Helper function for consistent percentage formatting (es-AR)
function formatPercentageConsistent(rate: number): string {
  return (rate * 100).toLocaleString('es-AR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }) + '%'
}

// Helper function for consistent currency formatting (es-AR)
function formatCurrencyConsistent(amount: number): string {
  return amount.toLocaleString('es-AR', {
    style: 'currency',
    currency: 'ARS',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })
}

export class AdminService {
  private classRepo: ClassRepository;
  private studentRepo: StudentRepository;
  private investmentRepo: InvestmentRepository;
  private interestRateRepo: InterestRateHistoryRepository;
  private categoryRepo: InvestmentCategoryRepository;

  constructor() {
    this.classRepo = new ClassRepository();
    this.studentRepo = new StudentRepository();
    this.investmentRepo = new InvestmentRepository();
    this.interestRateRepo = new InterestRateHistoryRepository();
    this.categoryRepo = new InvestmentCategoryRepository();
  }

  // Dashboard stats
  async getAdminStats(classId?: number, studentId?: number): Promise<AdminStats> {
    const [classes, students, investments, totalAmount] = await Promise.all([
      this.classRepo.findAll(),
      classId ? this.studentRepo.findByClassId(classId) : this.studentRepo.findAll(),
      studentId ? this.investmentRepo.findByStudentId(studentId) : 
        classId ? this.getInvestmentsByClass(classId) : this.investmentRepo.findAll(),
      studentId ? this.getTotalInvestmentAmountByStudent(studentId) :
        classId ? this.getTotalInvestmentAmountByClass(classId) : this.investmentRepo.getTotalInvestmentAmount()
    ]);

    return {
      totalClasses: classes.length,
      totalStudents: students.length,
      totalInvestments: investments.length,
      totalInvestmentAmount: totalAmount,
      totalInvestmentAmountFormatted: formatCurrencyConsistent(totalAmount)
    };
  }

  // Helper methods for filtered data
  private async getInvestmentsByClass(classId: number) {
    const students = await this.studentRepo.findByClassId(classId);
    const studentIds = students.map(s => s.id);
    const allInvestments = await this.investmentRepo.findAll();
    return allInvestments.filter(inv => studentIds.includes(inv.student_id));
  }

  private async getTotalInvestmentAmountByClass(classId: number): Promise<number> {
    const investments = await this.getInvestmentsByClass(classId);
    return investments.reduce((sum, inv) => sum + inv.monto, 0);
  }

  private async getTotalInvestmentAmountByStudent(studentId: number): Promise<number> {
    const investments = await this.investmentRepo.findByStudentId(studentId);
    return investments.reduce((sum, inv) => sum + inv.monto, 0);
  }

  // Class management
  async getAllClasses(): Promise<Class[]> {
    return await this.classRepo.findAll();
  }

  async getClassById(id: number): Promise<Class | null> {
    return await this.classRepo.findById(id);
  }

  async createClass(data: CreateClassRequest): Promise<Class> {
    return await this.classRepo.create(data);
  }

  async updateClass(id: number, data: Partial<CreateClassRequest>): Promise<Class | null> {
    return await this.classRepo.update(id, data);
  }

  async deleteClass(id: number): Promise<boolean> {
    // Check if class has students before deleting
    const students = await this.studentRepo.findByClassId(id);
    if (students.length > 0) {
      throw new Error('Cannot delete class with existing students');
    }
    return await this.classRepo.delete(id);
  }

  // Student management
  async getAllStudents(): Promise<Student[]> {
    return await this.studentRepo.findAll();
  }

  async getStudentsByClass(classId: number): Promise<Student[]> {
    return await this.studentRepo.findByClassId(classId);
  }

  async getStudentById(id: number): Promise<Student | null> {
    return await this.studentRepo.findById(id);
  }

  async createStudent(data: CreateStudentRequest): Promise<Student> {
    return await this.studentRepo.create(data);
  }

  async updateStudent(id: number, data: Partial<CreateStudentRequest>): Promise<Student | null> {
    return await this.studentRepo.update(id, data);
  }

  async deleteStudent(id: number): Promise<boolean> {
    // Check if student has investments before deleting
    const investments = await this.investmentRepo.findByStudentId(id);
    if (investments.length > 0) {
      throw new Error('Cannot delete student with existing investments');
    }
    return await this.studentRepo.delete(id);
  }

  // Investment management
  async getAllInvestments(): Promise<InvestmentWithStudent[]> {
    return await this.investmentRepo.findWithStudentInfo();
  }

  async getInvestmentsByStudent(studentId: number): Promise<Investment[]> {
    return await this.investmentRepo.findByStudentId(studentId);
  }

  async createInvestment(data: CreateInvestmentRequest): Promise<Investment> {
    // Validate student exists
    const student = await this.studentRepo.findById(data.student_id);
    if (!student) {
      throw new Error('Student not found');
    }
    return await this.investmentRepo.create(data);
  }

  async updateInvestment(id: number, data: Partial<CreateInvestmentRequest>): Promise<Investment | null> {
    return await this.investmentRepo.update(id, data);
  }

  async deleteInvestment(id: number): Promise<boolean> {
    return await this.investmentRepo.delete(id);
  }

  // Interest rate management
  async getAllInterestRates() {
    const rates = await this.interestRateRepo.findAll();
    // Add formatted versions for consistent rendering
    return rates.map(rate => ({
      ...rate,
      monthly_interest_rate_formatted: formatPercentageConsistent(rate.monthly_interest_rate),
      effective_date_formatted: formatDateConsistent(rate.effective_date),
      created_at_formatted: formatDateConsistent(rate.created_at),
      updated_at_formatted: formatDateConsistent(rate.updated_at)
    }));
  }

  async getAllInterestRatesWithCurrentRates() {
    const [rates, classes] = await Promise.all([
      this.getAllInterestRates(),
      this.getAllClasses()
    ]);

    // Get current rates for each class
    const currentRates = classes.map(cls => {
      const classRates = rates
        .filter(rate => rate.class_id === cls.id)
        .sort((a, b) => new Date(b.effective_date).getTime() - new Date(a.effective_date).getTime());
      
      const currentRate = classRates[0]?.monthly_interest_rate || 0;
      const lastUpdated = classRates[0]?.effective_date;
      
      return {
        class: cls,
        currentRate,
        currentRateFormatted: formatPercentageConsistent(currentRate),
        lastUpdated,
        lastUpdatedFormatted: lastUpdated ? formatDateConsistent(lastUpdated) : null
      };
    });

    return { rates, currentRates };
  }

  async getInterestRateHistory(classId?: number) {
    if (classId) {
      return await this.interestRateRepo.findByClassId(classId);
    }
    return await this.interestRateRepo.findAll();
  }

  async createInterestRate(data: CreateInterestRateRequest) {
    return await this.interestRateRepo.create(data);
  }

  async updateInterestRate(id: number, data: Partial<CreateInterestRateRequest>) {
    return await this.interestRateRepo.update(id, data);
  }

  async deleteInterestRate(id: number): Promise<boolean> {
    return await this.interestRateRepo.delete(id);
  }

  // Investment Category management
  async getAllCategories(activeOnly = false): Promise<InvestmentCategory[]> {
    return await this.categoryRepo.findAll(activeOnly);
  }

  async getCategoryById(id: number): Promise<InvestmentCategory | null> {
    return await this.categoryRepo.findById(id);
  }

  async createCategory(data: CreateInvestmentCategoryRequest): Promise<InvestmentCategory> {
    return await this.categoryRepo.create(data);
  }

  async updateCategory(id: number, data: Partial<CreateInvestmentCategoryRequest>): Promise<InvestmentCategory | null> {
    return await this.categoryRepo.update(id, data);
  }

  async deleteCategory(id: number): Promise<boolean> {
    return await this.categoryRepo.delete(id);
  }
}
