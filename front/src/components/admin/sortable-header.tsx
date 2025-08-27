'use client'

import { ChevronUp, ChevronDown, ChevronsUpDown } from 'lucide-react'
import { SortDirection } from '@/presentation/hooks/useAdminSorting'

interface SortableHeaderProps {
  field: string
  children: React.ReactNode
  currentSort: { field: string | null; direction: SortDirection }
  onSort: (field: string) => void
  className?: string
  align?: 'left' | 'center' | 'right'
  disabled?: boolean
  tooltip?: string
}

/**
 * Reusable sortable table header component
 * Provides consistent sorting UI across all admin tables
 * Follows VCoin's design patterns
 */
export default function SortableHeader({
  field,
  children,
  currentSort,
  onSort,
  className = '',
  align = 'left',
  disabled = false,
  tooltip
}: SortableHeaderProps) {
  const isSorted = currentSort.field === field
  const direction = isSorted ? currentSort.direction : null

  const handleClick = () => {
    if (!disabled) {
      onSort(field)
    }
  }

  const alignmentClasses = {
    left: 'justify-start',
    center: 'justify-center',
    right: 'justify-end'
  }

  const SortIcon = () => {
    if (!isSorted) {
      return <ChevronsUpDown className="h-4 w-4 text-gray-400 group-hover:text-gray-600" />
    }
    
    return direction === 'asc' 
      ? <ChevronUp className="h-4 w-4 text-indigo-600" />
      : <ChevronDown className="h-4 w-4 text-indigo-600" />
  }

  return (
    <button
      onClick={handleClick}
      disabled={disabled}
      className={`
        group flex items-center space-x-1 ${alignmentClasses[align]} w-full
        text-left font-medium text-gray-900 hover:text-gray-700
        ${disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}
        ${isSorted ? 'text-indigo-900' : ''}
        ${className}
      `}
      title={tooltip || `Sort by ${children}`}
    >
      <span>{children}</span>
      {!disabled && <SortIcon />}
    </button>
  )
}

/**
 * Mobile-friendly sortable header for responsive tables
 * Shows sort indicator without hover states
 */
export function MobileSortableHeader({
  field,
  children,
  currentSort,
  onSort,
  className = '',
  disabled = false
}: Omit<SortableHeaderProps, 'align' | 'tooltip'>) {
  const isSorted = currentSort.field === field
  const direction = isSorted ? currentSort.direction : null

  const handleClick = () => {
    if (!disabled) {
      onSort(field)
    }
  }

  return (
    <button
      onClick={handleClick}
      disabled={disabled}
      className={`
        flex items-center justify-between w-full p-2 rounded
        text-sm font-medium text-gray-900 bg-gray-50
        ${disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer hover:bg-gray-100'}
        ${isSorted ? 'bg-indigo-50 text-indigo-900' : ''}
        ${className}
      `}
    >
      <span>{children}</span>
      {!disabled && (
        <div className="flex items-center space-x-1">
          {isSorted && (
            <span className="text-xs text-gray-500">
              {direction === 'asc' ? '↑' : '↓'}
            </span>
          )}
          <ChevronsUpDown className="h-4 w-4 text-gray-400" />
        </div>
      )}
    </button>
  )
}

/**
 * Sort indicator component for custom table implementations
 */
export function SortIndicator({ 
  direction 
}: { 
  direction: SortDirection | null 
}) {
  if (!direction) return null
  
  return (
    <span className="ml-1 text-indigo-600">
      {direction === 'asc' ? '↑' : '↓'}
    </span>
  )
}
