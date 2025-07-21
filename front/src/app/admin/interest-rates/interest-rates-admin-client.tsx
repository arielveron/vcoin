'use client'

import { useState } from 'react'
import { InterestRateHistory, Class } from '@/types/database'
import { createInterestRate, updateInterestRate, deleteInterestRate } from './actions'
import { useAdminFilters } from '@/hooks/useAdminFilters'
import FilterBadges from '@/app/admin/components/filter-badges'

interface FormattedInterestRate extends InterestRateHistory {
  monthly_interest_rate_formatted: string
  effective_date_formatted: string
  created_at_formatted: string
  updated_at_formatted: string
}

interface CurrentRateInfo {
  class: Class
  currentRate: number
  currentRateFormatted: string
  lastUpdated: Date | null
  lastUpdatedFormatted: string | null
}

interface InterestRatesAdminClientProps {
  interestRates: FormattedInterestRate[]
  classes: Class[]
  currentRates: CurrentRateInfo[]
}

export default function InterestRatesAdminClient({ interestRates: initialRates, classes, currentRates }: InterestRatesAdminClientProps) {
  const [rates, setRates] = useState(initialRates)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [editingRate, setEditingRate] = useState<FormattedInterestRate | null>(null)
  const { filters, updateFilters } = useAdminFilters()

  const handleCreateRate = async (formData: FormData) => {
    try {
      const result = await createInterestRate(formData)
      if (result.success && result.data) {
        // Refresh the page to get updated formatted data
        window.location.reload()
      } else if (!result.success) {
        alert(result.error || 'Failed to create interest rate')
      }
    } catch (error) {
      alert('Failed to create interest rate')
    }
  }

  const handleUpdateRate = async (formData: FormData) => {
    if (!editingRate) return
    
    try {
      const result = await updateInterestRate(editingRate.id, formData)
      if (result.success) {
        // Refresh the page to get updated formatted data
        window.location.reload()
      } else {
        alert(result.error || 'Failed to update interest rate')
      }
    } catch (error) {
      alert('Failed to update interest rate')
    }
  }

  const handleDeleteRate = async (id: number) => {
    if (!confirm('Are you sure you want to delete this interest rate?')) return
    
    try {
      const result = await deleteInterestRate(id)
      if (result.success) {
        setRates(rates.filter(r => r.id !== id))
      } else {
        alert(result.error || 'Failed to delete interest rate')
      }
    } catch (error) {
      alert('Failed to delete interest rate')
    }
  }

  // Filter rates by selected class from URL
  const filteredRates = filters.classId 
    ? rates.filter(rate => rate.class_id === filters.classId)
    : rates

  // Filter current rates by selected class from URL  
  const filteredCurrentRates = filters.classId 
    ? currentRates.filter(rate => rate.class.id === filters.classId)
    : currentRates

  return (
    <div className="space-y-6">
      {/* Filter Badges */}
      <FilterBadges classes={classes} />

      {/* Current Rates Summary */}
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Current Interest Rates by Class</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredCurrentRates.map(({ class: cls, currentRateFormatted, lastUpdatedFormatted }) => (
            <div key={cls.id} className="border border-gray-200 rounded-lg p-4">
              <h3 className="font-medium text-gray-900">{cls.name}</h3>
              <p className="text-2xl font-bold text-indigo-600 mt-2">
                {currentRateFormatted}
              </p>
              <p className="text-sm text-gray-500 mt-1">
                {lastUpdatedFormatted ? `Updated: ${lastUpdatedFormatted}` : 'No rate set'}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Header with Controls */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Interest Rate History</h2>
          <p className="text-gray-600">Total: {filteredRates.length} rates</p>
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
          <button
            onClick={() => setShowCreateForm(true)}
            className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
          >
            Add Interest Rate
          </button>
        </div>
      </div>

      {/* Create Form */}
      {showCreateForm && (
        <div className="bg-white p-6 rounded-lg shadow border">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Create New Interest Rate</h3>
          <form key={`create-${filters.classId || 'all'}`} action={handleCreateRate} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label htmlFor="class_id" className="block text-sm font-medium text-gray-700">
                  Class
                </label>
                <select
                  id="class_id"
                  name="class_id"
                  required
                  defaultValue={filters.classId ? filters.classId.toString() : ''}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
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
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
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
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <button
                type="submit"
                className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
              >
                Create Rate
              </button>
              <button
                type="button"
                onClick={() => setShowCreateForm(false)}
                className="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Edit Form */}
      {editingRate && (
        <div className="bg-white p-6 rounded-lg shadow border">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Edit Interest Rate</h3>
          <form action={handleUpdateRate} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label htmlFor="edit-class_id" className="block text-sm font-medium text-gray-700">
                  Class
                </label>
                <select
                  id="edit-class_id"
                  name="class_id"
                  defaultValue={editingRate.class_id}
                  required
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                >
                  {classes.map((cls) => (
                    <option key={cls.id} value={cls.id}>
                      {cls.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="edit-monthly_interest_rate" className="block text-sm font-medium text-gray-700">
                  Monthly Interest Rate (%)
                </label>
                <input
                  type="number"
                  id="edit-monthly_interest_rate"
                  name="monthly_interest_rate"
                  defaultValue={(editingRate.monthly_interest_rate * 100).toFixed(2)}
                  required
                  min="0"
                  max="100"
                  step="0.01"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label htmlFor="edit-effective_date" className="block text-sm font-medium text-gray-700">
                  Effective Date
                </label>
                <input
                  type="date"
                  id="edit-effective_date"
                  name="effective_date"
                  defaultValue={new Date(editingRate.effective_date).toISOString().split('T')[0]}
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
                Update Rate
              </button>
              <button
                type="button"
                onClick={() => setEditingRate(null)}
                className="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Interest Rates Table */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Class
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Rate
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Effective Date
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Created
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredRates
              .sort((a, b) => new Date(b.effective_date).getTime() - new Date(a.effective_date).getTime())
              .map((rate) => {
                const rateClass = classes.find(c => c.id === rate.class_id)
                return (
                  <tr key={rate.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {rateClass?.name || 'Unknown Class'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <span className="text-lg font-semibold text-indigo-600">
                        {rate.monthly_interest_rate_formatted}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {rate.effective_date_formatted}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {rate.created_at_formatted}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => setEditingRate(rate)}
                        className="text-indigo-600 hover:text-indigo-900 mr-3"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteRate(rate.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                )
              })}
          </tbody>
        </table>
        {filteredRates.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No interest rates found. Create your first rate above.
          </div>
        )}
      </div>
    </div>
  )
}
