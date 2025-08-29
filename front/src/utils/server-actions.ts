/**
 * Standardized utilities for server actions
 * Provides consistent authentication, error handling, and response patterns
 */

import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { SecureStudentSessionService } from '@/services/secure-student-session-service'

// Standard response types for server actions
export interface ActionSuccess<T = unknown> {
  success: true
  data?: T
  message?: string
}

export interface ActionError {
  success: false
  error: string
  code?: string
}

export type ActionResult<T = unknown> = ActionSuccess<T> | ActionError

// Authentication utilities
export async function requireAdminAuth() {
  const session = await auth()
  if (!session) {
    redirect('/admin/auth/signin')
  }
  return session
}

export async function requireStudentAuth() {
  const session = await SecureStudentSessionService.getSession()
  if (!session) {
    throw new Error('Authentication required')
  }
  return session
}

// Error handling wrapper for server actions
export function withErrorHandling<T extends unknown[], R>(
  action: (...args: T) => Promise<R>,
  context: string
) {
  return async (...args: T): Promise<ActionResult<R>> => {
    try {
      const result = await action(...args)
      return { success: true, data: result }
    } catch (error) {
      // Don't log NEXT_REDIRECT as an error - it's expected behavior
      if (error instanceof Error && error.message.includes('NEXT_REDIRECT')) {
        throw error; // Let redirects bubble up normally
      }
      
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
      console.error(`Error in ${context}:`, error)
      return { 
        success: false, 
        error: errorMessage,
        code: context.toUpperCase().replace(/\s+/g, '_')
      }
    }
  }
}

// Admin action wrapper - combines auth and error handling
export function withAdminAuth<T extends unknown[], R>(
  action: (...args: T) => Promise<R>,
  context: string
) {
  return withErrorHandling(async (...args: T) => {
    await requireAdminAuth()
    return action(...args)
  }, context)
}

// Student action wrapper - combines auth and error handling
export function withStudentAuth<T extends unknown[], R>(
  action: (...args: T) => Promise<R>,
  context: string
) {
  return withErrorHandling(async (...args: T) => {
    await requireStudentAuth()
    return action(...args)
  }, context)
}

// Form validation utilities
export function validateRequired(formData: FormData, fields: string[]): string[] {
  const missing: string[] = []
  for (const field of fields) {
    const value = formData.get(field)
    if (!value || (typeof value === 'string' && value.trim() === '')) {
      missing.push(field)
    }
  }
  return missing
}

export function parseFormNumber(formData: FormData, field: string): number {
  const value = formData.get(field) as string
  const parsed = parseInt(value, 10)
  if (isNaN(parsed)) {
    throw new Error(`Invalid number for field: ${field}`)
  }
  return parsed
}

export function parseFormFloat(formData: FormData, field: string): number {
  const value = formData.get(field) as string
  const parsed = parseFloat(value)
  if (isNaN(parsed)) {
    throw new Error(`Invalid number for field: ${field}`)
  }
  return parsed
}

export function parseFormDate(formData: FormData, field: string): Date {
  const value = formData.get(field) as string
  // For date inputs (YYYY-MM-DD), create date in local timezone to avoid offset issues
  if (value.match(/^\d{4}-\d{2}-\d{2}$/)) {
    const [year, month, day] = value.split('-').map(Number)
    return new Date(year, month - 1, day) // month is 0-indexed
  }
  // For other date formats, use standard parsing
  const date = new Date(value)
  if (isNaN(date.getTime())) {
    throw new Error(`Invalid date for field: ${field}`)
  }
  return date
}

// ============================================================================
// NEW ENHANCED FORM PARSING UTILITIES
// ============================================================================

/**
 * Parse a string field from FormData with optional default value
 * @param formData - The FormData object
 * @param field - The field name to parse
 * @param defaultValue - Optional default value if field is empty
 * @returns The string value or default
 */
export function parseFormString(formData: FormData, field: string, defaultValue?: string): string {
  const value = formData.get(field) as string
  if (!value || value.trim() === '') {
    if (defaultValue !== undefined) {
      return defaultValue
    }
    throw new Error(`Missing or empty string for field: ${field}`)
  }
  return value.trim()
}

/**
 * Parse an optional string field from FormData
 * @param formData - The FormData object
 * @param field - The field name to parse
 * @returns The string value or null if empty
 */
export function parseFormStringOptional(formData: FormData, field: string): string | null {
  const value = formData.get(field) as string
  return value && value.trim() !== '' ? value.trim() : null
}

/**
 * Parse a boolean field from FormData (checkbox or select)
 * @param formData - The FormData object
 * @param field - The field name to parse
 * @param defaultValue - Optional default value if field is missing
 * @returns The boolean value
 */
export function parseFormBoolean(formData: FormData, field: string, defaultValue: boolean = false): boolean {
  const value = formData.get(field) as string
  if (!value) return defaultValue
  
  // Handle checkbox values (can be 'on', 'true', '1')
  if (value === 'on' || value === 'true' || value === '1') return true
  if (value === 'false' || value === '0') return false
  
  return defaultValue
}

/**
 * Parse an optional number field from FormData
 * @param formData - The FormData object
 * @param field - The field name to parse
 * @returns The number value or null if empty
 */
export function parseFormNumberOptional(formData: FormData, field: string): number | null {
  const value = formData.get(field) as string
  if (!value || value.trim() === '') return null
  
  const parsed = parseInt(value, 10)
  if (isNaN(parsed)) {
    throw new Error(`Invalid number for field: ${field}`)
  }
  return parsed
}

// ============================================================================
// ACTION RESULT HELPER FUNCTIONS
// ============================================================================

/**
 * Create a successful ActionResult
 * @param data - Optional data to include in the result
 * @param message - Optional success message
 * @returns ActionSuccess<T>
 */
export function createActionSuccess<T = unknown>(data?: T, message?: string): ActionSuccess<T> {
  return {
    success: true,
    ...(data !== undefined && { data }),
    ...(message && { message })
  }
}

/**
 * Create an error ActionResult
 * @param error - Error message
 * @param code - Optional error code
 * @returns ActionError
 */
export function createActionError(error: string, code?: string): ActionError {
  return {
    success: false,
    error,
    ...(code && { code })
  }
}
