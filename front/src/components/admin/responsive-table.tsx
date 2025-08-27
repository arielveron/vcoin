'use client'

import { ReactNode } from 'react'
import SortableHeader from './sortable-header'
import MobileSortDropdown from './mobile-sort-dropdown'
import { SortConfig } from '@/presentation/hooks/useAdminSorting'

interface Column<T = Record<string, unknown>> {
  key: string
  header: string
  render?: (item: T) => ReactNode
  mobileLabel?: string
  hideOnMobile?: boolean
  className?: string
  sortable?: boolean
  sortField?: string  // Allow custom sort field name
}

interface ResponsiveTableProps<T = Record<string, unknown>> {
  data: T[]
  columns: Column<T>[]
  emptyMessage?: string
  mobileCard?: (item: T) => ReactNode
  // Sorting props
  sortConfig?: SortConfig
  onSort?: (field: string) => void
  enableSorting?: boolean
}

export default function ResponsiveTable<T extends { id?: string | number }>({ 
  data, 
  columns, 
  emptyMessage = 'No data found',
  mobileCard,
  sortConfig,
  onSort,
  enableSorting = false
}: ResponsiveTableProps<T>) {
  
  // Desktop Table View (hidden on mobile)
  const DesktopTable = () => (
    <div className="hidden lg:block overflow-hidden shadow rounded-lg">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            {columns.map(column => {
              const sortField = column.sortField || column.key
              const isSortable = enableSorting && column.sortable !== false && onSort && sortConfig
              
              return (
                <th
                  key={column.key}
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  {isSortable ? (
                    <SortableHeader
                      field={sortField}
                      currentSort={sortConfig}
                      onSort={onSort}
                      className="text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      {column.header}
                    </SortableHeader>
                  ) : (
                    column.header
                  )}
                </th>
              )
            })}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {data.map((item, index) => (
            <tr key={item.id || index}>
              {columns.map(column => (
                <td
                  key={column.key}
                  className={`px-6 py-4 whitespace-nowrap text-sm ${column.className || ''}`}
                >
                  {column.render ? column.render(item) : String((item as Record<string, unknown>)[column.key] || '')}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      {data.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          {emptyMessage}
        </div>
      )}
    </div>
  )

  // Mobile Card View
  const MobileView = () => {
    // Prepare sort options for mobile dropdown
    const sortOptions = enableSorting && onSort && sortConfig 
      ? columns
          .filter(col => col.sortable !== false)
          .map(col => ({
            field: col.sortField || col.key,
            label: col.header,
            disabled: false
          }))
      : []

    return (
      <div className="lg:hidden space-y-4">
        {/* Mobile Sort Dropdown */}
        {enableSorting && onSort && sortConfig && sortOptions.length > 0 && (
          <div className="bg-white shadow rounded-lg p-4">
            <MobileSortDropdown
              options={sortOptions}
              currentSort={sortConfig}
              onSort={onSort}
            />
          </div>
        )}
        
        {data.map((item, index) => (
          <div key={item.id || index} className="bg-white shadow rounded-lg p-4">
            {mobileCard ? (
              mobileCard(item)
            ) : (
              <div className="space-y-2">
                {columns
                  .filter(col => !col.hideOnMobile)
                  .map(column => (
                    <div key={column.key} className="flex justify-between items-start">
                      <span className="text-sm font-medium text-gray-500">
                        {column.mobileLabel || column.header}:
                      </span>
                      <span className={`text-sm text-gray-900 text-right ${column.className || ''}`}>
                        {column.render ? column.render(item) : String((item as Record<string, unknown>)[column.key] || '')}
                      </span>
                    </div>
                  ))}
              </div>
            )}
          </div>
        ))}
        {data.length === 0 && (
          <div className="text-center py-8 text-gray-500 bg-white rounded-lg">
            {emptyMessage}
          </div>
        )}
      </div>
    )
  }

  return (
    <>
      <DesktopTable />
      <MobileView />
    </>
  )
}
