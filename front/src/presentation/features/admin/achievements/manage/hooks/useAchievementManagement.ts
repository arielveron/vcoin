/**
 * Achievement Management Business Logic Hook
 * Centralizes CRUD operations and state management for achievements
 */

'use client'

import { useState } from 'react'
import type { Achievement } from '@/types/database'
import type { ActionResult } from '@/utils/admin-server-action-types'

interface UseAchievementManagementOptions {
  createAchievement: (formData: FormData) => Promise<ActionResult<Achievement>>
  updateAchievement: (formData: FormData) => Promise<ActionResult<Achievement | null>>
  deleteAchievement: (formData: FormData) => Promise<ActionResult<{ success: boolean; message: string }>>
  onCreateSuccess?: (achievement: Achievement) => void
  onUpdateSuccess?: (achievement: Achievement) => void
  onDeleteSuccess?: (id: number) => void
}

export function useAchievementManagement({
  createAchievement,
  updateAchievement,
  deleteAchievement,
  onCreateSuccess,
  onUpdateSuccess,
  onDeleteSuccess
}: UseAchievementManagementOptions) {
  const [editingAchievement, setEditingAchievement] = useState<Achievement | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleCreate = async (formData: FormData) => {
    setIsSubmitting(true)
    try {
      const result = await createAchievement(formData)
      if (result.success && result.data) {
        onCreateSuccess?.(result.data)
        alert('Achievement created successfully!')
      } else if (!result.success) {
        alert(result.error || 'Error creating achievement')
      }
    } catch (error) {
      console.error('Create achievement error:', error)
      alert('Error creating achievement: ' + (error instanceof Error ? error.message : 'Unknown error'))
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleUpdate = async (formData: FormData) => {
    if (!editingAchievement) return
    
    setIsSubmitting(true)
    try {
      formData.append('id', editingAchievement.id.toString())
      const result = await updateAchievement(formData)
      if (result.success && result.data) {
        onUpdateSuccess?.(result.data)
        alert('Achievement updated successfully!')
      } else if (!result.success) {
        alert(result.error || 'Error updating achievement')
      }
    } catch (error) {
      console.error('Update achievement error:', error)
      alert('Error updating achievement: ' + (error instanceof Error ? error.message : 'Unknown error'))
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this achievement?')) return
    
    try {
      const formData = new FormData()
      formData.append('id', id.toString())
      const result = await deleteAchievement(formData)
      if (result.success) {
        onDeleteSuccess?.(id)
        alert('Achievement deleted successfully!')
      } else if (!result.success) {
        alert(result.error || 'Error deleting achievement')
      }
    } catch (error) {
      console.error('Delete achievement error:', error)
      alert('Error deleting achievement: ' + (error instanceof Error ? error.message : 'Unknown error'))
    }
  }

  return {
    editingAchievement,
    setEditingAchievement,
    isSubmitting,
    handleCreate,
    handleUpdate,
    handleDelete
  }
}
