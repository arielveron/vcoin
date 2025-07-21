'use client'

import { useState } from 'react'
import { Class, CreateClassRequest } from '@/types/database'
import { useRouter } from 'next/navigation'
import { createClass, updateClass, deleteClass } from '@/app/admin/classes/actions'
import { WithFormattedDates } from '@/utils/format-dates'

// Client-side version with formatted dates - using the hybrid approach
type ClassForClient = WithFormattedDates<Class, 'end_date' | 'created_at' | 'updated_at'>

interface ClassesAdminClientProps {
  initialClasses: ClassForClient[]
}

export default function ClassesAdminClient({ initialClasses }: ClassesAdminClientProps) {
  const [classes, setClasses] = useState<ClassForClient[]>(initialClasses)
  const [showForm, setShowForm] = useState(false)
  const [editingClass, setEditingClass] = useState<ClassForClient | null>(null)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState<CreateClassRequest>({
    name: '',
    description: '',
    end_date: new Date(),
    timezone: 'America/Argentina/Buenos_Aires'
  })
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    
    try {
      const formDataToSubmit = new FormData()
      formDataToSubmit.append('name', formData.name)
      formDataToSubmit.append('description', formData.description || '')
      formDataToSubmit.append('end_date', formData.end_date instanceof Date ? formData.end_date.toISOString().split('T')[0] : String(formData.end_date))
      formDataToSubmit.append('timezone', formData.timezone)

      let result
      if (editingClass) {
        formDataToSubmit.append('id', editingClass.id.toString())
        result = await updateClass(formDataToSubmit)
      } else {
        result = await createClass(formDataToSubmit)
      }

      if (!result.success) {
        alert(result.error || 'Error saving class. Please try again.')
        return
      }

      setShowForm(false)
      setEditingClass(null)
      setFormData({
        name: '',
        description: '',
        end_date: new Date(),
        timezone: 'America/Argentina/Buenos_Aires'
      })
      
      // Refresh the page to get updated data
      router.refresh()
    } catch (error) {
      console.error('Error saving class:', error)
      alert('Error saving class. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (classItem: ClassForClient) => {
    // Now we have both original dates AND formatted strings!
    setEditingClass(classItem) // ClassForClient extends Class, so this works
    setFormData({
      name: classItem.name,
      description: classItem.description || '',
      end_date: classItem.end_date, // Use original Date object
      timezone: classItem.timezone
    })
    setShowForm(true)
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this class?')) return

    setLoading(true)
    try {
      const formData = new FormData()
      formData.append('id', id.toString())
      
      const result = await deleteClass(formData)
      
      if (!result.success) {
        alert(result.error || 'Error deleting class. Please try again.')
        return
      }
      
      // Refresh the page to get updated data
      router.refresh()
    } catch (error) {
      console.error('Error deleting class:', error)
      alert('Error deleting class. Please try again.')
    } finally {
      setLoading(false)
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
          disabled={loading}
          className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white px-4 py-2 rounded-md text-sm font-medium"
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
                  {classItem.end_date_formatted}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {classItem.timezone}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <button
                    onClick={() => handleEdit(classItem)}
                    disabled={loading}
                    className="text-indigo-600 hover:text-indigo-900 disabled:text-indigo-400 mr-4"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(classItem.id)}
                    disabled={loading}
                    className="text-red-600 hover:text-red-900 disabled:text-red-400"
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
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                  required
                  disabled={loading}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                  rows={3}
                  disabled={loading}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">End Date</label>
                <input
                  type="date"
                  value={formData.end_date instanceof Date ? formData.end_date.toISOString().split('T')[0] : formData.end_date}
                  onChange={(e) => setFormData({ ...formData, end_date: new Date(e.target.value) })}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                  required
                  disabled={loading}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Timezone</label>
                <select
                  value={formData.timezone}
                  onChange={(e) => setFormData({ ...formData, timezone: e.target.value })}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                  required
                  disabled={loading}
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
                  disabled={loading}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 disabled:bg-gray-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 disabled:bg-indigo-400"
                >
                  {loading ? 'Saving...' : (editingClass ? 'Update' : 'Create')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
