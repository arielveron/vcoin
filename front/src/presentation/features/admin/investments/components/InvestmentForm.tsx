/**
 * Investment Form Component
 * Handles creation and editing of investments
 */
'use client'

import { X } from 'lucide-react'
import type { Student, InvestmentCategory, InvestmentWithStudent } from '@/types/database'
import { useServerAction } from '@/presentation/hooks'
import type { ActionResult } from '@/utils/server-actions'
import { toDBDateValue, getTodayInputValue } from '@/shared/utils/formatting/date'

interface InvestmentFormProps {
  students: Student[]
  categories: InvestmentCategory[]
  isOpen: boolean
  onClose: () => void
  onSubmit: (formData: FormData) => Promise<ActionResult<InvestmentWithStudent | null>>
  editingInvestment?: {
    id: number
    student_id: number
    fecha: Date
    monto: number
    concepto: string
    category_id?: number
  } | null
  classId?: number | null
  studentId?: number | null
}

export default function InvestmentForm({
  students,
  categories,
  isOpen,
  onClose,
  onSubmit,
  editingInvestment,
  classId,
  studentId
}: InvestmentFormProps) {
  const { execute, loading } = useServerAction(onSubmit)

  const handleFormSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const result = await execute(formData)
    
    if (result?.success) {
      onClose()
    } else {
      alert(result?.error || 'Failed to save investment')
    }
  }

  // Filter students by class if a class filter is active
  const filteredStudents = classId 
    ? students.filter(student => student.class_id === classId)
    : students

  if (!isOpen) return null

  const formTitle = editingInvestment ? 'Edit Investment' : 'Add New Investment'
  const submitText = editingInvestment ? 'Update Investment' : 'Create Investment'

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-full max-w-2xl shadow-lg rounded-md bg-white">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-900">{formTitle}</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
            disabled={loading}
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleFormSubmit} className="space-y-4">
          {editingInvestment && (
            <input type="hidden" name="id" value={editingInvestment.id} />
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Student Selection */}
            <div>
              <label htmlFor="student_id" className="block text-sm font-medium text-gray-700">
                Student *
              </label>
              <select
                id="student_id"
                name="student_id"
                required
                defaultValue={
                  editingInvestment?.student_id?.toString() || 
                  studentId?.toString() || 
                  ''
                }
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 py-3 lg:py-2"
              >
                <option value="">Select a student</option>
                {filteredStudents.map((student) => (
                  <option key={student.id} value={student.id}>
                    {student.name} (Registry: {student.registro})
                  </option>
                ))}
              </select>
            </div>

            {/* Date */}
            <div>
              <label htmlFor="fecha" className="block text-sm font-medium text-gray-700">
                Date *
              </label>
              <input
                type="date"
                id="fecha"
                name="fecha"
                required
                defaultValue={
                  editingInvestment 
                    ? toDBDateValue(editingInvestment.fecha)
                    : getTodayInputValue()
                }
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 py-3 lg:py-2"
              />
            </div>

            {/* Amount */}
            <div>
              <label htmlFor="monto" className="block text-sm font-medium text-gray-700">
                Amount *
              </label>
              <input
                type="number"
                id="monto"
                name="monto"
                required
                min="0.01"
                step="0.01"
                placeholder="0.00"
                defaultValue={editingInvestment?.monto || ''}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 py-3 lg:py-2"
              />
            </div>

            {/* Concept */}
            <div>
              <label htmlFor="concepto" className="block text-sm font-medium text-gray-700">
                Concept *
              </label>
              <input
                type="text"
                id="concepto"
                name="concepto"
                required
                maxLength={255}
                placeholder="e.g., Final exam, Homework assignment"
                defaultValue={editingInvestment?.concepto || ''}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 py-3 lg:py-2"
              />
            </div>

            {/* Category */}
            <div className="lg:col-span-2">
              <label htmlFor="category_id" className="block text-sm font-medium text-gray-700">
                Category
              </label>
              <select
                id="category_id"
                name="category_id"
                defaultValue={editingInvestment?.category_id?.toString() || ''}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 py-3 lg:py-2"
              >
                <option value="">Standard</option>
                {categories
                  .filter(cat => cat.is_active)
                  .map(category => (
                    <option key={category.id} value={category.id}>
                      {category.name} ({category.level})
                    </option>
                  ))}
              </select>
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-md disabled:opacity-50"
            >
              {loading ? 'Saving...' : submitText}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
