'use client'

import { useState } from 'react'
import { Class, CreateClassRequest } from '@/types/database'
import { createClass, updateClass, deleteClass } from '@/app/admin/classes/actions'
import { formatDate } from '@/utils/format'
import ResponsiveTable from '@/components/admin/responsive-table'
import { Calendar, Edit, Trash2, X, Plus } from 'lucide-react'

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

  // Define columns for ResponsiveTable
  const columns = [
    {
      key: 'name',
      header: 'Name',
      render: (item: Class) => (
        <div className="font-medium text-gray-900">{item.name}</div>
      )
    },
    {
      key: 'description',
      header: 'Description',
      hideOnMobile: true,
      render: (item: Class) => item.description || '-'
    },
    {
      key: 'end_date',
      header: 'End Date',
      render: (item: Class) => (
        <div className="flex items-center space-x-2">
          <Calendar className="h-4 w-4 text-gray-400" />
          <span>{formatDate(item.end_date)}</span>
        </div>
      )
    },
    {
      key: 'timezone',
      header: 'Timezone',
      hideOnMobile: true
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (item: Class) => (
        <div className="flex space-x-2">
          <button
            onClick={() => handleEdit(item)}
            className="text-indigo-600 hover:text-indigo-900 p-1"
            aria-label="Edit class"
          >
            <Edit className="h-4 w-4" />
          </button>
          <button
            onClick={() => handleDelete(item.id)}
            className="text-red-600 hover:text-red-900 p-1"
            aria-label="Delete class"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      )
    }
  ]

  // Custom mobile card
  const mobileCard = (classItem: Class) => (
    <div>
      <div className="flex justify-between items-start mb-2">
        <h3 className="text-lg font-medium text-gray-900">{classItem.name}</h3>
        <div className="flex space-x-2">
          <button
            onClick={() => handleEdit(classItem)}
            className="text-indigo-600 p-1"
          >
            <Edit className="h-5 w-5" />
          </button>
          <button
            onClick={() => handleDelete(classItem.id)}
            className="text-red-600 p-1"
          >
            <Trash2 className="h-5 w-5" />
          </button>
        </div>
      </div>
      {classItem.description && (
        <p className="text-sm text-gray-600 mb-2">{classItem.description}</p>
      )}
      <div className="flex items-center text-sm text-gray-500">
        <Calendar className="h-4 w-4 mr-1" />
        <span>Ends: {formatDate(classItem.end_date)}</span>
      </div>
      <div className="text-xs text-gray-400 mt-1">
        {classItem.timezone}
      </div>
    </div>
  )

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 gap-4">
        <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">Classes Management</h1>
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
          className="flex items-center justify-center bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md text-sm font-medium min-h-[44px]"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add New Class
        </button>
      </div>

      {/* Responsive Classes Table */}
      <ResponsiveTable
        data={classes}
        columns={columns}
        mobileCard={mobileCard}
        emptyMessage="No classes found. Create your first class to get started."
      />

      {/* Form Modal - Mobile-friendly */}
      {showForm && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-0 lg:top-20 mx-auto p-0 lg:p-5 border w-full lg:w-96 h-full lg:h-auto shadow-lg lg:rounded-md bg-white">
            <div className="flex flex-col h-full lg:h-auto">
              {/* Mobile header */}
              <div className="flex items-center justify-between p-4 border-b lg:border-0">
                <h3 className="text-lg font-bold text-gray-900">
                  {editingClass ? 'Edit Class' : 'Add New Class'}
                </h3>
                <button
                  onClick={() => setShowForm(false)}
                  className="lg:hidden p-2 text-gray-400 hover:text-gray-600"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              
              {/* Form content with padding for mobile */}
              <form action={editingClass ? handleUpdateClass : handleCreateClass} 
                    className="flex-1 overflow-y-auto p-4 lg:p-0 space-y-4">
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
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-3 lg:py-2 text-base lg:text-sm"
                    rows={3}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">End Date</label>
                  <input
                    type="date"
                    name="end_date"
                    defaultValue={formData.end_date instanceof Date ? formData.end_date.toISOString().split('T')[0] : formData.end_date}
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
                    required
                  >
                    <option value="America/Argentina/Buenos_Aires">America/Argentina/Buenos_Aires</option>
                    <option value="America/Sao_Paulo">America/Sao_Paulo</option>
                    <option value="America/New_York">America/New_York</option>
                    <option value="Europe/Madrid">Europe/Madrid</option>
                  </select>
                </div>
                
                {/* Action buttons - full width on mobile */}
                <div className="flex flex-col-reverse lg:flex-row gap-2 lg:gap-3 pt-4 border-t lg:border-0">
                  <button
                    type="button"
                    onClick={() => setShowForm(false)}
                    className="w-full lg:w-auto px-4 py-3 lg:py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="w-full lg:w-auto px-4 py-3 lg:py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700"
                  >
                    {editingClass ? 'Update' : 'Create'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
