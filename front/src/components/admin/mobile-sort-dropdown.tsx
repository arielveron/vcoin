'use client'

import { useState } from 'react'
import { ChevronDown, ArrowUpDown } from 'lucide-react'
import { SortConfig } from '@/presentation/hooks/useAdminSorting'

interface MobileSortOption {
  field: string
  label: string
  disabled?: boolean
}

interface MobileSortDropdownProps {
  options: MobileSortOption[]
  currentSort: SortConfig
  onSort: (field: string) => void
  className?: string
}

/**
 * Mobile-friendly sort dropdown for responsive tables
 * Shows current sort state and allows changing sort field/direction
 */
export default function MobileSortDropdown({
  options,
  currentSort,
  onSort,
  className = ''
}: MobileSortDropdownProps) {
  const [isOpen, setIsOpen] = useState(false)

  const currentOption = options.find(opt => opt.field === currentSort.field)
  const sortLabel = currentOption 
    ? `${currentOption.label} ${currentSort.direction === 'asc' ? '↑' : '↓'}`
    : 'Sort by...'

  const handleSort = (field: string) => {
    onSort(field)
    setIsOpen(false)
  }

  return (
    <div className={`relative ${className}`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between w-full px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
      >
        <div className="flex items-center space-x-2">
          <ArrowUpDown className="h-4 w-4 text-gray-400" />
          <span>{sortLabel}</span>
        </div>
        <ChevronDown className={`h-4 w-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-10" 
            onClick={() => setIsOpen(false)}
          />
          
          {/* Dropdown */}
          <div className="absolute right-0 z-20 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg">
            <div className="py-1">
              {options.map(option => (
                <button
                  key={option.field}
                  onClick={() => handleSort(option.field)}
                  disabled={option.disabled}
                  className={`
                    w-full px-4 py-2 text-sm text-left hover:bg-gray-100 focus:bg-gray-100 focus:outline-none
                    ${option.disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                    ${currentSort.field === option.field ? 'bg-indigo-50 text-indigo-900' : 'text-gray-900'}
                  `}
                >
                  <div className="flex items-center justify-between">
                    <span>{option.label}</span>
                    {currentSort.field === option.field && (
                      <span className="text-indigo-600">
                        {currentSort.direction === 'asc' ? '↑' : '↓'}
                      </span>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
