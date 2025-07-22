'use client'

import { useState } from 'react'
import { InvestmentWithStudent, Student } from '@/types/database'
import { createInvestment, updateInvestment, deleteInvestment } from './actions'
import { useAdminFilters } from '@/hooks/useAdminFilters'
import FilterBadges from '@/app/admin/components/filter-badges'
import { formatCurrency } from '@/utils/format'
import { t } from '@/config/translations'
import { WithFormattedDates } from '@/utils/format-dates'

// Client-side types with formatted data
type InvestmentForClient = WithFormattedDates<InvestmentWithStudent, 'fecha' | 'created_at' | 'updated_at'> & {
  monto_formatted: string
}
type StudentForClient = WithFormattedDates<Student, 'created_at' | 'updated_at'>
type ClassForClient = WithFormattedDates<any, 'end_date' | 'created_at' | 'updated_at'> // Using any for now

interface InvestmentsAdminClientProps {
  investments: InvestmentForClient[]
  students: StudentForClient[]
  classes: ClassForClient[]
}

export default function InvestmentsAdminClient({ investments: initialInvestments, students, classes }: InvestmentsAdminClientProps) {
  const [investments, setInvestments] = useState(initialInvestments)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [editingInvestment, setEditingInvestment] = useState<InvestmentForClient | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { filters, updateFilters } = useAdminFilters()

  const handleCloseCreateForm = () => {
    setShowCreateForm(false)
    // Reset form by triggering a re-render
  }

  const handleCreateInvestment = async (formData: FormData) => {
    setIsSubmitting(true)
    try {
      const result = await createInvestment(formData)
      
      if (result.success && result.data) {
        setShowCreateForm(false)
        // Refresh the investments list - in a real app you'd want to properly update with student info
        window.location.reload()
      } else if (!result.success) {
        alert(result.error || 'Failed to create investment')
      }
    } catch (error) {
      console.error('Create investment error:', error)
      alert('Failed to create investment: ' + (error instanceof Error ? error.message : 'Unknown error'))
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleUpdateInvestment = async (formData: FormData) => {
    if (!editingInvestment) return
    
    try {
      const result = await updateInvestment(editingInvestment.id, formData)
      if (result.success) {
        // Refresh the investments list
        window.location.reload()
      } else if (!result.success) {
        alert(result.error || 'Failed to update investment')
      }
    } catch (error) {
      alert('Failed to update investment')
    }
  }

  const handleDeleteInvestment = async (id: number) => {
    if (!confirm('Are you sure you want to delete this investment?')) return
    
    try {
      const result = await deleteInvestment(id)
      if (result.success) {
        setInvestments(investments.filter(inv => inv.id !== id))
      } else if (!result.success) {
        alert(result.error || 'Failed to delete investment')
      }
    } catch (error) {
      alert('Failed to delete investment')
    }
  }

  const totalInvestments = investments.reduce((sum, inv) => sum + inv.monto, 0)

  // Filter investments based on current filters
  const filteredInvestments = investments.filter(investment => {
    if (filters.classId) {
      const student = students.find(s => s.id === investment.student_id)
      if (!student || student.class_id !== filters.classId) return false
    }
    if (filters.studentId && investment.student_id !== filters.studentId) return false
    return true
  })

  // Filter students based on selected class
  const filteredStudents = filters.classId 
    ? students.filter(student => student.class_id === filters.classId)
    : students

  return (
    <div className="space-y-6">
      {/* Filter Badges */}
      <FilterBadges classes={classes} students={students} />

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500">Total Investments</h3>
          <p className="text-3xl font-bold text-blue-600">{filteredInvestments.length}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500">Total Amount</h3>
          <p className="text-3xl font-bold text-green-600">{formatCurrency(filteredInvestments.reduce((sum, inv) => sum + inv.monto, 0))}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500">Average Investment</h3>
          <p className="text-3xl font-bold text-purple-600">
            {filteredInvestments.length > 0 ? formatCurrency(filteredInvestments.reduce((sum, inv) => sum + inv.monto, 0) / filteredInvestments.length) : '$0,00'}
          </p>
        </div>
      </div>

      {/* Header with Create Button */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">All Investments</h2>
          <p className="text-gray-600">Manage student investment records</p>
        </div>
        <div className="flex gap-2">
          <select
            value={filters.classId || ''}
            onChange={(e) => updateFilters({ classId: e.target.value ? parseInt(e.target.value) : null })}
            className="rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          >
            <option value="">All Classes</option>
            {classes.map((cls) => (
              <option key={cls.id} value={cls.id}>
                {cls.name}
              </option>
            ))}
          </select>
          {filters.classId && (
            <select
              value={filters.studentId || ''}
              onChange={(e) => updateFilters({ studentId: e.target.value ? parseInt(e.target.value) : null })}
              className="rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            >
              <option value="">All Students</option>
              {filteredStudents.map((student) => (
                <option key={student.id} value={student.id}>
                  {student.name} (Registry: {student.registro})
                </option>
              ))}
            </select>
          )}
          <button
            onClick={() => setShowCreateForm(true)}
            className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
          >
            Add New Investment
          </button>
        </div>
      </div>

      {/* Create Form */}
      {showCreateForm && (
        <div className="bg-white p-6 rounded-lg shadow border">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Create New Investment</h3>
          <form key={`create-${filters.studentId || 'all'}`} action={handleCreateInvestment} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="student_id" className="block text-sm font-medium text-gray-700">
                  Student
                </label>
                <select
                  id="student_id"
                  name="student_id"
                  required
                  defaultValue={filters.studentId ? filters.studentId.toString() : ''}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                >
                  <option value="">Select a student</option>
                  {filteredStudents.map((student) => (
                    <option key={student.id} value={student.id}>
                      {student.name} (Registry: {student.registro})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="fecha" className="block text-sm font-medium text-gray-700">
                  Date
                </label>
                <input
                  type="date"
                  id="fecha"
                  name="fecha"
                  required
                  defaultValue={new Date().toLocaleDateString('en-CA')}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label htmlFor="monto" className="block text-sm font-medium text-gray-700">
                  Amount
                </label>
                <input
                  type="number"
                  id="monto"
                  name="monto"
                  required
                  min="0.01"
                  step="0.01"
                  placeholder="0.00"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label htmlFor="concepto" className="block text-sm font-medium text-gray-700">
                  Concept
                </label>
                <input
                  type="text"
                  id="concepto"
                  name="concepto"
                  required
                  maxLength={255}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  placeholder="e.g., Final exam, Homework assignment"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Creating...' : 'Create Investment'}
              </button>
              <button
                type="button"
                onClick={handleCloseCreateForm}
                className="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Edit Form */}
      {editingInvestment && (
        <div className="bg-white p-6 rounded-lg shadow border">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Edit Investment</h3>
          <form action={handleUpdateInvestment} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="edit-student_id" className="block text-sm font-medium text-gray-700">
                  Student
                </label>
                <select
                  id="edit-student_id"
                  name="student_id"
                  defaultValue={editingInvestment.student_id}
                  required
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                >
                  {students.map((student) => (
                    <option key={student.id} value={student.id}>
                      {student.name} (Registry: {student.registro})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="edit-fecha" className="block text-sm font-medium text-gray-700">
                  Date
                </label>
                <input
                  type="date"
                  id="edit-fecha"
                  name="fecha"
                  defaultValue={new Date(editingInvestment.fecha).toISOString().split('T')[0]}
                  required
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label htmlFor="edit-monto" className="block text-sm font-medium text-gray-700">
                  Amount
                </label>
                <input
                  type="number"
                  id="edit-monto"
                  name="monto"
                  defaultValue={editingInvestment.monto}
                  required
                  min="0"
                  step="0.01"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label htmlFor="edit-concepto" className="block text-sm font-medium text-gray-700">
                  Concept
                </label>
                <input
                  type="text"
                  id="edit-concepto"
                  name="concepto"
                  defaultValue={editingInvestment.concepto}
                  required
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <button
                type="submit"
                className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
              >
                Update Investment
              </button>
              <button
                type="button"
                onClick={() => setEditingInvestment(null)}
                className="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Investments Table */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Student
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Amount
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Concept
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredInvestments.map((investment) => (
              <tr key={investment.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div>
                    <div className="text-sm font-medium text-gray-900">
                      {investment.student_name}
                    </div>
                    <div className="text-sm text-gray-500">{investment.class_name}</div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {investment.fecha_formatted}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {investment.monto_formatted}
                </td>
                <td className="px-6 py-4 text-sm text-gray-900">
                  {investment.concepto}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <button
                    onClick={() => setEditingInvestment(investment)}
                    className="text-indigo-600 hover:text-indigo-900 mr-3"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeleteInvestment(investment.id)}
                    className="text-red-600 hover:text-red-900"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filteredInvestments.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No investments found. Create your first investment above.
          </div>
        )}
      </div>
    </div>
  )
}
