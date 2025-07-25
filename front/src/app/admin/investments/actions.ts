'use server'

import { AdminService } from '@/services/admin-service'
import { CreateInvestmentRequest } from '@/types/database'
import { withAdminAuth, validateRequired, parseFormNumber, parseFormFloat, parseFormDate } from '@/utils/server-actions'

const adminService = new AdminService()

export const createInvestment = withAdminAuth(async (formData: FormData) => {
  const missing = validateRequired(formData, ['student_id', 'fecha', 'monto', 'concepto'])
  if (missing.length > 0) {
    throw new Error(`Missing required fields: ${missing.join(', ')}`)
  }

  const student_id = parseFormNumber(formData, 'student_id')
  const fecha = parseFormDate(formData, 'fecha')
  const monto = parseFormFloat(formData, 'monto')
  const concepto = formData.get('concepto') as string
  const category_id = formData.get('category_id') ? parseFormNumber(formData, 'category_id') : undefined

  const investmentData: CreateInvestmentRequest = {
    student_id,
    fecha,
    monto,
    concepto,
    category_id
  }

  return await adminService.createInvestment(investmentData)
}, 'create investment')

export const updateInvestment = withAdminAuth(async (id: number, formData: FormData) => {
  const missing = validateRequired(formData, ['student_id', 'fecha', 'monto', 'concepto'])
  if (missing.length > 0) {
    throw new Error(`Missing required fields: ${missing.join(', ')}`)
  }

  const student_id = parseFormNumber(formData, 'student_id')
  const fecha = parseFormDate(formData, 'fecha')
  const monto = parseFormFloat(formData, 'monto')
  const concepto = formData.get('concepto') as string

  const investmentData: CreateInvestmentRequest = {
    student_id,
    fecha,
    monto,
    concepto
  }

  return await adminService.updateInvestment(id, investmentData)
}, 'update investment')

export const deleteInvestment = withAdminAuth(async (id: number) => {
  return await adminService.deleteInvestment(id)
}, 'delete investment')
