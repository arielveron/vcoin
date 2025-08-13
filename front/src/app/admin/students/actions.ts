'use server'

import { AdminService } from '@/services/admin-service'
import { StudentAuthService } from '@/services/student-auth-service'
import { CreateStudentRequest } from '@/types/database'
import { withAdminAuth, validateRequired, parseFormNumber } from '@/utils/server-actions'

const adminService = new AdminService()

export const createStudent = withAdminAuth(async (formData: FormData) => {
  const missing = validateRequired(formData, ['registro', 'name', 'class_id'])
  if (missing.length > 0) {
    throw new Error(`Missing required fields: ${missing.join(', ')}`)
  }

  const registro = parseFormNumber(formData, 'registro')
  const name = formData.get('name') as string
  const email = formData.get('email') as string
  const class_id = parseFormNumber(formData, 'class_id')

  const studentData: CreateStudentRequest = {
    registro,
    name,
    email,
    class_id
  }

  return await adminService.createStudent(studentData)
}, 'create student')

export const updateStudent = withAdminAuth(async (formData: FormData) => {
  const missing = validateRequired(formData, ['id', 'registro', 'name', 'class_id'])
  if (missing.length > 0) {
    throw new Error(`Missing required fields: ${missing.join(', ')}`)
  }

  const id = parseFormNumber(formData, 'id')
  const registro = parseFormNumber(formData, 'registro')
  const name = formData.get('name') as string
  const email = formData.get('email') as string
  const class_id = parseFormNumber(formData, 'class_id')

  const studentData: CreateStudentRequest = {
    registro,
    name,
    email,
    class_id
  }

  const updatedStudent = await adminService.updateStudent(id, studentData)
  
  if (!updatedStudent) {
    throw new Error('Student not found or update failed')
  }

  return updatedStudent
}, 'update student')

export const deleteStudent = withAdminAuth(async (formData: FormData) => {
  const missing = validateRequired(formData, ['id'])
  if (missing.length > 0) {
    throw new Error(`Missing required fields: ${missing.join(', ')}`)
  }

  const id = parseFormNumber(formData, 'id')
  await adminService.deleteStudent(id)
  return null
}, 'delete student')

export const setStudentPassword = withAdminAuth(async (formData: FormData) => {
  const missing = validateRequired(formData, ['student_id', 'password'])
  if (missing.length > 0) {
    throw new Error(`Missing required fields: ${missing.join(', ')}`)
  }

  const student_id = parseFormNumber(formData, 'student_id')
  const password = formData.get('password') as string

  if (password.length < 6) {
    throw new Error('Password must be at least 6 characters long')
  }

  const success = await StudentAuthService.setStudentPassword(student_id, password)
  
  if (!success) {
    throw new Error('Failed to set password')
  }

  return null
}, 'set student password')
