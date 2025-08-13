/**
 * Batch Summary Component
 * Shows summary statistics for batch investment
 */
'use client'

import { formatCurrency } from '@/shared/utils/formatting'

interface BatchSummaryProps {
  activeStudentsCount: number
  totalStudents: number
  totalAmount: number
}

export function BatchSummary({ activeStudentsCount, totalStudents, totalAmount }: BatchSummaryProps) {
  return (
    <div className="mb-6 p-4 bg-green-50 rounded-lg">
      <h4 className="font-medium text-green-900 mb-2">Summary</h4>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-green-800">
        <div>
          <span className="font-medium">Students with investments:</span> {activeStudentsCount} of {totalStudents}
        </div>
        <div>
          <span className="font-medium">Total amount:</span> {formatCurrency(totalAmount)}
        </div>
      </div>
    </div>
  )
}
