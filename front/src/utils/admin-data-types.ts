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
  BatchInvestmentRow,
  Group,
  GroupWithClass,
  GroupWithStudents,
  GroupWithDetails
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
  achievement_count: number
  group_name?: string | null // Group name for display
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
 * Group with formatted dates for client display
 * Used across all admin components that display group data
 */
export type GroupForClient = WithFormattedDates<Group, 'created_at' | 'updated_at'> & {
  calculated_at_formatted: string | null
  calculated_average_vcoin_amount_formatted: string
  calculated_average_achievement_points_formatted: string
}

/**
 * Group with class information for client display
 * Used in admin components that show groups across multiple classes
 */
export type GroupWithClassForClient = WithFormattedDates<GroupWithClass, 'created_at' | 'updated_at'> & {
  calculated_at_formatted: string | null
  calculated_average_vcoin_amount_formatted: string
  calculated_average_achievement_points_formatted: string
}

/**
 * Group with students for detailed group management
 * Used in group management components
 */
export type GroupWithStudentsForClient = WithFormattedDates<GroupWithStudents, 'created_at' | 'updated_at'> & {
  calculated_at_formatted: string | null
  calculated_average_vcoin_amount_formatted: string
  calculated_average_achievement_points_formatted: string
  students: StudentForClient[]
}

/**
 * Group with complete details for full group management
 * Used in paginated group tables and detailed views
 */
export type GroupWithDetailsForClient = WithFormattedDates<GroupWithDetails, 'created_at' | 'updated_at'> & {
  calculated_at_formatted: string | null
  calculated_average_vcoin_amount_formatted: string
  calculated_average_achievement_points_formatted: string
  students: StudentForClient[]
}

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
 * Transform raw students array to client-ready format with formatted dates and counts
 */
export function formatStudentsForClient(
  students: Student[], 
  investmentCounts: Map<number, number> = new Map(),
  achievementCounts: Map<number, number> = new Map(),
  groupNames: Map<number, string> = new Map()
): StudentForClient[] {
  const formattedStudents = withFormattedDates(
    students as unknown as Record<string, unknown>[], 
    [...DateFieldSets.AUDIT_FIELDS]
  ) as unknown as StudentForClient[]

  // Add investment and achievement counts, and group names
  return formattedStudents.map(student => ({
    ...student,
    investment_count: investmentCounts.get(student.id) || 0,
    achievement_count: achievementCounts.get(student.id) || 0,
    group_name: student.group_id ? groupNames.get(student.group_id) || null : null
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

/**
 * Transform raw groups array to client-ready format with formatted dates and amounts
 */
export function formatGroupsForClient(groups: Group[]): GroupForClient[] {
  const formattedGroups = withFormattedDates(
    groups as unknown as Record<string, unknown>[], 
    [...DateFieldSets.AUDIT_FIELDS]
  ) as unknown as Omit<GroupForClient, 'calculated_at_formatted' | 'calculated_average_vcoin_amount_formatted' | 'calculated_average_achievement_points_formatted'>[]

  return formattedGroups.map(group => ({
    ...group,
    calculated_at_formatted: group.calculated_at ? new Date(group.calculated_at).toLocaleString('es-AR') : null,
    calculated_average_vcoin_amount_formatted: formatCurrency(group.calculated_average_vcoin_amount),
    calculated_average_achievement_points_formatted: group.calculated_average_achievement_points.toLocaleString('es-AR')
  }))
}

/**
 * Transform raw groups with class info to client-ready format
 */
export function formatGroupsWithClassForClient(groups: GroupWithClass[]): GroupWithClassForClient[] {
  const formattedGroups = withFormattedDates(
    groups as unknown as Record<string, unknown>[], 
    [...DateFieldSets.AUDIT_FIELDS]
  ) as unknown as Omit<GroupWithClassForClient, 'calculated_at_formatted' | 'calculated_average_vcoin_amount_formatted' | 'calculated_average_achievement_points_formatted'>[]

  return formattedGroups.map(group => ({
    ...group,
    calculated_at_formatted: group.calculated_at ? new Date(group.calculated_at).toLocaleString('es-AR') : null,
    calculated_average_vcoin_amount_formatted: formatCurrency(group.calculated_average_vcoin_amount),
    calculated_average_achievement_points_formatted: group.calculated_average_achievement_points.toLocaleString('es-AR')
  }))
}

/**
 * Transform raw groups with students to client-ready format
 */
export function formatGroupsWithStudentsForClient(
  groups: GroupWithStudents[],
  investmentCounts: Map<number, number> = new Map(),
  achievementCounts: Map<number, number> = new Map()
): GroupWithStudentsForClient[] {
  const formattedGroups = withFormattedDates(
    groups as unknown as Record<string, unknown>[], 
    [...DateFieldSets.AUDIT_FIELDS]
  ) as unknown as Omit<GroupWithStudentsForClient, 'calculated_at_formatted' | 'calculated_average_vcoin_amount_formatted' | 'calculated_average_achievement_points_formatted' | 'students'>[]

  return formattedGroups.map(group => {
    const originalGroup = groups.find(g => g.id === group.id)!
    const groupNames = new Map<number, string>([[group.id, group.name]])
    
    return {
      ...group,
      calculated_at_formatted: group.calculated_at ? new Date(group.calculated_at).toLocaleString('es-AR') : null,
      calculated_average_vcoin_amount_formatted: formatCurrency(group.calculated_average_vcoin_amount),
      calculated_average_achievement_points_formatted: group.calculated_average_achievement_points.toLocaleString('es-AR'),
      students: formatStudentsForClient(originalGroup.students, investmentCounts, achievementCounts, groupNames)
    }
  })
}

/**
 * Transform raw groups with details to client-ready format (for pagination tables)
 */
export function formatGroupsWithDetailsForClient(
  groups: GroupWithDetails[],
  investmentCounts: Map<number, number> = new Map(),
  achievementCounts: Map<number, number> = new Map()
): GroupWithDetailsForClient[] {
  const formattedGroups = withFormattedDates(
    groups as unknown as Record<string, unknown>[], 
    [...DateFieldSets.AUDIT_FIELDS]
  ) as unknown as Omit<GroupWithDetailsForClient, 'calculated_at_formatted' | 'calculated_average_vcoin_amount_formatted' | 'calculated_average_achievement_points_formatted' | 'students'>[]

  return formattedGroups.map(group => {
    const originalGroup = groups.find(g => g.id === group.id)!
    const groupNames = new Map<number, string>([[group.id, group.name]])
    
    return {
      ...group,
      calculated_at_formatted: group.calculated_at ? new Date(group.calculated_at).toLocaleString('es-AR') : null,
      calculated_average_vcoin_amount_formatted: formatCurrency(group.calculated_average_vcoin_amount),
      calculated_average_achievement_points_formatted: group.calculated_average_achievement_points.toLocaleString('es-AR'),
      students: formatStudentsForClient(originalGroup.students, investmentCounts, achievementCounts, groupNames)
    }
  })
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

/**
 * Convert a single raw Group to GroupForClient format
 * Useful for form callbacks and individual group operations
 */
export function formatGroupForClient(group: Group): GroupForClient {
  return formatGroupsForClient([group])[0]
}

/**
 * Convert a single raw GroupWithClass to GroupWithClassForClient format
 * Useful for form callbacks and individual group operations with class data
 */
export function formatGroupWithClassForClient(group: GroupWithClass): GroupWithClassForClient {
  return formatGroupsWithClassForClient([group])[0]
}

/**
 * Convert a single raw GroupWithStudents to GroupWithStudentsForClient format
 * Useful for form callbacks and individual group operations with student data
 */
export function formatGroupWithStudentsForClient(
  group: GroupWithStudents,
  investmentCounts: Map<number, number> = new Map(),
  achievementCounts: Map<number, number> = new Map()
): GroupWithStudentsForClient {
  return formatGroupsWithStudentsForClient([group], investmentCounts, achievementCounts)[0]
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
