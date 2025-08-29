/**
 * GroupForm Component
 * Form component for creating and editing groups
 */
'use client'

import type { ClassForClient, GroupWithDetailsForClient } from '@/utils/admin-data-types'
import type { GroupWithDetails } from '@/types/database'
import type { ActionResult } from '@/utils/server-actions'
import { useServerAction } from '@/presentation/hooks'

interface GroupFormProps {
  classes: ClassForClient[]
  group?: GroupWithDetailsForClient | null
  onSubmit: (formData: FormData) => Promise<ActionResult<GroupWithDetails>>
  onSuccess: (group: GroupWithDetails) => void
  onCancel: () => void
  preSelectedClassId?: number
}

export default function GroupForm({
  classes,
  group,
  onSubmit,
  onSuccess,
  onCancel,
  preSelectedClassId
}: GroupFormProps) {
  const { execute, loading } = useServerAction(onSubmit)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    
    const result = await execute(formData)
    if (result?.success && result?.data) {
      onSuccess(result.data)
    } else {
      alert(result?.error || (group ? 'Error al actualizar grupo' : 'Error al crear grupo'))
    }
  }

  const defaultClassId = group?.class_id || preSelectedClassId || ''

  return (
    <div className="bg-white rounded-lg shadow-lg max-w-md w-full">
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-medium text-gray-900">
          {group ? 'Edit Group' : 'Create New Group'}
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
            defaultValue={group?.name || ''}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Enter group name"
            disabled={loading}
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
            defaultValue={group?.group_number || ''}
            required
            min="1"
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Enter group number"
            disabled={loading}
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
            disabled={loading}
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
            defaultChecked={group?.is_enabled ?? true}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            disabled={loading}
          />
          <label htmlFor="is_enabled" className="ml-2 block text-sm text-gray-700">
            Group is enabled
          </label>
        </div>

        {/* Hidden field for group ID when editing */}
        {group && (
          <input type="hidden" name="id" value={group.id} />
        )}

        <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md shadow-sm hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
            disabled={loading}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <div className="flex items-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                {group ? 'Updating...' : 'Creating...'}
              </div>
            ) : (
              group ? 'Update Group' : 'Create Group'
            )}
          </button>
        </div>
      </form>
    </div>
  )
}
