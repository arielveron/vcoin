'use server'

import { redirect } from 'next/navigation'
import { auth } from '@/auth'
import { AdminService } from '@/services/admin-service'
import { CreateStudentRequest } from '@/types/database'

const adminService = new AdminService()

export async function createStudent(formData: FormData) {
  const session = await auth()
  if (!session) {
    redirect('/admin/auth/signin')
  }

  try {
    const registro = parseInt(formData.get('registro') as string)
    const name = formData.get('name') as string
    const email = formData.get('email') as string
    const class_id = parseInt(formData.get('class_id') as string)

    if (!name || !registro || !class_id) {
      return { success: false, error: 'Missing required fields' }
    }

    const studentData: CreateStudentRequest = {
      registro,
      name,
      email,
      class_id
    }

    const student = await adminService.createStudent(studentData)
    return { success: true, student }
  } catch (error) {
    console.error('Error creating student:', error)
    return { success: false, error: 'Failed to create student' }
  }
}

export async function updateStudent(id: number, formData: FormData) {
  const session = await auth()
  if (!session) {
    redirect('/admin/auth/signin')
  }

  try {
    const registro = parseInt(formData.get('registro') as string)
    const name = formData.get('name') as string
    const email = formData.get('email') as string
    const class_id = parseInt(formData.get('class_id') as string)

    if (!name || !registro || !class_id) {
      return { success: false, error: 'Missing required fields' }
    }

    const studentData: CreateStudentRequest = {
      registro,
      name,
      email,
      class_id
    }

    const student = await adminService.updateStudent(id, studentData)
    return { success: true, student }
  } catch (error) {
    console.error('Error updating student:', error)
    return { success: false, error: 'Failed to update student' }
  }
}

export async function deleteStudent(id: number) {
  const session = await auth()
  if (!session) {
    redirect('/admin/auth/signin')
  }

  try {
    await adminService.deleteStudent(id)
    return { success: true }
  } catch (error) {
    console.error('Error deleting student:', error)
    return { success: false, error: 'Failed to delete student' }
  }
}
