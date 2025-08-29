/**
 * GroupForm Component
 * Form component for creating and editing groups
 * Following students pattern with server action handling
 */
'use client'

import { useState } from 'react'
import type { GroupWithDetails } from '@/types/database'
import type { ActionResult } from '@/utils/server-actions'
import type { ClassForClient, GroupWithDetailsForClient } from '@/utils/admin-data-types'

interface GroupFormProps {
  classes: ClassForClient[]
  editingGroup?: GroupWithDetailsForClient | null
  preSelectedClassId?: number
  createGroup: (formData: FormData) => Promise<ActionResult<GroupWithDetails>>
  updateGroup: (formData: FormData) => Promise<ActionResult<GroupWithDetails>>
  onSuccess: (group: GroupWithDetails) => void
  onCancel: () => void
}

export default function GroupForm({
  classes,
  editingGroup,
  preSelectedClassId,
  createGroup,
  updateGroup,
  onSuccess,
  onCancel
}: GroupFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    
    setIsSubmitting(true)
    try {
      let result: ActionResult<GroupWithDetails>
      
      if (editingGroup) {
        // Include the group ID in the FormData for update
        formData.set('id', editingGroup.id.toString())
        result = await updateGroup(formData)
      } else {
        result = await createGroup(formData)
      }
      
      if (result.success && result.data) {
        onSuccess(result.data)
        alert(editingGroup ? 'Group updated successfully!' : 'Group created successfully!')
      } else if (!result.success) {
        alert(result.error || (editingGroup ? 'Error updating group' : 'Error creating group'))
      }
    } catch (error) {
      console.error('Group form error:', error)
      alert('Error: ' + (error instanceof Error ? error.message : 'Unknown error'))
    } finally {
      setIsSubmitting(false)
    }
  }

  const defaultClassId = editingGroup?.class_id || preSelectedClassId || ''

  return (
    <div className="bg-white rounded-lg shadow-lg max-w-md w-full">
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-medium text-gray-900">
          {editingGroup ? 'Edit Group' : 'Create New Group'}
        </h3>
      </div>

      <form onSubmit={handleSubmit} className="p-6 space-y-4">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
            Group Name *
          </label>
          <input
            type="text"
            id="name"
            name="name"
            defaultValue={editingGroup?.name || ''}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Enter group name"
            disabled={isSubmitting}
          />
        </div>

        <div>
          <label htmlFor="group_number" className="block text-sm font-medium text-gray-700 mb-1">
            Group Number *
          </label>
          <input
            type="number"
            id="group_number"
            name="group_number"
            defaultValue={editingGroup?.group_number || ''}
            required
            min="1"
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Enter group number"
            disabled={isSubmitting}
          />
        </div>

        <div>
          <label htmlFor="class_id" className="block text-sm font-medium text-gray-700 mb-1">
            Class *
          </label>
          <select
            id="class_id"
            name="class_id"
            defaultValue={defaultClassId}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            disabled={isSubmitting}
          >
            <option value="">Select a class</option>
            {classes.map((cls) => (
              <option key={cls.id} value={cls.id}>
                {cls.name}
              </option>
            ))}
          </select>
        </div>



        <div className="flex items-center">
          <input
            type="checkbox"
            id="is_enabled"
            name="is_enabled"
            defaultChecked={editingGroup?.is_enabled ?? true}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            disabled={isSubmitting}
          />
          <label htmlFor="is_enabled" className="ml-2 block text-sm text-gray-700">
            Group is enabled
          </label>
        </div>

        {/* Hidden field for group ID when editing */}
        {editingGroup && (
          <input type="hidden" name="id" value={editingGroup.id} />
        )}

        <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md shadow-sm hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
            disabled={isSubmitting}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <div className="flex items-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                {editingGroup ? 'Updating...' : 'Creating...'}
              </div>
            ) : (
              editingGroup ? 'Update Group' : 'Create Group'
            )}
          </button>
        </div>
      </form>
    </div>
  )
}
