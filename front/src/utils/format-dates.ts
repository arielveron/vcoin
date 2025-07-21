/**
 * Generic utility for adding formatted date fields to entities
 * Follows the project's server-side formatting principle to prevent hydration mismatches
 */

import { formatDate } from './format'

/**
 * Adds formatted date fields to an array of entities
 * @param items - Array of entities with date fields
 * @param dateFields - Array of field names that contain Date objects
 * @returns Array with original data + formatted date fields (field_name_formatted)
 */
export function withFormattedDates<T extends Record<string, any>>(
  items: T[],
  dateFields: (keyof T)[]
): (T & Record<string, string>)[] {
  return items.map(item => {
    const formatted: Record<string, string> = {}
    
    dateFields.forEach(field => {
      const value = item[field] as any
      if (value instanceof Date) {
        formatted[`${String(field)}_formatted`] = formatDate(value)
      }
    })
    
    return { ...item, ...formatted }
  })
}

/**
 * Type helper for entities with formatted dates
 * Usage: WithFormattedDates<Class, 'end_date' | 'created_at'>
 */
export type WithFormattedDates<T, K extends keyof T> = T & {
  [P in K as `${string & P}_formatted`]: string
}

/**
 * Common date field combinations for different entities
 */
export const DateFieldSets = {
  AUDIT_FIELDS: ['created_at', 'updated_at'] as const,
  CLASS_FIELDS: ['end_date', 'created_at', 'updated_at'] as const,
  INVESTMENT_FIELDS: ['fecha', 'created_at', 'updated_at'] as const,
  INTEREST_RATE_FIELDS: ['effective_date', 'created_at', 'updated_at'] as const,
} as const
