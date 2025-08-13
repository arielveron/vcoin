'use server'

import { AdminService } from '@/services/admin-service'
import { CreateInvestmentRequest, CreateBatchInvestmentRequest, BatchInvestmentRow } from '@/types/database'
import { withAdminAuth, validateRequired, parseFormNumber, parseFormFloat, parseFormDate } from '@/utils/server-actions'
import { AchievementEngine } from '@/services/achievement-engine'

const adminService = new AdminService()
const achievementEngine = new AchievementEngine()

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

  // Create the investment
  const investment = await adminService.createInvestment(investmentData)
  
  // Check achievements for the student (non-blocking)
  try {
    await achievementEngine.checkAchievementsForStudent(student_id, investment.id)
  } catch (error) {
    // Don't fail the investment creation if achievement checking fails
    console.error('Achievement checking failed:', error)
  }
  
  return investment
}, 'create investment')

export const updateInvestment = withAdminAuth(async (formData: FormData) => {
  const missing = validateRequired(formData, ['id', 'student_id', 'fecha', 'monto', 'concepto'])
  if (missing.length > 0) {
    throw new Error(`Missing required fields: ${missing.join(', ')}`)
  }

  const id = parseFormNumber(formData, 'id')
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

  // Update the investment
  const investment = await adminService.updateInvestment(id, investmentData)
  
  // Check achievements for the student after update (non-blocking)
  try {
    await achievementEngine.checkAchievementsForStudent(student_id, id)
  } catch (error) {
    // Don't fail the investment update if achievement checking fails
    console.error('Achievement checking failed:', error)
  }
  
  return investment
}, 'update investment')

export const deleteInvestment = withAdminAuth(async (formData: FormData) => {
  const missing = validateRequired(formData, ['id'])
  if (missing.length > 0) {
    throw new Error(`Missing required fields: ${missing.join(', ')}`)
  }

  const id = parseFormNumber(formData, 'id')
  await adminService.deleteInvestment(id)
  return null // Standard null return for delete operations
}, 'delete investment')

export const createBatchInvestments = withAdminAuth(async (formData: FormData) => {
  const missing = validateRequired(formData, ['fecha', 'concepto', 'investments'])
  if (missing.length > 0) {
    throw new Error(`Missing required fields: ${missing.join(', ')}`)
  }

  const fecha = parseFormDate(formData, 'fecha')
  const concepto = formData.get('concepto') as string
  const category_id = formData.get('category_id') ? parseFormNumber(formData, 'category_id') : undefined
  
  // Parse investments JSON data
  const investmentsJson = formData.get('investments') as string
  let investments: BatchInvestmentRow[]
  
  try {
    investments = JSON.parse(investmentsJson)
  } catch {
    throw new Error('Invalid investments data format')
  }

  if (!Array.isArray(investments) || investments.length === 0) {
    throw new Error('No investments provided')
  }

  // Validate each investment
  for (const investment of investments) {
    if (!investment.student_id || !investment.monto) {
      throw new Error('Each investment must have student_id and monto')
    }
  }

  const batchData: CreateBatchInvestmentRequest = {
    fecha,
    concepto,
    category_id,
    investments
  }

  // Create the batch investments
  const result = await adminService.createBatchInvestments(batchData)
  
  // Check achievements for all students (non-blocking)
  try {
    for (const investment of investments) {
      await achievementEngine.checkAchievementsForStudent(investment.student_id)
    }
  } catch (error) {
    // Don't fail the batch creation if achievement checking fails
    console.error('Achievement checking failed:', error)
  }
  
  return result
}, 'create batch investments')

export const getStudentsForBatch = withAdminAuth(async (formData: FormData) => {
  const missing = validateRequired(formData, ['class_id', 'fecha', 'concepto', 'category_id'])
  if (missing.length > 0) {
    throw new Error(`Missing required fields: ${missing.join(', ')}`)
  }

  const classId = parseFormNumber(formData, 'class_id')
  const fecha = parseFormDate(formData, 'fecha')
  const concepto = formData.get('concepto') as string
  const categoryId = parseFormNumber(formData, 'category_id')

  return await adminService.getStudentsAvailableForBatchInvestment(classId, fecha, concepto, categoryId)
}, 'get students for batch investment')
