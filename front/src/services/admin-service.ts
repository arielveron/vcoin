import { ClassRepository } from "../repos/class-repo";
import { StudentRepository } from "../repos/student-repo";
import { InvestmentRepository } from "../repos/investment-repo";
import { InterestRateHistoryRepository } from "../repos/interest-rate-history-repo";
import { InvestmentCategoryRepository } from "../repos/investment-category-repo";
import { AchievementRepository } from "../repos/achievement-repo";
import { formatDate, formatCurrency, formatPercentage } from "@/shared/utils/formatting";
import { isSameDate } from "@/shared/utils/formatting/date";
import {
  Class,
  Student,
  Investment,
  InvestmentWithStudent,
  InvestmentCategory,
  Achievement,
  AchievementWithProgress,
  CreateClassRequest,
  CreateStudentRequest,
  CreateInvestmentRequest,
  CreateInterestRateRequest,
  CreateInvestmentCategoryRequest,
  CreateAchievementRequest,
  CreateBatchInvestmentRequest,
  BatchInvestmentResult,
} from "../types/database";

export interface AdminStats {
  totalClasses: number;
  totalStudents: number;
  totalInvestments: number;
  totalInvestmentAmount: number;
  totalInvestmentAmountFormatted: string;
}

export class AdminService {
  private classRepo: ClassRepository;
  private studentRepo: StudentRepository;
  private investmentRepo: InvestmentRepository;
  private interestRateRepo: InterestRateHistoryRepository;
  private categoryRepo: InvestmentCategoryRepository;
  private achievementRepo: AchievementRepository;

  constructor() {
    this.classRepo = new ClassRepository();
    this.studentRepo = new StudentRepository();
    this.investmentRepo = new InvestmentRepository();
    this.interestRateRepo = new InterestRateHistoryRepository();
    this.categoryRepo = new InvestmentCategoryRepository();
    this.achievementRepo = new AchievementRepository();
  }

  // Dashboard stats
  async getAdminStats(classId?: number, studentId?: number): Promise<AdminStats> {
    const [classes, students, investments, totalAmount] = await Promise.all([
      this.classRepo.findAll(),
      classId ? this.studentRepo.findByClassId(classId) : this.studentRepo.findAll(),
      studentId
        ? this.investmentRepo.findByStudentId(studentId)
        : classId
        ? this.getInvestmentsByClass(classId)
        : this.investmentRepo.findAll(),
      studentId
        ? this.getTotalInvestmentAmountByStudent(studentId)
        : classId
        ? this.getTotalInvestmentAmountByClass(classId)
        : this.investmentRepo.getTotalInvestmentAmount(),
    ]);

    return {
      totalClasses: classes.length,
      totalStudents: students.length,
      totalInvestments: investments.length,
      totalInvestmentAmount: totalAmount,
      totalInvestmentAmountFormatted: formatCurrency(totalAmount),
    };
  }

  // Helper methods for filtered data
  private async getInvestmentsByClass(classId: number) {
    const students = await this.studentRepo.findByClassId(classId);
    const studentIds = students.map((s) => s.id);
    const allInvestments = await this.investmentRepo.findAll();
    return allInvestments.filter((inv) => studentIds.includes(inv.student_id));
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
      throw new Error("Cannot delete class with existing students");
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

  /**
   * Get paginated students with optional class filter
   */
  async getStudentsPaginated(
    page: number, 
    limit: number, 
    filters?: { classId?: number; searchText?: string }
  ): Promise<{ students: Student[]; total: number; totalPages: number }> {
    // Support legacy classId parameter for backward compatibility
    const normalizedFilters = typeof filters === 'number' 
      ? { classId: filters } 
      : filters;
    
    const result = await this.studentRepo.findPaginated(page, limit, normalizedFilters);
    return {
      ...result,
      totalPages: Math.ceil(result.total / limit)
    };
  }

  /**
   * Get total count of students with optional class filter
   */
  async getStudentsCount(classId?: number): Promise<number> {
    return await this.studentRepo.getCount(classId);
  }

  async getStudentById(id: number): Promise<Student | null> {
    return await this.studentRepo.findById(id);
  }

  /**
   * Get students by an array of IDs
   */
  async getStudentsByIds(ids: number[]): Promise<Student[]> {
    return await this.studentRepo.findByIds(ids);
  }

  /**
   * Get investments by date and category (for checking duplicates)
   */
  async getInvestmentsByDateAndCategory(fecha: Date, categoryId: number): Promise<Investment[]> {
    return await this.investmentRepo.findByDateAndCategory(fecha, categoryId);
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
      throw new Error("Cannot delete student with existing investments");
    }
    return await this.studentRepo.delete(id);
  }

  async getInvestmentCountsByStudents(studentIds: number[]): Promise<Map<number, number>> {
    const investmentCounts = new Map<number, number>();
    
    // Initialize all students with 0 counts
    studentIds.forEach(id => investmentCounts.set(id, 0));
    
    // Get all investments and count by student
    const allInvestments = await this.investmentRepo.findAll();
    
    allInvestments.forEach(investment => {
      if (studentIds.includes(investment.student_id)) {
        const currentCount = investmentCounts.get(investment.student_id) || 0;
        investmentCounts.set(investment.student_id, currentCount + 1);
      }
    });
    
    return investmentCounts;
  }

  async getFilteredInvestmentCountsByStudents(
    studentIds: number[],
    filters: {
      searchText?: string | null
      categoryId?: number | null
      date?: string | null
    }
  ): Promise<Map<number, number>> {
    const investmentCounts = new Map<number, number>();
    
    // Initialize all students with 0 counts
    studentIds.forEach(id => investmentCounts.set(id, 0));
    
    // Get all investments and apply filters
    const allInvestments = await this.investmentRepo.findAll();
    
    const filteredInvestments = allInvestments.filter(investment => {
      // Filter by student IDs
      if (!studentIds.includes(investment.student_id)) return false;
      
      // Filter by search text (concept)
      if (filters.searchText && !investment.concepto.toLowerCase().includes(filters.searchText.toLowerCase())) {
        return false;
      }
      
      // Filter by category
      if (filters.categoryId && investment.category_id !== filters.categoryId) {
        return false;
      }
      
      // Filter by date
      if (filters.date) {
        if (!isSameDate(investment.fecha, filters.date)) {
          return false;
        }
      }
      
      return true;
    });
    
    // Count filtered investments by student
    filteredInvestments.forEach(investment => {
      const currentCount = investmentCounts.get(investment.student_id) || 0;
      investmentCounts.set(investment.student_id, currentCount + 1);
    });
    
    return investmentCounts;
  }

  async getAchievementCountsByStudents(studentIds: number[]): Promise<Map<number, number>> {
    const achievementCounts = new Map<number, number>();
    
    // Initialize all students with 0 counts
    studentIds.forEach(id => achievementCounts.set(id, 0));
    
    // Get all student achievements from the achievement repository
    for (const studentId of studentIds) {
      try {
        const achievements = await this.achievementRepo.getStudentAchievements(studentId);
        const unlockedCount = achievements.filter(achievement => achievement.unlocked).length;
        achievementCounts.set(studentId, unlockedCount);
      } catch (error) {
        console.error(`Error getting achievements for student ${studentId}:`, error);
        // Keep the 0 count on error
      }
    }
    
    return achievementCounts;
  }

  async getFilteredAchievementCountsByStudents(
    studentIds: number[],
    filters: {
      category?: string | null
      rarity?: string | null
      achievementId?: number | null
    }
  ): Promise<Map<number, number>> {
    const achievementCounts = new Map<number, number>();
    
    // Initialize all students with 0 counts
    studentIds.forEach(id => achievementCounts.set(id, 0));
    
    // Get all student achievements and apply filters
    for (const studentId of studentIds) {
      try {
        const achievements = await this.achievementRepo.getStudentAchievements(studentId);
        
        const filteredAchievements = achievements.filter(achievement => {
          // Only count unlocked achievements
          if (!achievement.unlocked) return false;
          
          // Filter by category
          if (filters.category && achievement.category !== filters.category) {
            return false;
          }
          
          // Filter by rarity
          if (filters.rarity && achievement.rarity !== filters.rarity) {
            return false;
          }
          
          // Filter by specific achievement ID
          if (filters.achievementId && achievement.id !== filters.achievementId) {
            return false;
          }
          
          return true;
        });
        
        achievementCounts.set(studentId, filteredAchievements.length);
      } catch (error) {
        console.error(`Error getting filtered achievements for student ${studentId}:`, error);
        // Keep the 0 count on error
      }
    }
    
    return achievementCounts;
  }

  // Get count of students who have unlocked each achievement (filtered by class if provided)
  async getStudentCountsByAchievements(classId?: number): Promise<Map<number, number>> {
    const studentCounts = new Map<number, number>();
    
    // Get students based on class filter
    const students = classId 
      ? await this.getStudentsByClass(classId)
      : await this.getAllStudents();
    
    // Get all achievements to initialize counts
    const achievements = await this.getAllAchievements();
    achievements.forEach(achievement => studentCounts.set(achievement.id, 0));
    
    // Count students for each achievement
    for (const student of students) {
      try {
        const studentAchievements = await this.achievementRepo.getStudentAchievements(student.id);
        
        studentAchievements.forEach(achievement => {
          if (achievement.unlocked) {
            const currentCount = studentCounts.get(achievement.id) || 0;
            studentCounts.set(achievement.id, currentCount + 1);
          }
        });
      } catch (error) {
        console.error(`Error getting achievements for student ${student.id}:`, error);
        // Continue with other students
      }
    }
    
    return studentCounts;
  }

  // Investment management
  async getAllInvestments(): Promise<InvestmentWithStudent[]> {
    return await this.investmentRepo.findWithStudentInfo();
  }

  async getInvestmentsByStudent(studentId: number): Promise<Investment[]> {
    return await this.investmentRepo.findByStudentId(studentId);
  }

  async createInvestment(data: CreateInvestmentRequest): Promise<InvestmentWithStudent> {
    // Validate student exists
    const student = await this.studentRepo.findById(data.student_id);
    if (!student) {
      throw new Error("Student not found");
    }
    
    const investment = await this.investmentRepo.create(data);
    
    // Get the complete investment with student info
    const investmentWithStudent = await this.investmentRepo.findWithStudentInfoById(investment.id);
    if (!investmentWithStudent) {
      throw new Error("Failed to retrieve created investment");
    }
    
    return investmentWithStudent;
  }

  async updateInvestment(id: number, data: Partial<CreateInvestmentRequest>): Promise<InvestmentWithStudent | null> {
    const updatedInvestment = await this.investmentRepo.update(id, data);
    if (!updatedInvestment) {
      return null;
    }
    
    // Get the complete investment with student info
    const investmentWithStudent = await this.investmentRepo.findWithStudentInfoById(id);
    return investmentWithStudent;
  }

  async deleteInvestment(id: number): Promise<boolean> {
    return await this.investmentRepo.delete(id);
  }

  async createBatchInvestments(data: CreateBatchInvestmentRequest): Promise<BatchInvestmentResult> {
    let createdCount = 0;
    let failedCount = 0;
    const errors: string[] = [];

    for (const investmentRow of data.investments) {
      try {
        // Validate student exists
        const student = await this.studentRepo.findById(investmentRow.student_id);
        if (!student) {
          throw new Error(`Student with ID ${investmentRow.student_id} not found`);
        }

        // Create individual investment
        const investmentData: CreateInvestmentRequest = {
          student_id: investmentRow.student_id,
          fecha: data.fecha,
          monto: investmentRow.monto,
          concepto: data.concepto,
          category_id: data.category_id
        };

        await this.investmentRepo.create(investmentData);
        createdCount++;
      } catch (error) {
        failedCount++;
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        errors.push(`Student ${investmentRow.student_name}: ${errorMessage}`);
      }
    }

    return {
      success: failedCount === 0,
      created_count: createdCount,
      failed_count: failedCount,
      errors: errors.length > 0 ? errors : undefined
    };
  }

  async getStudentsAvailableForBatchInvestment(classId: number, fecha: Date, concepto: string, categoryId: number): Promise<Student[]> {
    // Get all students from the class
    const allStudents = await this.studentRepo.findByClassId(classId);
    
    // Get students who already have an investment with the same date and category
    // (regardless of concept, to prevent duplicate investments on same date/category)
    const existingInvestments = await this.investmentRepo.findByDateAndCategory(fecha, categoryId);
    const studentIdsWithInvestment = new Set(existingInvestments.map(inv => inv.student_id));
    
    // Filter out students who already have the investment
    return allStudents.filter(student => !studentIdsWithInvestment.has(student.id));
  }

  /**
   * Get paginated investments with optional filters
   */
  async getInvestmentsPaginated(
    page: number, 
    limit: number, 
    filters?: { 
      studentId?: number, 
      categoryId?: number,
      classId?: number 
    }
  ): Promise<{ investments: InvestmentWithStudent[]; total: number; totalPages: number }> {
    const result = await this.investmentRepo.findPaginated(page, limit, filters);
    return {
      ...result,
      totalPages: Math.ceil(result.total / limit)
    };
  }

  /**
   * Get total count of investments with optional filters
   */
  async getInvestmentsCount(filters?: { 
    studentId?: number, 
    categoryId?: number,
    classId?: number 
  }): Promise<number> {
    return await this.investmentRepo.getCount(filters);
  }

  // Interest rate management
  async getAllInterestRates() {
    const rates = await this.interestRateRepo.findAll();
    // Add formatted versions for consistent rendering
    return rates.map((rate) => ({
      ...rate,
      monthly_interest_rate_formatted: formatPercentage(rate.monthly_interest_rate),
      effective_date_formatted: formatDate(rate.effective_date),
      created_at_formatted: formatDate(rate.created_at),
      updated_at_formatted: formatDate(rate.updated_at),
    }));
  }

  async getAllInterestRatesWithCurrentRates() {
    const [rates, classes] = await Promise.all([this.getAllInterestRates(), this.getAllClasses()]);

    // Get current rates for each class
    const currentRates = classes.map((cls) => {
      const classRates = rates
        .filter((rate) => rate.class_id === cls.id)
        .sort((a, b) => new Date(b.effective_date).getTime() - new Date(a.effective_date).getTime());

      const currentRate = classRates[0]?.monthly_interest_rate || 0;
      const lastUpdated = classRates[0]?.effective_date;

      return {
        class: cls,
        currentRate,
        currentRateFormatted: formatPercentage(currentRate),
        lastUpdated,
        lastUpdatedFormatted: lastUpdated ? formatDate(lastUpdated) : null,
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

  // Achievement management methods
  async getAllAchievements(): Promise<Achievement[]> {
    return await this.achievementRepo.findAll();
  }

  async getAchievementById(id: number): Promise<Achievement | null> {
    return await this.achievementRepo.findById(id);
  }

  async createAchievement(data: CreateAchievementRequest): Promise<Achievement> {
    return await this.achievementRepo.create(data);
  }

  async updateAchievement(id: number, data: Partial<CreateAchievementRequest>): Promise<Achievement | null> {
    return await this.achievementRepo.update(id, data);
  }

  async deleteAchievement(id: number): Promise<boolean> {
    return await this.achievementRepo.delete(id);
  }

  async getStudentAchievements(studentId: number): Promise<AchievementWithProgress[]> {
    return await this.achievementRepo.getStudentAchievements(studentId);
  }

  async revokeAchievement(studentId: number, achievementId: number): Promise<boolean> {
    try {
      await this.achievementRepo.revokeAchievement(studentId, achievementId);
      return true;
    } catch (error) {
      console.error('Failed to revoke achievement:', error);
      return false;
    }
  }

  async getAchievementStats(): Promise<{
    totalAchievements: number;
    totalUnlocked: number;
    topStudents: Array<{ student_id: number; total_points: number; achievement_count: number }>;
  }> {
    // This could be expanded with more detailed statistics
    const achievements = await this.achievementRepo.findAll();

    return {
      totalAchievements: achievements.length,
      totalUnlocked: 0, // TODO: Implement proper counting
      topStudents: [], // TODO: Implement leaderboard
    };
  }
}
