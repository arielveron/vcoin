/**
 * Batch Investment Form Component
 * First step of batch investment creation - collects basic data
 */
'use client'

import { useState } from 'react'
import { Calendar, FileText, Tag, GraduationCap } from 'lucide-react'
import type { InvestmentCategory } from '@/types/database'
import type { ClassForClient } from '@/utils/admin-data-types'
import { getTodayInputValue } from '@/shared/utils/formatting'

interface BatchInvestmentFormProps {
  classes: ClassForClient[]
  categories: InvestmentCategory[]
  onSubmit: (data: {
    fecha: string
    concepto: string
    category_id: number
    class_id: number
  }) => void
  loading: boolean
  defaultClassId?: number | null
  defaultCategoryId?: number | null
  defaultDate?: string | null
  selectionMode?: boolean // New prop to indicate selection-based mode
  selectedStudentsCount?: number // Show how many students are selected
}

export function BatchInvestmentForm({
  classes,
  categories,
  onSubmit,
  loading,
  defaultClassId,
  defaultCategoryId,
  defaultDate,
  selectionMode = false,
  selectedStudentsCount = 0
}: BatchInvestmentFormProps) {
  const [formData, setFormData] = useState({
    fecha: defaultDate || getTodayInputValue(), // Use date utility instead of raw ISO string
    concepto: '',
    category_id: defaultCategoryId?.toString() || '',
    class_id: defaultClassId?.toString() || ''
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    // In selection mode, class_id is not required (we use pre-selected students)
    const requiredFields = selectionMode 
      ? ['fecha', 'concepto', 'category_id']
      : ['fecha', 'concepto', 'class_id', 'category_id']
    
    const missingFields = requiredFields.filter(field => {
      const value = formData[field as keyof typeof formData]
      return !value
    })
    
    if (missingFields.length > 0) {
      alert('Please fill in all required fields')
      return
    }

    onSubmit({
      fecha: formData.fecha,
      concepto: formData.concepto,
      category_id: parseInt(formData.category_id),
      class_id: parseInt(formData.class_id)
    })
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        {selectionMode ? (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-blue-800 font-medium">
              Creating batch investment for {selectedStudentsCount} selected students
            </p>
            <p className="text-blue-600 text-sm mt-1">
              Set up the investment details below. We&apos;ll filter out any students who already have investments for this date and category.
            </p>
          </div>
        ) : (
          <p className="text-gray-600">
            First, set up the basic information for your batch investment. We&apos;ll then show you all available students from the selected class.
          </p>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Date Field */}
        <div>
          <label htmlFor="fecha" className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
            <Calendar className="h-4 w-4" />
            Investment Date <span className="text-red-500">*</span>
          </label>
          <input
            type="date"
            id="fecha"
            name="fecha"
            value={formData.fecha}
            onChange={handleInputChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        {/* Class Selection - Only show in class-based mode */}
        {!selectionMode && (
          <div>
            <label htmlFor="class_id" className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
              <GraduationCap className="h-4 w-4" />
              Class <span className="text-red-500">*</span>
            </label>
            <select
              id="class_id"
              name="class_id"
              value={formData.class_id}
              onChange={handleInputChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Select a class</option>
              {classes.map(cls => (
              <option key={cls.id} value={cls.id}>
                {cls.name}
              </option>
            ))}
          </select>
        </div>
        )}

        {/* Concepto Field */}
        <div>
          <label htmlFor="concepto" className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
            <FileText className="h-4 w-4" />
            Concept/Description <span className="text-red-500">*</span>
          </label>
          <textarea
            id="concepto"
            name="concepto"
            value={formData.concepto}
            onChange={handleInputChange}
            required
            rows={3}
            placeholder="e.g., Monthly savings, Project funding, etc."
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
          />
        </div>

        {/* Category Selection (Required) */}
        <div>
          <label htmlFor="category_id" className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
            <Tag className="h-4 w-4" />
            Category <span className="text-red-500">*</span>
          </label>
          <select
            id="category_id"
            name="category_id"
            value={formData.category_id}
            onChange={handleInputChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Select a category</option>
            {categories.filter(cat => cat.is_active).map(category => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end pt-4 border-t">
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? 'Loading Students...' : 'Next: Select Students'}
          </button>
        </div>
      </form>
    </div>
  )
}
