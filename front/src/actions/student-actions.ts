'use server'

import { redirect } from 'next/navigation'
import { StudentAuthService } from '@/services/student-auth-service'
import { SecureStudentSessionService } from '@/services/secure-student-session-service'
import { LoginThrottleService } from '@/services/login-throttle-service'
import { withStudentAuth, withErrorHandling, validateRequired } from '@/utils/server-actions'

export const studentLogin = withErrorHandling(async (formData: FormData) => {
  const missing = validateRequired(formData, ['class_id', 'registro', 'password'])
  if (missing.length > 0) {
    throw new Error(`Missing required fields: ${missing.join(', ')}`)
  }

  const class_id = formData.get('class_id') as string
  const registro = formData.get('registro') as string
  const password = formData.get('password') as string

  // Server-side input validation
  // Validate class_id is only numbers (no decimals, no negatives)
  if (!/^\d+$/.test(class_id) || class_id.includes('.') || class_id.includes('-')) {
    console.error(`🚨 INVALID INPUT - ${new Date().toISOString()}: Class ID contains invalid characters: ${class_id}`)
    throw new Error('Class ID must be a positive integer')
  }

  // Validate registro is only numbers (no decimals, no negatives)
  if (!/^\d+$/.test(registro) || registro.includes('.') || registro.includes('-')) {
    console.error(`🚨 INVALID INPUT - ${new Date().toISOString()}: Registry contains invalid characters: ${registro}`)
    throw new Error('Registry Number must be a positive integer')
  }

  // Convert to numbers and validate they're positive
  const classIdNum = parseInt(class_id, 10)
  const registroNum = parseInt(registro, 10)

  if (isNaN(classIdNum) || classIdNum <= 0) {
    console.error(`🚨 INVALID INPUT - ${new Date().toISOString()}: Class ID is not a positive number: ${class_id}`)
    throw new Error('Class ID must be a positive number')
  }

  if (isNaN(registroNum) || registroNum <= 0) {
    console.error(`🚨 INVALID INPUT - ${new Date().toISOString()}: Registry is not a positive number: ${registro}`)
    throw new Error('Registry Number must be a positive number')
  }

  // Validate password contains only allowed characters
  if (!/^[a-zA-Z0-9\-\.\+\$\&\/\!\?]+$/.test(password)) {
    console.error(`🚨 INVALID INPUT - ${new Date().toISOString()}: Password contains invalid characters for class ${class_id}, registro ${registro}`)
    throw new Error('Password contains invalid characters')
  }

  // Create unique identifier for throttling (use normalized numbers)
  const throttleIdentifier = `${classIdNum}:${registroNum}`

  // Authenticate student using normalized numbers
  const studentSession = await StudentAuthService.authenticateStudent({
    class_id: classIdNum,
    registro: registroNum,
    password
  })

  if (!studentSession) {
    // Apply throttling for failed attempt
    await LoginThrottleService.recordFailedAttempt(throttleIdentifier)
    
    // Log failed login attempt with timestamp and credentials used
    const timestamp = new Date().toISOString()
    console.error(`🚨 FAILED LOGIN ATTEMPT - ${timestamp}`)
    console.error(`   Class ID: ${classIdNum}`)
    console.error(`   Registry: ${registroNum}`)
    console.error(`   IP: ${process.env.NODE_ENV === 'development' ? 'localhost' : 'production'}`)
    
    throw new Error('Invalid credentials. Please check your Class ID, Registry Number, and Password.')
  }

  // Clear throttling on successful login
  LoginThrottleService.recordSuccessfulAttempt(throttleIdentifier)

  // Create secure session
  await SecureStudentSessionService.createSession(studentSession)

  // Redirect to student dashboard
  redirect('/student')
}, 'student login')

export const studentLogout = withErrorHandling(async () => {
  await SecureStudentSessionService.destroySession()
  redirect('/login')
}, 'student logout')

export const clearInvalidSession = withErrorHandling(async () => {
  await SecureStudentSessionService.destroySession()
  // Don't redirect, just clear the session
}, 'clear invalid session')

export const updateStudentProfile = withStudentAuth(async (formData: FormData) => {
  const session = await SecureStudentSessionService.getSession()
  if (!session) {
    throw new Error('Not authenticated')
  }

  const missing = validateRequired(formData, ['current_password'])
  if (missing.length > 0) {
    throw new Error(`Missing required fields: ${missing.join(', ')}`)
  }

  const email = formData.get('email') as string
  const current_password = formData.get('current_password') as string
  const new_password = formData.get('new_password') as string

  const updateData: any = {}
  
  if (email !== session.email) {
    updateData.email = email
  }
  
  if (new_password) {
    updateData.password = new_password
  }
  
  if (current_password) {
    updateData.current_password = current_password
  }

  if (Object.keys(updateData).length <= 1) { // Only current_password
    throw new Error('No changes to save')
  }

  const result = await StudentAuthService.updateStudentProfile(session.student_id, updateData)

  if (!result.success) {
    throw new Error(result.error || 'Failed to update profile')
  }

  return { success: true }
}, 'update student profile')
