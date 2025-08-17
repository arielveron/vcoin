/**
 * Interest Rate Form Component
 * Handles create/edit interest rate modal form
 * Extracted from interest-rates-admin-client.tsx
 */
'use client'

import { X } from 'lucide-react'
import type { InterestRateHistory, Class } from '@/types/database'
import { ActionResult } from '@/utils/admin-server-action-types'
import { toDBDateValue } from '@/shared/utils/formatting/date'
import { InterestRateForClient } from '@/utils/admin-data-types'

interface InterestRateFormProps {
  editingRate: InterestRateForClient | null
  classes: Class[]
  classId?: number
  onSubmit: (formData: FormData) => Promise<ActionResult<InterestRateHistory>>
  onSuccess: (rate: InterestRateHistory) => void
  onCancel: () => void
}

export default function InterestRateForm({
  editingRate,
  classes,
  classId,
  onSubmit,
  onSuccess,
  onCancel
}: InterestRateFormProps) {
  const handleSubmit = async (formData: FormData) => {
    if (editingRate) {
      formData.append('id', editingRate.id.toString())
    }
    
    const result = await onSubmit(formData)
    
    if (result.success && result.data) {
      onSuccess(result.data)
    } else {
      const error = 'error' in result ? result.error : 'Failed to save interest rate'
      alert(error)
    }
  }

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-0 lg:top-10 mx-auto p-0 lg:p-5 border w-full lg:w-2xl h-full lg:h-auto shadow-lg lg:rounded-md bg-white">
        <div className="flex flex-col h-full lg:h-auto">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b lg:border-0">
            <h3 className="text-lg font-medium text-gray-900">
              {editingRate ? 'Edit Interest Rate' : 'Add Interest Rate'}
            </h3>
            <button
              onClick={onCancel}
              className="lg:hidden p-2 text-gray-400 hover:text-gray-600"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          
          {/* Form */}
          <form 
            key={`${editingRate ? 'edit' : 'create'}-${classId || 'all'}`} 
            action={handleSubmit} 
            className="flex-1 overflow-y-auto p-4 lg:p-0 space-y-4"
          >
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <div>
                <label htmlFor="class_id" className="block text-sm font-medium text-gray-700">
                  Class
                </label>
                <select
                  id="class_id"
                  name="class_id"
                  required
                  defaultValue={editingRate ? editingRate.class_id.toString() : (classId ? classId.toString() : '')}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 py-3 lg:py-2"
                >
                  <option value="">Select a class</option>
                  {classes.map((cls) => (
                    <option key={cls.id} value={cls.id}>
                      {cls.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="monthly_interest_rate" className="block text-sm font-medium text-gray-700">
                  Monthly Interest Rate (%)
                </label>
                <input
                  type="number"
                  id="monthly_interest_rate"
                  name="monthly_interest_rate"
                  required
                  min="0"
                  max="100"
                  step="0.01"
                  placeholder="e.g., 5.25"
                  defaultValue={editingRate ? (editingRate.monthly_interest_rate * 100).toFixed(2) : ''}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 py-3 lg:py-2"
                />
              </div>
              <div>
                <label htmlFor="effective_date" className="block text-sm font-medium text-gray-700">
                  Effective Date
                </label>
                <input
                  type="date"
                  id="effective_date"
                  name="effective_date"
                  required
                  defaultValue={editingRate ? toDBDateValue(editingRate.effective_date) : ''}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 py-3 lg:py-2"
                />
              </div>
            </div>
            
            <div className="flex flex-col-reverse lg:flex-row gap-2 pt-4 border-t lg:border-0">
              <button
                type="button"
                onClick={onCancel}
                className="w-full lg:w-auto px-4 py-3 lg:py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="w-full lg:w-auto px-4 py-3 lg:py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700"
              >
                {editingRate ? 'Update Rate' : 'Create Rate'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
