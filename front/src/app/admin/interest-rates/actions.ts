'use server'

import { AdminService } from '@/services/admin-service'
import { CreateInterestRateRequest } from '@/types/database'
import { withAdminAuth, validateRequired, parseFormNumber, parseFormFloat, parseFormDate } from '@/utils/server-actions'

const adminService = new AdminService()

export const createInterestRate = withAdminAuth(async (formData: FormData) => {
  const missing = validateRequired(formData, ['class_id', 'monthly_interest_rate', 'effective_date'])
  if (missing.length > 0) {
    throw new Error(`Missing required fields: ${missing.join(', ')}`)
  }

  const class_id = parseFormNumber(formData, 'class_id')
  const monthly_interest_rate = parseFormFloat(formData, 'monthly_interest_rate') / 100 // Convert percentage to decimal
  const effective_date = parseFormDate(formData, 'effective_date')

  const rateData: CreateInterestRateRequest = {
    class_id,
    monthly_interest_rate,
    effective_date
  }

  return await adminService.createInterestRate(rateData)
}, 'create interest rate')

export const updateInterestRate = withAdminAuth(async (id: number, formData: FormData) => {
  const missing = validateRequired(formData, ['class_id', 'monthly_interest_rate', 'effective_date'])
  if (missing.length > 0) {
    throw new Error(`Missing required fields: ${missing.join(', ')}`)
  }

  const class_id = parseFormNumber(formData, 'class_id')
  const monthly_interest_rate = parseFormFloat(formData, 'monthly_interest_rate') / 100 // Convert percentage to decimal
  const effective_date = parseFormDate(formData, 'effective_date')

  const rateData: Partial<CreateInterestRateRequest> = {
    class_id,
    monthly_interest_rate,
    effective_date
  }

  return await adminService.updateInterestRate(id, rateData)
}, 'update interest rate')

export const deleteInterestRate = withAdminAuth(async (id: number) => {
  return await adminService.deleteInterestRate(id)
}, 'delete interest rate')
