/**
 * Class Form Component
 * Handles create/edit form with mobile-friendly modal design
 * Extracted from 294-line classes-admin-client.tsx
 */
'use client'

import { useState } from 'react'
import { X } from 'lucide-react'
import { Class, CreateClassRequest } from '@/types/database'
import { ClassesPageProps } from '@/utils/admin-server-action-types'

interface ClassFormProps {
  showForm: boolean
  editingClass: Class | null
  onClose: () => void
  onCreate: ClassesPageProps['createClass']
  onUpdate: ClassesPageProps['updateClass']
}

export default function ClassForm({
  showForm,
  editingClass,
  onClose,
  onCreate,
  onUpdate
}: ClassFormProps) {
  const [formData] = useState<CreateClassRequest>({
    name: editingClass?.name || '',
    description: editingClass?.description || '',
    end_date: editingClass?.end_date || new Date(),
    timezone: editingClass?.timezone || 'America/Argentina/Buenos_Aires'
  })

  const handleCreateClass = async (formData: FormData) => {
    try {
      const result = await onCreate(formData)
      if (result.success && result.data) {
        onClose()
        // Parent will handle state updates
        window.location.reload() // Simple refresh for now
      } else if (!result.success) {
        alert(result.error || 'Failed to create class')
      }
    } catch (error) {
      console.error('Error creating class:', error)
      alert('An error occurred while creating the class')
    }
  }

  const handleUpdateClass = async (formData: FormData) => {
    if (!editingClass) return

    try {
      // Add the ID to the form data
      formData.append('id', editingClass.id.toString())
      
      const result = await onUpdate(formData)
      if (result.success && result.data) {
        onClose()
        // Parent will handle state updates
        window.location.reload() // Simple refresh for now
      } else if (!result.success) {
        alert(result.error || 'Failed to update class')
      }
    } catch (error) {
      console.error('Error updating class:', error)
      alert('An error occurred while updating the class')
    }
  }

  if (!showForm) return null

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-0 lg:top-20 mx-auto p-0 lg:p-5 border w-full lg:w-96 h-full lg:h-auto shadow-lg lg:rounded-md bg-white">
        <div className="flex flex-col h-full lg:h-auto">
          {/* Mobile header */}
          <div className="flex items-center justify-between p-4 border-b lg:border-0">
            <h3 className="text-lg font-bold text-gray-900">
              {editingClass ? 'Edit Class' : 'Add New Class'}
            </h3>
            <button
              onClick={onClose}
              className="lg:hidden p-2 text-gray-400 hover:text-gray-600"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          
          {/* Form content with padding for mobile */}
          <form 
            action={editingClass ? handleUpdateClass : handleCreateClass} 
            className="flex-1 overflow-y-auto p-4 lg:p-0 space-y-4"
          >
            <div>
              <label className="block text-sm font-medium text-gray-700">Name</label>
              <input
                type="text"
                name="name"
                defaultValue={formData.name}
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-3 lg:py-2 text-base lg:text-sm"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700">Description</label>
              <textarea
                name="description"
                defaultValue={formData.description}
                rows={3}
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-3 lg:py-2 text-base lg:text-sm"
                placeholder="Optional description"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700">End Date</label>
              <input
                type="date"
                name="end_date"
                defaultValue={formData.end_date.toISOString().split('T')[0]}
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-3 lg:py-2 text-base lg:text-sm"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700">Timezone</label>
              <select
                name="timezone"
                defaultValue={formData.timezone}
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-3 lg:py-2 text-base lg:text-sm"
              >
                <option value="America/Argentina/Buenos_Aires">Argentina/Buenos Aires</option>
                <option value="America/New_York">US/Eastern</option>
                <option value="America/Los_Angeles">US/Pacific</option>
                <option value="Europe/London">Europe/London</option>
                <option value="Europe/Madrid">Europe/Madrid</option>
              </select>
            </div>
            
            {/* Form actions - Mobile-friendly */}
            <div className="flex flex-col lg:flex-row gap-3 pt-4 lg:pt-6">
              <button
                type="submit"
                className="w-full lg:flex-1 bg-indigo-600 hover:bg-indigo-700 text-white py-3 lg:py-2 px-4 rounded-md text-base lg:text-sm font-medium"
              >
                {editingClass ? 'Update Class' : 'Create Class'}
              </button>
              <button
                type="button"
                onClick={onClose}
                className="w-full lg:flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 py-3 lg:py-2 px-4 rounded-md text-base lg:text-sm font-medium"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
