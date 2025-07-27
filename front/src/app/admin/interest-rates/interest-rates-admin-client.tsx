'use client'

import { useState } from 'react'
import { InterestRateHistory, Class } from '@/types/database'
import { createInterestRate, updateInterestRate, deleteInterestRate } from './actions'
import { useAdminFilters } from '@/hooks/useAdminFilters'
import FilterBadges from '@/app/admin/components/filter-badges'
import ResponsiveTable from '@/components/admin/responsive-table'
import MobileFilters from '@/components/admin/mobile-filters'
import { Calendar, Percent, Edit, Trash2, Plus, X, TrendingUp } from 'lucide-react'

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
        window.location.reload()
      } else if (!result.success) {
        alert(result.error || 'Failed to create interest rate')
      }
    } catch {
      alert('Failed to create interest rate')
    }
  }

  const handleUpdateRate = async (formData: FormData) => {
    if (!editingRate) return
    
    try {
      const result = await updateInterestRate(editingRate.id, formData)
      if (result.success) {
        window.location.reload()
      } else {
        alert(result.error || 'Failed to update interest rate')
      }
    } catch {
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
    } catch {
      alert('Failed to delete interest rate')
    }
  }

  const filteredRates = filters.classId 
    ? rates.filter(rate => rate.class_id === filters.classId)
    : rates

  const filteredCurrentRates = filters.classId 
    ? currentRates.filter(rate => rate.class.id === filters.classId)
    : currentRates

  // Define columns for ResponsiveTable
  const columns = [
    {
      key: 'class_name',
      header: 'Class',
      render: (rate: FormattedInterestRate) => {
        const rateClass = classes.find(c => c.id === rate.class_id)
        return rateClass?.name || 'Unknown Class'
      }
    },
    {
      key: 'monthly_interest_rate',
      header: 'Rate',
      render: (rate: FormattedInterestRate) => (
        <div className="flex items-center space-x-2">
          <Percent className="h-4 w-4 text-green-500" />
          <span className="font-medium text-green-600">
            {rate.monthly_interest_rate_formatted}
          </span>
        </div>
      )
    },
    {
      key: 'effective_date',
      header: 'Effective Date',
      render: (rate: FormattedInterestRate) => (
        <div className="flex items-center space-x-2">
          <Calendar className="h-4 w-4 text-gray-400" />
          <span>{rate.effective_date_formatted}</span>
        </div>
      )
    },
    {
      key: 'created_at',
      header: 'Created',
      hideOnMobile: true,
      render: (rate: FormattedInterestRate) => rate.created_at_formatted
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (rate: FormattedInterestRate) => (
        <div className="flex space-x-2">
          <button
            onClick={() => {
              setEditingRate(rate)
              setShowCreateForm(true)
            }}
            className="text-indigo-600 hover:text-indigo-900 p-1"
            aria-label="Edit rate"
          >
            <Edit className="h-4 w-4" />
          </button>
          <button
            onClick={() => handleDeleteRate(rate.id)}
            className="text-red-600 hover:text-red-900 p-1"
            aria-label="Delete rate"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      )
    }
  ]

  // Custom mobile card
  const mobileCard = (rate: FormattedInterestRate) => {
    const rateClass = classes.find(c => c.id === rate.class_id)
    return (
      <div>
        <div className="flex justify-between items-start mb-3">
          <div>
            <h3 className="text-lg font-medium text-gray-900">{rateClass?.name || 'Unknown Class'}</h3>
            <div className="flex items-center space-x-2 mt-1">
              <Percent className="h-5 w-5 text-green-500" />
              <span className="text-xl font-bold text-green-600">
                {rate.monthly_interest_rate_formatted}
              </span>
            </div>
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => {
                setEditingRate(rate)
                setShowCreateForm(true)
              }}
              className="text-indigo-600 p-1"
            >
              <Edit className="h-5 w-5" />
            </button>
            <button
              onClick={() => handleDeleteRate(rate.id)}
              className="text-red-600 p-1"
            >
              <Trash2 className="h-5 w-5" />
            </button>
          </div>
        </div>
        
        <div className="flex items-center space-x-2 mb-2">
          <Calendar className="h-4 w-4 text-gray-400" />
          <span className="text-sm text-gray-600">
            Effective: {rate.effective_date_formatted}
          </span>
        </div>
        
        <div className="text-xs text-gray-500">
          Created: {rate.created_at_formatted}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <FilterBadges classes={classes} />

      {/* Current Rates Summary - Responsive */}
      <div className="bg-white shadow rounded-lg p-4 lg:p-6">
        <div className="flex items-center space-x-3 mb-4">
          <TrendingUp className="h-6 w-6 text-indigo-600" />
          <h2 className="text-lg font-medium text-gray-900">Current Interest Rates by Class</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredCurrentRates.map(({ class: cls, currentRateFormatted, lastUpdatedFormatted }) => (
            <div key={cls.id} className="border border-gray-200 rounded-lg p-4 hover:border-indigo-300 transition-colors">
              <h3 className="font-medium text-gray-900 truncate">{cls.name}</h3>
              <div className="flex items-center space-x-2 mt-2">
                <Percent className="h-5 w-5 text-green-500 flex-shrink-0" />
                <p className="text-xl lg:text-2xl font-bold text-green-600">
                  {currentRateFormatted}
                </p>
              </div>
              <p className="text-sm text-gray-500 mt-1">
                {lastUpdatedFormatted ? `Updated: ${lastUpdatedFormatted}` : 'No rate set'}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Header with Controls - Responsive */}
      <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-4">
        <div>
          <h2 className="text-xl lg:text-2xl font-semibold text-gray-900">Interest Rate History</h2>
          <p className="text-gray-600">Total: {filteredRates.length} rates</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          <MobileFilters
            classes={classes}
            currentClassId={filters.classId}
            onClassChange={(classId) => updateFilters({ classId })}
          />
          <button
            onClick={() => {
              setShowCreateForm(true)
              setEditingRate(null)
            }}
            className="flex items-center justify-center bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 min-h-[44px]"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Interest Rate
          </button>
        </div>
      </div>

      {/* Create/Edit Form - Mobile-friendly */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-0 lg:top-10 mx-auto p-0 lg:p-5 border w-full lg:w-2xl h-full lg:h-auto shadow-lg lg:rounded-md bg-white">
            <div className="flex flex-col h-full lg:h-auto">
              <div className="flex items-center justify-between p-4 border-b lg:border-0">
                <h3 className="text-lg font-medium text-gray-900">
                  {editingRate ? 'Edit Interest Rate' : 'Create New Interest Rate'}
                </h3>
                <button
                  onClick={() => {
                    setShowCreateForm(false)
                    setEditingRate(null)
                  }}
                  className="lg:hidden p-2 text-gray-400 hover:text-gray-600"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              
              <form 
                key={`${editingRate ? 'edit' : 'create'}-${filters.classId || 'all'}`} 
                action={editingRate ? handleUpdateRate : handleCreateRate} 
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
                      defaultValue={editingRate ? editingRate.class_id.toString() : (filters.classId ? filters.classId.toString() : '')}
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
                      defaultValue={editingRate ? editingRate.monthly_interest_rate : ''}
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
                      defaultValue={editingRate ? new Date(editingRate.effective_date).toISOString().split('T')[0] : ''}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 py-3 lg:py-2"
                    />
                  </div>
                </div>
                
                <div className="flex flex-col-reverse lg:flex-row gap-2 pt-4 border-t lg:border-0">
                  <button
                    type="button"
                    onClick={() => {
                      setShowCreateForm(false)
                      setEditingRate(null)
                    }}
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
      )}

      {/* Responsive Interest Rates Table */}
      <ResponsiveTable
        data={filteredRates}
        columns={columns}
        mobileCard={mobileCard}
        emptyMessage="No interest rates found. Create your first rate to get started."
      />
    </div>
  )
}