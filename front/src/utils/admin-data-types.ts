/**
 * Admin Data Types Utility
 * Centralized data type definitions and transformations for admin components
 * 
 * This utility solves the critical architectural inconsistency where every admin component
 * was defining its own *ForClient types and doing manual date formatting conversions.
 * 
 * PATTERN CONSISTENCY OBJECTIVE:
 * - All admin components use the same standardized data types
 * - All date formatting happens in one place with consistent patterns
 * - No duplication of type definitions across components
 * - Clean separation between raw database types and display-formatted types
 */

import { withFormattedDates, DateFieldSets, WithFormattedDates } from '@/utils/format-dates'
import { formatCurrency } from '@/shared/utils/formatting'
import type { 
  Student, 
  Class, 
  InvestmentWithStudent, 
  InvestmentCategory,
  InterestRateHistory,
  Achievement,
  BatchInvestmentRow
} from '@/types/database'

// ============================================================================
// STANDARDIZED CLIENT TYPES
// ============================================================================

/**
 * Student with formatted dates for client display
 * Used across all admin components that display student data
 */
export type StudentForClient = WithFormattedDates<Student, 'created_at' | 'updated_at'> & {
  investment_count: number
}

/**
 * Class with formatted dates for client display
 * Used across all admin components that display class data
 */
export type ClassForClient = WithFormattedDates<Class, 'end_date' | 'created_at' | 'updated_at'>

/**
 * Investment with formatted dates and amounts for client display
 * Used across all admin components that display investment data
 */
export type InvestmentForClient = WithFormattedDates<InvestmentWithStudent, 'fecha' | 'created_at' | 'updated_at'> & {
  monto_formatted: string
}

/**
 * Investment Category with formatted dates for client display
 * Used across all admin components that display category data
 */
export type CategoryForClient = WithFormattedDates<InvestmentCategory, 'created_at' | 'updated_at'>

/**
 * Interest Rate with formatted dates for client display
 * Used across all admin components that display interest rate data
 */
export type InterestRateForClient = WithFormattedDates<InterestRateHistory, 'effective_date' | 'created_at' | 'updated_at'>

/**
 * Current Rate Information for display
 * Used in interest rates components to show current active rates per class
 */
export interface CurrentRateInfo {
  class: Class
  currentRate: number
  currentRateFormatted: string
  lastUpdated: Date | null
  lastUpdatedFormatted: string | null
}

/**
 * Achievement with formatted dates for client display
 * Used across all admin components that display achievement data
 */
export type AchievementForClient = WithFormattedDates<Achievement, 'created_at' | 'updated_at'>

/**
 * Batch Investment Row for client display with formatted amounts
 * Used in batch investment components
 */
export type BatchInvestmentRowForClient = BatchInvestmentRow & {
  monto_formatted: string
}

// ============================================================================
// STANDARDIZED DATA TRANSFORMATION FUNCTIONS
// ============================================================================

/**
 * Transform raw students array to client-ready format with formatted dates and investment counts
 */
export function formatStudentsForClient(
  students: Student[], 
  investmentCounts: Map<number, number> = new Map()
): StudentForClient[] {
  const formattedStudents = withFormattedDates(
    students as unknown as Record<string, unknown>[], 
    [...DateFieldSets.AUDIT_FIELDS]
  ) as unknown as StudentForClient[]

  // Add investment counts
  return formattedStudents.map(student => ({
    ...student,
    investment_count: investmentCounts.get(student.id) || 0
  }))
}

/**
 * Transform raw classes array to client-ready format with formatted dates
 */
export function formatClassesForClient(classes: Class[]): ClassForClient[] {
  return withFormattedDates(
    classes as unknown as Record<string, unknown>[], 
    [...DateFieldSets.CLASS_FIELDS]
  ) as unknown as ClassForClient[]
}

/**
 * Transform raw investments array to client-ready format with formatted dates and amounts
 */
export function formatInvestmentsForClient(
  investments: InvestmentWithStudent[]
): InvestmentForClient[] {
  const formatted = withFormattedDates(
    investments as unknown as Record<string, unknown>[], 
    [...DateFieldSets.INVESTMENT_FIELDS]
  ) as unknown as InvestmentForClient[]
  
  // Add formatted currency amounts
  return formatted.map(investment => ({
    ...investment,
    monto_formatted: new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(investment.monto)
  }))
}

/**
 * Transform raw categories array to client-ready format with formatted dates
 */
export function formatCategoriesForClient(categories: InvestmentCategory[]): CategoryForClient[] {
  return withFormattedDates(
    categories as unknown as Record<string, unknown>[], 
    [...DateFieldSets.AUDIT_FIELDS]
  ) as unknown as CategoryForClient[]
}

/**
 * Transform raw interest rates array to client-ready format with formatted dates
 */
export function formatInterestRatesForClient(rates: InterestRateHistory[]): InterestRateForClient[] {
  return withFormattedDates(
    rates as unknown as Record<string, unknown>[], 
    [...DateFieldSets.INTEREST_RATE_FIELDS]
  ) as unknown as InterestRateForClient[]
}

/**
 * Transform raw achievements array to client-ready format with formatted dates
 */
export function formatAchievementsForClient(achievements: Achievement[]): AchievementForClient[] {
  return withFormattedDates(
    achievements as unknown as Record<string, unknown>[], 
    [...DateFieldSets.AUDIT_FIELDS]
  ) as unknown as AchievementForClient[]
}

// ============================================================================
// CONVERSION UTILITIES
// ============================================================================

/**
 * Convert a single raw Student to StudentForClient format
 * Useful for form callbacks and individual student operations
 * Note: investment_count will be 0 unless provided via optional parameter
 */
export function formatStudentForClient(student: Student, investmentCount: number = 0): StudentForClient {
  const investmentCounts = new Map<number, number>()
  investmentCounts.set(student.id, investmentCount)
  return formatStudentsForClient([student], investmentCounts)[0]
}

/**
 * Convert a single raw Class to ClassForClient format
 * Useful for form callbacks and individual class operations
 */
export function formatClassForClient(cls: Class): ClassForClient {
  return formatClassesForClient([cls])[0]
}

/**
 * Convert a single raw Investment to InvestmentForClient format
 * Useful for form callbacks and individual investment operations
 */
export function formatInvestmentForClient(investment: InvestmentWithStudent): InvestmentForClient {
  return formatInvestmentsForClient([investment])[0]
}

/**
 * Convert a single raw Category to CategoryForClient format
 * Useful for form callbacks and individual category operations
 */
export function formatCategoryForClient(category: InvestmentCategory): CategoryForClient {
  return formatCategoriesForClient([category])[0]
}

/**
 * Convert a single raw Interest Rate to InterestRateForClient format
 * Useful for form callbacks and individual rate operations
 */
export function formatInterestRateForClient(rate: InterestRateHistory): InterestRateForClient {
  return formatInterestRatesForClient([rate])[0]
}

/**
 * Convert a single raw Achievement to AchievementForClient format
 * Useful for form callbacks and individual achievement operations
 */
export function formatAchievementForClient(achievement: Achievement): AchievementForClient {
  return formatAchievementsForClient([achievement])[0]
}

/**
 * Convert raw batch investment rows to BatchInvestmentRowForClient format
 * Formats monetary amounts consistently
 */
export function formatBatchInvestmentRowsForClient(rows: BatchInvestmentRow[]): BatchInvestmentRowForClient[] {
  return rows.map(row => ({
    ...row,
    monto_formatted: formatCurrency(row.monto)
  }))
}

/**
 * Convert a single raw batch investment row to BatchInvestmentRowForClient format
 * Useful for form operations and individual row updates
 */
export function formatBatchInvestmentRowForClient(row: BatchInvestmentRow): BatchInvestmentRowForClient {
  return formatBatchInvestmentRowsForClient([row])[0]
}

// ============================================================================
// PATTERN CONSISTENCY NOTES
// ============================================================================

/**
 * USAGE PATTERN:
 * 
 * 1. Server components (page.tsx) should format data once:
 *    const studentsForClient = formatStudentsForClient(rawStudents)
 * 
 * 2. Pass formatted data to client components:
 *    <StudentsAdminClient students={studentsForClient} />
 * 
 * 3. Client components use the *ForClient types consistently:
 *    interface Props { students: StudentForClient[] }
 * 
 * 4. Form callbacks convert raw data to client format:
 *    const handleSuccess = (rawStudent: Student) => {
 *      const formatted = formatStudentForClient(rawStudent)
 *      // Update state with formatted student
 *    }
 * 
 * BENEFITS:
 * - ✅ Single source of truth for all admin data types
 * - ✅ Consistent formatting across all components
 * - ✅ No type definition duplication
 * - ✅ Easy to maintain and update formatting logic
 * - ✅ Prevents hydration mismatches with server-side formatting
 * - ✅ Clean separation between raw DB types and display types
 */
