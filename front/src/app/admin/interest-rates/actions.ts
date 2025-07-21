'use server'

import { redirect } from 'next/navigation'
import { auth } from '@/auth'
import { AdminService } from '@/services/admin-service'
import { CreateInterestRateRequest } from '@/types/database'

const adminService = new AdminService()

export async function createInterestRate(formData: FormData) {
  const session = await auth()
  if (!session) {
    redirect('/admin/auth/signin')
  }

  try {
    const class_id = parseInt(formData.get('class_id') as string)
    const monthly_interest_rate = parseFloat(formData.get('monthly_interest_rate') as string) / 100 // Convert percentage to decimal
    const effective_date = new Date(formData.get('effective_date') as string)

    if (!class_id || isNaN(monthly_interest_rate) || !effective_date) {
      return { success: false, error: 'Missing required fields' }
    }

    const rateData: CreateInterestRateRequest = {
      class_id,
      monthly_interest_rate,
      effective_date
    }

    const rate = await adminService.createInterestRate(rateData)
    return { success: true, rate }
  } catch (error) {
    console.error('Error creating interest rate:', error)
    return { success: false, error: 'Failed to create interest rate' }
  }
}

export async function updateInterestRate(id: number, formData: FormData) {
  const session = await auth()
  if (!session) {
    redirect('/admin/auth/signin')
  }

  try {
    const class_id = parseInt(formData.get('class_id') as string)
    const monthly_interest_rate = parseFloat(formData.get('monthly_interest_rate') as string) / 100 // Convert percentage to decimal
    const effective_date = new Date(formData.get('effective_date') as string)

    if (!class_id || isNaN(monthly_interest_rate) || !effective_date) {
      return { success: false, error: 'Missing required fields' }
    }

    const rateData: Partial<CreateInterestRateRequest> = {
      class_id,
      monthly_interest_rate,
      effective_date
    }

    const rate = await adminService.updateInterestRate(id, rateData)
    return { success: true, rate }
  } catch (error) {
    console.error('Error updating interest rate:', error)
    return { success: false, error: 'Failed to update interest rate' }
  }
}

export async function deleteInterestRate(id: number) {
  const session = await auth()
  if (!session) {
    redirect('/admin/auth/signin')
  }

  try {
    await adminService.deleteInterestRate(id)
    return { success: true }
  } catch (error) {
    console.error('Error deleting interest rate:', error)
    return { success: false, error: 'Failed to delete interest rate' }
  }
}
