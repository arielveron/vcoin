'use client'

import { useState } from 'react'
import { Class, CreateClassRequest } from '@/types/database'
import { createClass, updateClass, deleteClass } from '@/app/admin/classes/actions'
import { formatDate } from '@/utils/format'

interface ClassesAdminClientProps {
  initialClasses: Class[]
}

export default function ClassesAdminClient({ initialClasses }: ClassesAdminClientProps) {
  const [classes, setClasses] = useState<Class[]>(initialClasses)
  const [showForm, setShowForm] = useState(false)
  const [editingClass, setEditingClass] = useState<Class | null>(null)
  const [formData, setFormData] = useState<CreateClassRequest>({
    name: '',
    description: '',
    end_date: new Date(),
    timezone: 'America/Argentina/Buenos_Aires'
  })

  const handleEdit = (classItem: Class) => {
    setEditingClass(classItem)
    setFormData({
      name: classItem.name,
      description: classItem.description || '',
      end_date: classItem.end_date,
      timezone: classItem.timezone
    })
    setShowForm(true)
  }

  const handleCreateClass = async (formData: FormData) => {
    try {
      const result = await createClass(formData)
      if (result.success && result.data) {
        setClasses([...classes, result.data])
        setShowForm(false)
        setEditingClass(null)
        setFormData({
          name: '',
          description: '',
          end_date: new Date(),
          timezone: 'America/Argentina/Buenos_Aires'
        })
      } else if (!result.success) {
        alert(result.error || 'Failed to create class')
      }
    } catch {
      alert('Failed to create class')
    }
  }

  const handleUpdateClass = async (formData: FormData) => {
    if (!editingClass) return
    
    try {
      console.log('Submitting update for class:', editingClass.id)
      const result = await updateClass(editingClass.id, formData)
      console.log('Update result:', result)
      
      if (result.success && result.data) {
        setClasses(classes.map(c => 
          c.id === editingClass.id ? result.data! : c
        ))
        setShowForm(false)
        setEditingClass(null)
        setFormData({
          name: '',
          description: '',
          end_date: new Date(),
          timezone: 'America/Argentina/Buenos_Aires'
        })
      } else if (!result.success) {
        alert(result.error || 'Failed to update class')
      }
    } catch (error) {
      console.error('Error updating class:', error)
      alert('Failed to update class')
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this class?')) return

    try {
      const result = await deleteClass(id)
      
      if (result.success) {
        setClasses(classes.filter(c => c.id !== id))
      } else if (!result.success) {
        alert(result.error || 'Failed to delete class')
      }
    } catch {
      alert('Failed to delete class')
    }
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Classes Management</h1>
        <button
          onClick={() => {
            setShowForm(true)
            setEditingClass(null)
            setFormData({
              name: '',
              description: '',
              end_date: new Date(),
              timezone: 'America/Argentina/Buenos_Aires'
            })
          }}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md text-sm font-medium"
        >
          Add New Class
        </button>
      </div>

      {/* Classes Table */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Description
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                End Date
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Timezone
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {classes.map((classItem) => (
              <tr key={classItem.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {classItem.name}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {classItem.description}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {formatDate(classItem.end_date)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {classItem.timezone}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <button
                    onClick={() => handleEdit(classItem)}
                    className="text-indigo-600 hover:text-indigo-900 mr-4"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(classItem.id)}
                    className="text-red-600 hover:text-red-900"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <h3 className="text-lg font-bold text-gray-900 mb-4">
              {editingClass ? 'Edit Class' : 'Add New Class'}
            </h3>
            <form action={editingClass ? handleUpdateClass : handleCreateClass} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Name</label>
                <input
                  type="text"
                  name="name"
                  defaultValue={formData.name}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Description</label>
                <textarea
                  name="description"
                  defaultValue={formData.description}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                  rows={3}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">End Date</label>
                <input
                  type="date"
                  name="end_date"
                  defaultValue={formData.end_date instanceof Date ? formData.end_date.toISOString().split('T')[0] : formData.end_date}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Timezone</label>
                <select
                  name="timezone"
                  defaultValue={formData.timezone}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                  required
                >
                  <option value="America/Argentina/Buenos_Aires">America/Argentina/Buenos_Aires</option>
                  <option value="America/Sao_Paulo">America/Sao_Paulo</option>
                  <option value="America/New_York">America/New_York</option>
                  <option value="Europe/Madrid">Europe/Madrid</option>
                </select>
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700"
                >
                  {editingClass ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
