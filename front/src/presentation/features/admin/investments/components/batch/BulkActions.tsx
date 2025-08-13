/**
 * Bulk Actions Component
 * Handles bulk actions for batch investment table
 */
'use client'

interface BulkActionsProps {
  bulkAmount: string
  onBulkAmountChange: (amount: string) => void
  onApplyBulkAmount: () => void
  onClearAllAmounts: () => void
}

export function BulkActions({
  bulkAmount,
  onBulkAmountChange,
  onApplyBulkAmount,
  onClearAllAmounts
}: BulkActionsProps) {
  return (
    <div className="mb-6 p-4 bg-gray-50 rounded-lg">
      <h4 className="font-medium text-gray-900 mb-3">Bulk Actions</h4>
      <div className="flex flex-wrap gap-3 items-end">
        <div>
          <label htmlFor="bulkAmount" className="block text-sm font-medium text-gray-700 mb-1">
            Set amount for all students
          </label>
          <div className="flex gap-2">
            <input
              type="number"
              id="bulkAmount"
              value={bulkAmount}
              onChange={(e) => onBulkAmountChange(e.target.value)}
              placeholder="0.00"
              step="0.01"
              min="0"
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-32"
            />
            <button
              type="button"
              onClick={onApplyBulkAmount}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Apply
            </button>
          </div>
        </div>
        <button
          type="button"
          onClick={onClearAllAmounts}
          className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
        >
          Clear All
        </button>
      </div>
    </div>
  )
}
