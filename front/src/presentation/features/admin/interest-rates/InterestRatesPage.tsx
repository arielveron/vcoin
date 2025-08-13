/**
 * Interest Rates Page Component
 * Main orchestrator component for the interest rates admin
 * Refactored from 364-line interest-rates-admin-client.tsx
 */
'use client'

import { useState } from 'react'
import { Plus } from 'lucide-react'
import { useAdminFilters } from '../hooks/useAdminFilters'
import FilterBadges from '@/app/admin/components/filter-badges'
import MobileFilters from '@/components/admin/mobile-filters'
import {
  CurrentRatesStats,
  InterestRatesTable,
  InterestRateForm
} from './components'
import type { InterestRateHistory } from '@/types/database'
import { 
  InterestRatesPageProps, 
  ActionResult 
} from '@/utils/admin-server-action-types'
import { 
  InterestRateForClient,
  formatInterestRateForClient
} from '@/utils/admin-data-types'

export default function InterestRatesPage({
  initialRates,
  classes,
  currentRates,
  createInterestRate,
  updateInterestRate,
  deleteInterestRate
}: InterestRatesPageProps) {
  const [rates, setRates] = useState<InterestRateForClient[]>(initialRates)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [editingRate, setEditingRate] = useState<InterestRateForClient | null>(null)
  const { filters } = useAdminFilters()

  // Filter rates based on selected class
  const filteredRates = filters.classId 
    ? rates.filter(rate => rate.class_id === filters.classId)
    : rates

  // Filter current rates based on selected class
  const filteredCurrentRates = filters.classId
    ? currentRates.filter(rate => rate.class.id === filters.classId)
    : currentRates

  const handleFormSubmit = async (formData: FormData): Promise<ActionResult<InterestRateHistory>> => {
    return editingRate ? 
      await updateInterestRate(formData) : 
      await createInterestRate(formData)
  }

  const handleFormSuccess = (rate: InterestRateHistory) => {
    const formattedRate = formatInterestRateForClient(rate)
    
    if (editingRate) {
      // Update existing rate
      setRates(rates.map(r => 
        r.id === editingRate.id ? formattedRate : r
      ))
      setEditingRate(null)
    } else {
      // Add new rate
      setRates([...rates, formattedRate])
    }
    setShowCreateForm(false)
  }

  const handleFormCancel = () => {
    setShowCreateForm(false)
    setEditingRate(null)
  }

  const handleCreateClick = () => {
    setEditingRate(null)
    setShowCreateForm(true)
  }

  const handleEditRate = (rate: InterestRateForClient) => {
    setEditingRate(rate)
    setShowCreateForm(true)
  }

  const handleDeleteRate = async (id: number) => {
    if (!confirm('Are you sure you want to delete this interest rate?')) return
    
    const formData = new FormData()
    formData.append('id', id.toString())
    
    const result = await deleteInterestRate(formData)
    if (result.success) {
      setRates(rates.filter(r => r.id !== id))
    } else {
      alert(result.error || 'Error deleting interest rate')
    }
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <FilterBadges classes={classes} />
      
      <div className="block lg:hidden">
        <MobileFilters 
          classes={classes}
          showStudentFilter={false}
        />
      </div>

      {/* Current Rates Summary */}
      <CurrentRatesStats 
        currentRates={filteredCurrentRates}
      />

      {/* Header with Create Button */}
      <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-4">
        <div>
          <h2 className="text-xl lg:text-2xl font-semibold text-gray-900">
            Interest Rate History
          </h2>
          <p className="text-sm lg:text-base text-gray-600 mt-1">
            Total: {filteredRates.length} rates
          </p>
        </div>
        <button
          onClick={handleCreateClick}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 self-start lg:self-center"
        >
          <Plus className="h-4 w-4" />
          Add Interest Rate
        </button>
      </div>

      {/* Interest Rate Form Modal */}
      {showCreateForm && (
        <InterestRateForm
          editingRate={editingRate}
          classes={classes}
          classId={filters.classId ?? undefined}
          onSubmit={handleFormSubmit}
          onSuccess={handleFormSuccess}
          onCancel={handleFormCancel}
        />
      )}

      {/* Interest Rates Table */}
      <InterestRatesTable
        rates={filteredRates}
        classes={classes}
        onEdit={handleEditRate}
        onDelete={handleDeleteRate}
      />
    </div>
  )
}
