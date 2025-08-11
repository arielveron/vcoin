/**
 * Class Actions Component
 * Handles action buttons and operations
 * Extracted from 294-line classes-admin-client.tsx
 */
'use client'

import { Plus } from 'lucide-react'
import { ClassesPageProps } from '@/utils/admin-server-action-types'

interface ClassActionsProps {
  onCreateNew: () => void
  onDelete: ClassesPageProps['deleteClass']
}

export default function ClassActions({
  onCreateNew,
  onDelete
}: ClassActionsProps) {
  const handleDelete = async (classId: number) => {
    if (!confirm('Are you sure you want to delete this class? This action cannot be undone.')) {
      return
    }

    try {
      const formData = new FormData()
      formData.append('id', classId.toString())
      
      const result = await onDelete(formData)
      if (result.success) {
        // Parent will handle state updates
        window.location.reload() // Simple refresh for now
      } else if (!result.success) {
        alert(result.error || 'Failed to delete class')
      }
    } catch (error) {
      console.error('Error deleting class:', error)
      alert('An error occurred while deleting the class')
    }
  }

  return {
    // Export the handler for use by parent components
    handleDelete,
    
    // Action buttons component
    ActionButtons: () => (
      <div className="mb-6">
        <button
          onClick={onCreateNew}
          className="flex items-center justify-center bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md text-sm font-medium min-h-[44px]"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add New Class
        </button>
      </div>
    )
  }
}
