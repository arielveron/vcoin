'use server'

/**
 * Server Actions for Group Management
 * Following VCoin's NEW ENHANCED PATTERN with helper functions
 */

import { AdminService } from '@/services/admin-service'
import { CreateGroupRequest, GroupWithDetails } from '@/types/database'
import { 
  withAdminAuth, 
  validateRequired, 
  parseFormNumber,
  parseFormString,
  parseFormBoolean,
  parseFormNumberOptional,
  createActionSuccess,
  createActionError
} from '@/utils/server-actions'

const adminService = new AdminService()

export const createGroup = withAdminAuth(async (formData: FormData) => {
  try {
    const missing = validateRequired(formData, ['group_number', 'name', 'class_id'])
    if (missing.length > 0) {
      throw new Error(`Missing required fields: ${missing.join(', ')}`)
    }

    const group_number = parseFormNumber(formData, 'group_number')
    const name = parseFormString(formData, 'name')
    const class_id = parseFormNumber(formData, 'class_id')
    const is_enabled = parseFormBoolean(formData, 'is_enabled', true)

    const groupData: CreateGroupRequest = {
      group_number,
      name,
      class_id,
      is_enabled
    }

    const group = await adminService.createGroup(groupData)
    
    // Return the created group with complete details (following VCoin pattern)
    const allGroupsWithDetails = await adminService.getGroupsWithDetails()
    const groupWithDetails = allGroupsWithDetails.find(g => g.id === group.id)
    
    if (!groupWithDetails) {
      throw new Error('Failed to retrieve created group details')
    }
    
    return groupWithDetails
  } catch (error) {
    // Let withAdminAuth handle error wrapping
    throw error
  }
}, 'create group')

export const updateGroup = withAdminAuth(async (formData: FormData) => {
  try {
    const missing = validateRequired(formData, ['id'])
    if (missing.length > 0) {
      throw new Error(`Missing required fields: ${missing.join(', ')}`)
    }

    const id = parseFormNumber(formData, 'id')
    const group_number = parseFormNumberOptional(formData, 'group_number')
    const name = formData.get('name') ? parseFormString(formData, 'name') : undefined
    const class_id = parseFormNumberOptional(formData, 'class_id')
    const is_enabled = formData.has('is_enabled') ? parseFormBoolean(formData, 'is_enabled') : undefined

    const updates: Partial<CreateGroupRequest> = {}
    if (group_number !== null) updates.group_number = group_number
    if (name !== undefined) updates.name = name
    if (class_id !== null) updates.class_id = class_id
    if (is_enabled !== undefined) updates.is_enabled = is_enabled

    if (Object.keys(updates).length === 0) {
      throw new Error('No fields to update')
    }

    const group = await adminService.updateGroup(id, updates)
    if (!group) {
      throw new Error('Group not found')
    }

    // Ensure calculated fields have proper default values (VCoin pattern: clean data flow)
    const cleanGroup: GroupWithDetails = {
      ...group,
      calculated_average_vcoin_amount: group.calculated_average_vcoin_amount ?? 0,
      calculated_average_achievement_points: group.calculated_average_achievement_points ?? 0,
      calculated_at: group.calculated_at || null
    }
    
    return cleanGroup
  } catch (error) {
    // Let withAdminAuth handle error wrapping
    throw error
  }
}, 'update group')

export const deleteGroup = withAdminAuth(async (formData: FormData) => {
  try {
    const missing = validateRequired(formData, ['id'])
    if (missing.length > 0) {
      return createActionError(`Missing required fields: ${missing.join(', ')}`)
    }

    const id = parseFormNumber(formData, 'id')
    const success = await adminService.deleteGroup(id)
    
    if (!success) {
      return createActionError('Failed to delete group')
    }
    
    return createActionSuccess(
      { deletedId: id }, 
      'Group deleted successfully (students were removed from group)'
    )
  } catch (error) {
    return createActionError(
      error instanceof Error ? error.message : 'Failed to delete group'
    )
  }
}, 'delete group')

export const toggleGroupStatus = withAdminAuth(async (formData: FormData) => {
  try {
    const missing = validateRequired(formData, ['id'])
    if (missing.length > 0) {
      return createActionError(`Missing required fields: ${missing.join(', ')}`)
    }

    const id = parseFormNumber(formData, 'id')
    const group = await adminService.toggleGroupStatus(id)
    
    if (!group) {
      return createActionError('Group not found')
    }
    
    return createActionSuccess(
      group, 
      `Group ${group.is_enabled ? 'enabled' : 'disabled'} successfully`
    )
  } catch (error) {
    return createActionError(
      error instanceof Error ? error.message : 'Failed to toggle group status'
    )
  }
}, 'toggle group status')

export const addStudentsToGroup = withAdminAuth(async (formData: FormData) => {
  try {
    const missing = validateRequired(formData, ['group_id', 'student_ids'])
    if (missing.length > 0) {
      return createActionError(`Missing required fields: ${missing.join(', ')}`)
    }

    const group_id = parseFormNumber(formData, 'group_id')
    const student_ids_json = parseFormString(formData, 'student_ids')
    
    let student_ids: number[]
    try {
      student_ids = JSON.parse(student_ids_json)
    } catch {
      return createActionError('Invalid student_ids format (must be JSON array)')
    }

    if (!Array.isArray(student_ids) || student_ids.length === 0) {
      return createActionError('No students provided')
    }

    await adminService.addStudentsToGroup(group_id, student_ids)
    
    return createActionSuccess(
      { group_id, student_ids }, 
      `${student_ids.length} student(s) added to group successfully`
    )
  } catch (error) {
    return createActionError(
      error instanceof Error ? error.message : 'Failed to add students to group'
    )
  }
}, 'add students to group')

export const removeStudentsFromGroup = withAdminAuth(async (formData: FormData) => {
  try {
    const missing = validateRequired(formData, ['student_ids'])
    if (missing.length > 0) {
      return createActionError(`Missing required fields: ${missing.join(', ')}`)
    }

    const student_ids_json = parseFormString(formData, 'student_ids')
    
    let student_ids: number[]
    try {
      student_ids = JSON.parse(student_ids_json)
    } catch {
      return createActionError('Invalid student_ids format (must be JSON array)')
    }

    if (!Array.isArray(student_ids) || student_ids.length === 0) {
      return createActionError('No students provided')
    }

    await adminService.removeStudentsFromGroup(student_ids)
    
    return createActionSuccess(
      { student_ids }, 
      `${student_ids.length} student(s) removed from group successfully`
    )
  } catch (error) {
    return createActionError(
      error instanceof Error ? error.message : 'Failed to remove students from group'
    )
  }
}, 'remove students from group')

export const moveStudentsToGroup = withAdminAuth(async (formData: FormData) => {
  try {
    const missing = validateRequired(formData, ['student_ids', 'target_group_id'])
    if (missing.length > 0) {
      return createActionError(`Missing required fields: ${missing.join(', ')}`)
    }

    const target_group_id = parseFormNumber(formData, 'target_group_id')
    const student_ids_json = parseFormString(formData, 'student_ids')
    
    let student_ids: number[]
    try {
      student_ids = JSON.parse(student_ids_json)
    } catch {
      return createActionError('Invalid student_ids format (must be JSON array)')
    }

    if (!Array.isArray(student_ids) || student_ids.length === 0) {
      return createActionError('No students provided')
    }

    await adminService.moveStudentsToGroup(student_ids, target_group_id)
    
    return createActionSuccess(
      { target_group_id, student_ids }, 
      `${student_ids.length} student(s) moved to group successfully`
    )
  } catch (error) {
    return createActionError(
      error instanceof Error ? error.message : 'Failed to move students to group'
    )
  }
}, 'move students to group')
