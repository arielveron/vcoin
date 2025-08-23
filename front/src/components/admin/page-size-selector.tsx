/**
 * Page Size Selector Component
 * Allows users to choose how many items to display per page
 * Reusable across all admin views
 */
'use client'

interface PageSizeSelectorProps {
  currentPageSize: number
  onPageSizeChange: (newSize: number) => void
  options?: number[]
  className?: string
}

export default function PageSizeSelector({
  currentPageSize,
  onPageSizeChange,
  options = [5, 10, 25, 50, 100],
  className = ''
}: PageSizeSelectorProps) {
  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      <label htmlFor="page-size" className="text-sm text-gray-700">
        Mostrar:
      </label>
      <select
        id="page-size"
        value={currentPageSize}
        onChange={(e) => onPageSizeChange(parseInt(e.target.value, 10))}
        className="rounded-md border-gray-300 text-sm focus:border-indigo-500 focus:ring-indigo-500"
      >
        {options.map((size) => (
          <option key={size} value={size}>
            {size}
          </option>
        ))}
      </select>
      <span className="text-sm text-gray-700">elementos</span>
    </div>
  )
}
