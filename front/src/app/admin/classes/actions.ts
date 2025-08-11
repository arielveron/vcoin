'use server'

import { AdminService } from '@/services/admin-service'
import { revalidatePath } from 'next/cache'
import { withAdminAuth, validateRequired, parseFormDate, parseFormNumber } from '@/utils/server-actions'

const adminService = new AdminService()

export const createClass = withAdminAuth(async (formData: FormData) => {
  const missing = validateRequired(formData, ['name', 'description', 'end_date', 'timezone'])
  if (missing.length > 0) {
    throw new Error(`Missing required fields: ${missing.join(', ')}`)
  }

  const name = formData.get('name') as string
  const description = formData.get('description') as string
  const end_date = parseFormDate(formData, 'end_date')
  const timezone = formData.get('timezone') as string

  const result = await adminService.createClass({
    name,
    description,
    end_date,
    timezone
  })
  
  revalidatePath('/admin/classes')
  return result
}, 'create class')

export const updateClass = withAdminAuth(async (formData: FormData) => {
  const missing = validateRequired(formData, ['id', 'name', 'description', 'end_date', 'timezone'])
  if (missing.length > 0) {
    throw new Error(`Missing required fields: ${missing.join(', ')}`)
  }

  const id = parseFormNumber(formData, 'id')
  const name = formData.get('name') as string
  const description = formData.get('description') as string
  const end_date = parseFormDate(formData, 'end_date')
  const timezone = formData.get('timezone') as string

  const result = await adminService.updateClass(id, {
    name,
    description,
    end_date,
    timezone
  })
  
  if (!result) {
    throw new Error('Failed to update class')
  }
  
  revalidatePath('/admin/classes')
  return result
}, 'update class')

export const deleteClass = withAdminAuth(async (formData: FormData) => {
  const id = parseFormNumber(formData, 'id')
  await adminService.deleteClass(id)
  revalidatePath('/admin/classes')
  return null // Standard null return for delete operations
}, 'delete class')
