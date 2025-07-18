import { InvestmentRepository } from '../repos/investment-repo';
import { StudentRepository } from '../repos/student-repo';
import { ClassRepository } from '../repos/class-repo';
import { 
  Investment, 
  Student, 
  Class, 
  CreateInvestmentRequest, 
  CreateStudentRequest, 
  CreateClassRequest,
  StudentWithInvestments 
} from '../types/database';

export class InvestmentService {
  private investmentRepo: InvestmentRepository;
  private studentRepo: StudentRepository;
  private classRepo: ClassRepository;

  constructor() {
    this.investmentRepo = new InvestmentRepository();
    this.studentRepo = new StudentRepository();
    this.classRepo = new ClassRepository();
  }

  // Investment operations
  async createInvestment(data: CreateInvestmentRequest): Promise<Investment> {
    // Validate student exists
    const student = await this.studentRepo.findById(data.student_id);
    if (!student) {
      throw new Error('Student not found');
    }

    return await this.investmentRepo.create(data);
  }

  async getInvestmentsByStudent(studentId: number): Promise<Investment[]> {
    return await this.investmentRepo.findByStudentId(studentId);
  }

  async getTotalInvestedByStudent(studentId: number): Promise<number> {
    return await this.investmentRepo.getTotalByStudentId(studentId);
  }

  async getAllInvestmentsWithDetails() {
    return await this.investmentRepo.findWithStudentInfo();
  }

  async updateInvestment(id: number, data: Partial<CreateInvestmentRequest>): Promise<Investment | null> {
    return await this.investmentRepo.update(id, data);
  }

  async deleteInvestment(id: number): Promise<boolean> {
    return await this.investmentRepo.delete(id);
  }

  // Student operations
  async createStudent(data: CreateStudentRequest): Promise<Student> {
    // Validate class exists
    const classEntity = await this.classRepo.findById(data.class_id);
    if (!classEntity) {
      throw new Error('Class not found');
    }

    return await this.studentRepo.create(data);
  }

  async getStudentWithInvestments(studentId: number): Promise<StudentWithInvestments | null> {
    return await this.studentRepo.findWithInvestments(studentId);
  }

  async getStudentsByClass(classId: number): Promise<Student[]> {
    return await this.studentRepo.findByClassId(classId);
  }

  async getAllStudents(): Promise<Student[]> {
    return await this.studentRepo.findAll();
  }

  async getStudentById(id: number): Promise<Student | null> {
    return await this.studentRepo.findById(id);
  }

  async updateStudent(id: number, data: Partial<CreateStudentRequest>): Promise<Student | null> {
    return await this.studentRepo.update(id, data);
  }

  async deleteStudent(id: number): Promise<boolean> {
    return await this.studentRepo.delete(id);
  }

  // Class operations
  async createClass(data: CreateClassRequest): Promise<Class> {
    return await this.classRepo.create(data);
  }

  async getAllClasses(): Promise<Class[]> {
    return await this.classRepo.findAll();
  }

  async getClassById(id: number): Promise<Class | null> {
    return await this.classRepo.findById(id);
  }

  async updateClass(id: number, data: Partial<CreateClassRequest>): Promise<Class | null> {
    return await this.classRepo.update(id, data);
  }

  async deleteClass(id: number): Promise<boolean> {
    return await this.classRepo.delete(id);
  }

  // Business logic methods
  async calculateStudentGrowth(studentId: number, fromDate?: Date, toDate?: Date): Promise<{
    totalInvested: number;
    investmentCount: number;
    averageInvestment: number;
    firstInvestment?: Investment;
    lastInvestment?: Investment;
  }> {
    const investments = await this.investmentRepo.findByStudentId(studentId);
    
    let filteredInvestments = investments;
    if (fromDate || toDate) {
      filteredInvestments = investments.filter(investment => {
        const investmentDate = new Date(investment.fecha);
        if (fromDate && investmentDate < fromDate) return false;
        if (toDate && investmentDate > toDate) return false;
        return true;
      });
    }

    const totalInvested = filteredInvestments.reduce((sum, inv) => sum + inv.monto, 0);
    const investmentCount = filteredInvestments.length;
    const averageInvestment = investmentCount > 0 ? totalInvested / investmentCount : 0;

    // Sort by date to get first and last
    const sortedInvestments = filteredInvestments.sort((a, b) => 
      new Date(a.fecha).getTime() - new Date(b.fecha).getTime()
    );

    return {
      totalInvested,
      investmentCount,
      averageInvestment,
      firstInvestment: sortedInvestments[0],
      lastInvestment: sortedInvestments[sortedInvestments.length - 1]
    };
  }
}
