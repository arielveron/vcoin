/**
 * Current Rates Stats Component
 * Displays current interest rates summary cards
 * Extracted from interest-rates-admin-client.tsx
 */
'use client'

import { TrendingUp, Percent } from 'lucide-react'
import { CurrentRateInfo } from '@/utils/admin-data-types'

interface CurrentRatesStatsProps {
  currentRates: CurrentRateInfo[]
}

export default function CurrentRatesStats({
  currentRates
}: CurrentRatesStatsProps) {
  return (
    <div className="bg-white shadow rounded-lg p-4 lg:p-6">
      <div className="flex items-center space-x-3 mb-4">
        <TrendingUp className="h-6 w-6 text-indigo-600" />
        <h2 className="text-lg font-medium text-gray-900">
          Current Interest Rates by Class
        </h2>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {currentRates.map(({ class: cls, currentRateFormatted, lastUpdatedFormatted }) => (
          <div 
            key={cls.id} 
            className="border border-gray-200 rounded-lg p-4 hover:border-indigo-300 transition-colors"
          >
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
  )
}
