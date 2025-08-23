/**
 * Enhanced Batch Investment Form Component
 * First step of batch investment creation with pre-selected students support
 */
'use client'

import { useState } from 'react'
import { Calendar, FileText, Tag, GraduationCap, Users } from 'lucide-react'
import type { InvestmentCategory } from '@/types/database'
import type { ClassForClient, StudentForClient } from '@/utils/admin-data-types'
import { getTodayInputValue } from '@/shared/utils/formatting'

interface EnhancedBatchInvestmentFormProps {
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
  preSelectedStudents?: StudentForClient[]
  hideClassSelection?: boolean
}

export function EnhancedBatchInvestmentForm({
  classes,
  categories,
  onSubmit,
  loading,
  defaultClassId,
  defaultCategoryId,
  defaultDate,
  preSelectedStudents = [],
  hideClassSelection = false
}: EnhancedBatchInvestmentFormProps) {
  // For pre-selected students, use their class ID as default
  const preSelectedClassId = preSelectedStudents.length > 0 ? preSelectedStudents[0].class_id : null
  
  const [formData, setFormData] = useState({
    fecha: defaultDate || getTodayInputValue(),
    concepto: '',
    category_id: defaultCategoryId?.toString() || '',
    class_id: hideClassSelection 
      ? (preSelectedClassId?.toString() || '') 
      : (defaultClassId?.toString() || '')
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    const requiredFields = hideClassSelection 
      ? ['fecha', 'concepto', 'category_id'] 
      : ['fecha', 'concepto', 'category_id', 'class_id']
    
    const missingFields = requiredFields.filter(field => !formData[field as keyof typeof formData])
    
    if (missingFields.length > 0) {
      alert('Please fill in all required fields')
      return
    }

    onSubmit({
      fecha: formData.fecha,
      concepto: formData.concepto,
      category_id: parseInt(formData.category_id),
      class_id: hideClassSelection ? preSelectedClassId! : parseInt(formData.class_id)
    })
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  // Group pre-selected students by class for display
  const studentsByClass = preSelectedStudents.reduce((acc, student) => {
    const className = classes.find(c => c.id === student.class_id)?.name || 'Unknown Class'
    if (!acc[className]) acc[className] = []
    acc[className].push(student)
    return acc
  }, {} as Record<string, StudentForClient[]>)

  return (
    <div className="p-6">
      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* Pre-selected Students Display */}
        {preSelectedStudents.length > 0 && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Users className="h-4 w-4 text-blue-600" />
              <h3 className="text-sm font-medium text-blue-900">
                Selected Students ({preSelectedStudents.length})
              </h3>
            </div>
            <div className="space-y-2">
              {Object.entries(studentsByClass).map(([className, students]) => (
                <div key={className} className="text-sm">
                  <div className="font-medium text-blue-800">{className}:</div>
                  <div className="text-blue-700 ml-2">
                    {students.map(s => `${s.name} (${s.registro})`).join(', ')}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Date Field */}
        <div>
          <label htmlFor="fecha" className="block text-sm font-medium text-gray-700 mb-1">
            <Calendar className="inline h-4 w-4 mr-1" />
            Investment Date *
          </label>
          <input
            type="date"
            id="fecha"
            value={formData.fecha}
            onChange={(e) => handleInputChange('fecha', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            required
          />
        </div>

        {/* Concept Field */}
        <div>
          <label htmlFor="concepto" className="block text-sm font-medium text-gray-700 mb-1">
            <FileText className="inline h-4 w-4 mr-1" />
            Investment Concept *
          </label>
          <input
            type="text"
            id="concepto"
            value={formData.concepto}
            onChange={(e) => handleInputChange('concepto', e.target.value)}
            placeholder="Enter investment description"
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            required
          />
        </div>

        {/* Category Field */}
        <div>
          <label htmlFor="category_id" className="block text-sm font-medium text-gray-700 mb-1">
            <Tag className="inline h-4 w-4 mr-1" />
            Investment Category *
          </label>
          <select
            id="category_id"
            value={formData.category_id}
            onChange={(e) => handleInputChange('category_id', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            required
          >
            <option value="">Select a category</option>
            {categories.map(category => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>

        {/* Class Field - Hidden when students are pre-selected */}
        {!hideClassSelection && (
          <div>
            <label htmlFor="class_id" className="block text-sm font-medium text-gray-700 mb-1">
              <GraduationCap className="inline h-4 w-4 mr-1" />
              Class *
            </label>
            <select
              id="class_id"
              value={formData.class_id}
              onChange={(e) => handleInputChange('class_id', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              required
            >
              <option value="">Select a class</option>
              {classes.map(classItem => (
                <option key={classItem.id} value={classItem.id}>
                  {classItem.name}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Submit Button */}
        <div className="flex justify-end space-x-3 pt-4 border-t">
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Loading Students...' : 'Continue to Amount Setting'}
          </button>
        </div>
      </form>
    </div>
  )
}
