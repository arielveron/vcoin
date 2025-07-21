'use server'

import { redirect } from 'next/navigation'
import { auth } from '@/auth'
import { AdminService } from '@/services/admin-service'
import { CreateInvestmentRequest } from '@/types/database'

const adminService = new AdminService()

export async function createInvestment(formData: FormData) {
  const session = await auth()
  if (!session) {
    redirect('/admin/auth/signin')
  }

  try {
    const student_id = parseInt(formData.get('student_id') as string)
    const fecha = new Date(formData.get('fecha') as string)
    const monto = parseFloat(formData.get('monto') as string)
    const concepto = formData.get('concepto') as string

    if (!student_id || !fecha || !monto || !concepto) {
      return { success: false, error: 'Missing required fields' }
    }

    const investmentData: CreateInvestmentRequest = {
      student_id,
      fecha,
      monto,
      concepto
    }

    const investment = await adminService.createInvestment(investmentData)
    return { success: true, investment }
  } catch (error) {
    console.error('Error creating investment:', error)
    return { success: false, error: 'Failed to create investment' }
  }
}

export async function updateInvestment(id: number, formData: FormData) {
  const session = await auth()
  if (!session) {
    redirect('/admin/auth/signin')
  }

  try {
    const student_id = parseInt(formData.get('student_id') as string)
    const fecha = new Date(formData.get('fecha') as string)
    const monto = parseFloat(formData.get('monto') as string)
    const concepto = formData.get('concepto') as string

    if (!student_id || !fecha || !monto || !concepto) {
      return { success: false, error: 'Missing required fields' }
    }

    const investmentData: CreateInvestmentRequest = {
      student_id,
      fecha,
      monto,
      concepto
    }

    const investment = await adminService.updateInvestment(id, investmentData)
    return { success: true, investment }
  } catch (error) {
    console.error('Error updating investment:', error)
    return { success: false, error: 'Failed to update investment' }
  }
}

export async function deleteInvestment(id: number) {
  const session = await auth()
  if (!session) {
    redirect('/admin/auth/signin')
  }

  try {
    await adminService.deleteInvestment(id)
    return { success: true }
  } catch (error) {
    console.error('Error deleting investment:', error)
    return { success: false, error: 'Failed to delete investment' }
  }
}
