/**
 * Admin Server Action Types Utility
 * Centralized type definitions for admin server actions
 * 
 * This utility solves the critical architectural inconsistency where admin components
 * were using inconsistent server action return types:
 * - Some used ActionResult<T>
 * - Others used { success: boolean; error?: string }
 * - Mixed patterns for data vs success responses
 * 
 * PATTERN CONSISTENCY OBJECTIVE:
 * - All admin server actions use standardized ActionResult<T> types
 * - Consistent interface definitions across all admin components
 * - Type safety for server action responses
 */

import type { Student, Class, Investment, InvestmentCategory, InterestRateHistory, Achievement } from '@/types/database'
import type { ActionResult } from '@/utils/server-actions'
import type { InterestRateForClient, CurrentRateInfo, StudentForClient, ClassForClient } from '@/utils/admin-data-types'

// Re-export ActionResult for convenience
export type { ActionResult }

// ===== STUDENT ADMIN ACTIONS =====
export interface StudentAdminActions {
  createStudent: (formData: FormData) => Promise<ActionResult<Student>>
  updateStudent: (id: number, formData: FormData) => Promise<ActionResult<Student>>
  deleteStudent: (id: number) => Promise<ActionResult<null>>
  setStudentPassword: (formData: FormData) => Promise<ActionResult<null>>
}

// ===== CLASS ADMIN ACTIONS =====
export interface ClassAdminActions {
  createClass: (formData: FormData) => Promise<ActionResult<Class>>
  updateClass: (formData: FormData) => Promise<ActionResult<Class>>
  deleteClass: (formData: FormData) => Promise<ActionResult<null>>
}

// ===== INVESTMENT ADMIN ACTIONS =====
export interface InvestmentAdminActions {
  createInvestment: (formData: FormData) => Promise<ActionResult<Investment>>
  updateInvestment: (formData: FormData) => Promise<ActionResult<Investment>>
  deleteInvestment: (formData: FormData) => Promise<ActionResult<null>>
}

// ===== CATEGORY ADMIN ACTIONS =====
export interface CategoryAdminActions {
  createCategory: (formData: FormData) => Promise<ActionResult<InvestmentCategory>>
  updateCategory: (formData: FormData) => Promise<ActionResult<InvestmentCategory>>
  deleteCategory: (formData: FormData) => Promise<ActionResult<null>>
}

// ===== INTEREST RATE ADMIN ACTIONS =====
export interface InterestRateAdminActions {
  createInterestRate: (formData: FormData) => Promise<ActionResult<InterestRateHistory>>
  updateInterestRate: (formData: FormData) => Promise<ActionResult<InterestRateHistory>>
  deleteInterestRate: (formData: FormData) => Promise<ActionResult<null>>
}

// ===== ACHIEVEMENT ADMIN ACTIONS =====
export interface AchievementAdminActions {
  createAchievement: (formData: FormData) => Promise<ActionResult<Achievement>>
  updateAchievement: (formData: FormData) => Promise<ActionResult<Achievement>>
  deleteAchievement: (formData: FormData) => Promise<ActionResult<null>>
  processAchievements: () => Promise<ActionResult<{ processed: number }>>
  manualAward: (formData: FormData) => Promise<ActionResult<null>>
}

// ===== UNIFIED ADMIN ACTIONS (ALL COMBINED) =====
export interface AdminActions extends 
  StudentAdminActions,
  ClassAdminActions, 
  InvestmentAdminActions,
  CategoryAdminActions,
  InterestRateAdminActions,
  AchievementAdminActions {}

// ===== COMPONENT PROP TYPES =====

/**
 * Students page props with proper ActionResult types
 */
export interface StudentsPageProps {
  initialStudents: StudentForClient[]
  classes: Class[]
  createStudent: (formData: FormData) => Promise<ActionResult<Student>>
  updateStudent: (id: number, formData: FormData) => Promise<ActionResult<Student>>
  deleteStudent: (id: number) => Promise<ActionResult<null>>
  setStudentPassword: (formData: FormData) => Promise<ActionResult<null>>
}

/**
 * Classes page props with proper ActionResult types  
 */
export interface ClassesPageProps {
  initialClasses: ClassForClient[]
  createClass: (formData: FormData) => Promise<ActionResult<Class>>
  updateClass: (formData: FormData) => Promise<ActionResult<Class>>
  deleteClass: (formData: FormData) => Promise<ActionResult<null>>
}

/**
 * Investments page props with proper ActionResult types
 */
export interface InvestmentsPageProps {
  initialInvestments: Investment[]
  classes: Class[]
  students: Student[]
  categories: InvestmentCategory[]
  createInvestment: (formData: FormData) => Promise<ActionResult<Investment>>
  updateInvestment: (formData: FormData) => Promise<ActionResult<Investment>>
  deleteInvestment: (formData: FormData) => Promise<ActionResult<null>>
}

/**
 * Categories page props with proper ActionResult types
 */
export interface CategoriesPageProps {
  initialCategories: InvestmentCategory[]
  classes: Class[]
  createCategory: (formData: FormData) => Promise<ActionResult<InvestmentCategory>>
  updateCategory: (formData: FormData) => Promise<ActionResult<InvestmentCategory>>
  deleteCategory: (formData: FormData) => Promise<ActionResult<null>>
}

/**
 * Interest rates page props with proper ActionResult types
 */
export interface InterestRatesPageProps {
  initialRates: InterestRateForClient[]
  classes: Class[]
  currentRates: CurrentRateInfo[]
  createInterestRate: (formData: FormData) => Promise<ActionResult<InterestRateHistory>>
  updateInterestRate: (formData: FormData) => Promise<ActionResult<InterestRateHistory>>
  deleteInterestRate: (formData: FormData) => Promise<ActionResult<null>>
}

/**
 * Achievements page props with proper ActionResult types
 */
export interface AchievementsPageProps {
  initialAchievements: Achievement[]
  classes: Class[]
  categories: InvestmentCategory[]
  createAchievement: (formData: FormData) => Promise<ActionResult<Achievement>>
  updateAchievement: (formData: FormData) => Promise<ActionResult<Achievement>>
  deleteAchievement: (formData: FormData) => Promise<ActionResult<null>>
  processAchievements: () => Promise<ActionResult<{ processed: number }>>
  manualAward: (formData: FormData) => Promise<ActionResult<null>>
}

// ===== FORM COMPONENT TYPES =====

/**
 * Standard server action prop for form components
 * All admin forms should use ActionResult<T> for consistency
 */
export type FormServerAction<T> = (formData: FormData) => Promise<ActionResult<T>>

/**
 * Standard success callback for form components
 * Receives the raw entity data from ActionResult.data
 */
export type FormSuccessCallback<T> = (data: T) => void

/**
 * Standard error callback for form components
 * Receives the error message from ActionResult.error
 */
export type FormErrorCallback = (error: string) => void

// ===== UTILITY TYPES =====

/**
 * Extract the entity type from an ActionResult server action
 * Usage: EntityFromAction<typeof createStudent> = Student
 */
export type EntityFromAction<T> = T extends (formData: FormData) => Promise<ActionResult<infer U>> 
  ? U 
  : never

/**
 * Type guard to check if ActionResult has data
 */
export function hasActionData<T>(result: ActionResult<T>): result is ActionResult<T> & { success: true; data: T } {
  return result.success && 'data' in result && result.data !== undefined && result.data !== null
}

/**
 * Helper to extract data from ActionResult with type safety
 */
export function getActionData<T>(result: ActionResult<T>): T | null {
  return hasActionData(result) ? result.data : null
}
