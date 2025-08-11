/**
 * Interest Rates Table Component
 * Displays interest rates in a responsive table format
 * Extracted from interest-rates-admin-client.tsx
 */
'use client'

import { Edit, Trash2, Calendar, Percent } from 'lucide-react'
import ResponsiveTable from '@/components/admin/responsive-table'
import type { Class } from '@/types/database'
import { InterestRateForClient } from '@/utils/admin-data-types'

interface InterestRatesTableProps {
  rates: InterestRateForClient[]
  classes: Class[]
  onEdit: (rate: InterestRateForClient) => void
  onDelete: (id: number) => void
}

export default function InterestRatesTable({
  rates,
  classes,
  onEdit,
  onDelete
}: InterestRatesTableProps) {
  // Define columns for ResponsiveTable
  const columns = [
    {
      key: 'class',
      header: 'Class',
      render: (rate: InterestRateForClient) => {
        const rateClass = classes.find(c => c.id === rate.class_id)
        return (
          <div className="font-medium text-gray-900">
            {rateClass?.name || 'Unknown Class'}
          </div>
        )
      }
    },
    {
      key: 'monthly_interest_rate',
      header: 'Rate',
      render: (rate: InterestRateForClient) => (
        <div className="flex items-center space-x-2">
          <Percent className="h-4 w-4 text-green-500" />
          <span className="font-medium text-green-600">
            {(rate.monthly_interest_rate * 100).toFixed(2)}%
          </span>
        </div>
      )
    },
    {
      key: 'effective_date',
      header: 'Effective Date',
      render: (rate: InterestRateForClient) => (
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
      render: (rate: InterestRateForClient) => rate.created_at_formatted
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (rate: InterestRateForClient) => (
        <div className="flex space-x-2">
          <button
            onClick={() => onEdit(rate)}
            className="text-indigo-600 hover:text-indigo-900 p-1"
            aria-label="Edit rate"
          >
            <Edit className="h-4 w-4" />
          </button>
          <button
            onClick={() => onDelete(rate.id)}
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
  const mobileCard = (rate: InterestRateForClient) => {
    const rateClass = classes.find(c => c.id === rate.class_id)
    
    return (
      <div>
        <div className="flex justify-between items-start mb-3">
          <div>
            <h3 className="text-lg font-medium text-gray-900">
              {rateClass?.name || 'Unknown Class'}
            </h3>
            <div className="flex items-center space-x-2 mt-1">
              <Percent className="h-5 w-5 text-green-500" />
              <span className="text-xl font-bold text-green-600">
                {(rate.monthly_interest_rate * 100).toFixed(2)}%
              </span>
            </div>
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => onEdit(rate)}
              className="text-indigo-600 p-1"
            >
              <Edit className="h-5 w-5" />
            </button>
            <button
              onClick={() => onDelete(rate.id)}
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
        
        <div className="text-sm text-gray-500">
          Created: {rate.created_at_formatted}
        </div>
      </div>
    )
  }

  return (
    <ResponsiveTable
      data={rates}
      columns={columns}
      mobileCard={mobileCard}
      emptyMessage="No interest rates found. Create your first rate to get started."
    />
  )
}
