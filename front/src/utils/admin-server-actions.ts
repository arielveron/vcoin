/**
 * Admin-specific server action utilities
 * Provides authentication and error handling for admin actions only
 */

import { auth } from '@/auth'
import { redirect } from 'next/navigation'

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

// Admin authentication utilities
export async function requireAdminAuth() {
  const session = await auth()
  if (!session) {
    redirect('/admin/auth/signin')
  }
  return session
}

// Admin authentication wrapper for server actions
export function withAdminAuth<T extends unknown[], R>(
  action: (...args: T) => Promise<R>,
  actionName?: string
) {
  return async (...args: T): Promise<ActionResult<R>> => {
    try {
      console.log(`🔐 Admin action: ${actionName || 'unnamed'} - checking auth`)
      
      const session = await requireAdminAuth()
      
      console.log(`✅ Admin action: ${actionName || 'unnamed'} - auth passed for ${session.user?.email}`)
      
      const result = await action(...args)
      
      console.log(`✅ Admin action: ${actionName || 'unnamed'} - completed successfully`)
      
      return {
        success: true,
        data: result
      } as ActionResult<R>
      
    } catch (error) {
      console.error(`❌ Admin action: ${actionName || 'unnamed'} - error:`, error)
      
      return {
        success: false,
        error: error instanceof Error ? error.message : 'An unexpected error occurred'
      } as ActionResult<R>
    }
  }
}

// Form validation utilities
export function validateRequired(formData: FormData, requiredFields: string[]): string[] {
  const missing: string[] = []
  
  for (const field of requiredFields) {
    const value = formData.get(field)
    if (!value || (typeof value === 'string' && value.trim() === '')) {
      missing.push(field)
    }
  }
  
  return missing
}

// Parse form number with validation
export function parseFormNumber(formData: FormData, fieldName: string, defaultValue?: number): number {
  const value = formData.get(fieldName)
  
  if (!value) {
    if (defaultValue !== undefined) {
      return defaultValue
    }
    throw new Error(`Missing required number field: ${fieldName}`)
  }
  
  const parsed = parseFloat(value.toString())
  
  if (isNaN(parsed)) {
    throw new Error(`Invalid number value for field: ${fieldName}`)
  }
  
  return parsed
}

// Parse form integer with validation
export function parseFormInteger(formData: FormData, fieldName: string, defaultValue?: number): number {
  const value = formData.get(fieldName)
  
  if (!value) {
    if (defaultValue !== undefined) {
      return defaultValue
    }
    throw new Error(`Missing required integer field: ${fieldName}`)
  }
  
  const parsed = parseInt(value.toString(), 10)
  
  if (isNaN(parsed)) {
    throw new Error(`Invalid integer value for field: ${fieldName}`)
  }
  
  return parsed
}

// Parse form boolean
export function parseFormBoolean(formData: FormData, fieldName: string, defaultValue = false): boolean {
  const value = formData.get(fieldName)
  
  if (!value) {
    return defaultValue
  }
  
  return value === 'true' || value === 'on' || value === '1'
}

// Parse form float with validation
export function parseFormFloat(formData: FormData, fieldName: string, defaultValue?: number): number {
  const value = formData.get(fieldName)
  
  if (!value) {
    if (defaultValue !== undefined) {
      return defaultValue
    }
    throw new Error(`Missing required float field: ${fieldName}`)
  }
  
  const parsed = parseFloat(value.toString())
  
  if (isNaN(parsed)) {
    throw new Error(`Invalid float value for field: ${fieldName}`)
  }
  
  return parsed
}

// Parse form date with validation
export function parseFormDate(formData: FormData, fieldName: string, defaultValue?: Date): Date {
  const value = formData.get(fieldName)
  
  if (!value) {
    if (defaultValue !== undefined) {
      return defaultValue
    }
    throw new Error(`Missing required date field: ${fieldName}`)
  }
  
  const parsed = new Date(value.toString())
  
  if (isNaN(parsed.getTime())) {
    throw new Error(`Invalid date value for field: ${fieldName}`)
  }
  
  return parsed
}
