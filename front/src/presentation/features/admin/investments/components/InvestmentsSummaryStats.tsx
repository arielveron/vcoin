/**
 * Investment Summary Statistics Component
 * Displays total investments, total amount, and average investment
 */
'use client'

import { BarChart3, DollarSign, TrendingUp } from 'lucide-react'
import { formatCurrency } from '@/shared/utils/formatting'

interface InvestmentsSummaryStatsProps {
  investments: Array<{ monto: number }>
}

export default function InvestmentsSummaryStats({ investments }: InvestmentsSummaryStatsProps) {
  const totalAmount = investments.reduce((sum, inv) => sum + inv.monto, 0)
  const averageAmount = investments.length > 0 ? totalAmount / investments.length : 0

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 lg:gap-6">
      {/* Total Investments */}
      <div className="bg-white p-4 lg:p-6 rounded-lg shadow">
        <div className="flex items-center space-x-3">
          <BarChart3 className="h-8 w-8 text-blue-600" />
          <div>
            <h3 className="text-sm font-medium text-gray-500">Total Investments</h3>
            <p className="text-2xl lg:text-3xl font-bold text-blue-600">{investments.length}</p>
          </div>
        </div>
      </div>

      {/* Total Amount */}
      <div className="bg-white p-4 lg:p-6 rounded-lg shadow">
        <div className="flex items-center space-x-3">
          <DollarSign className="h-8 w-8 text-green-600" />
          <div>
            <h3 className="text-sm font-medium text-gray-500">Total Amount</h3>
            <p className="text-2xl lg:text-3xl font-bold text-green-600">
              {formatCurrency(totalAmount)}
            </p>
          </div>
        </div>
      </div>

      {/* Average Investment */}
      <div className="bg-white p-4 lg:p-6 rounded-lg shadow">
        <div className="flex items-center space-x-3">
          <TrendingUp className="h-8 w-8 text-purple-600" />
          <div>
            <h3 className="text-sm font-medium text-gray-500">Average Investment</h3>
            <p className="text-2xl lg:text-3xl font-bold text-purple-600">
              {formatCurrency(averageAmount)}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
