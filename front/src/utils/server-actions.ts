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
  const date = new Date(value)
  if (isNaN(date.getTime())) {
    throw new Error(`Invalid date for field: ${field}`)
  }
  return date
}
