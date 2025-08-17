/**
 * Student Investment Filters Component
 * Filters for investment-related data within the Students admin page
 * Follows the Cross-Entity Filter Pattern to maintain architectural consistency
 */
'use client'

import { useState } from 'react'
import { Search, Filter } from 'lucide-react'
import type { InvestmentCategory } from '@/types/database'

interface AdminFilters {
  categoryId: number | null
  date: string | null
  searchText: string | null
}

interface StudentInvestmentFiltersProps {
  categories: InvestmentCategory[]
  filters: AdminFilters
  onFiltersChange: (filters: Partial<AdminFilters>) => void
  className?: string
}

export default function StudentInvestmentFilters({
  categories,
  filters,
  onFiltersChange,
  className = ""
}: StudentInvestmentFiltersProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  const hasActiveFilters = filters.categoryId || filters.date || filters.searchText

  const toggle = () => setIsExpanded(!isExpanded)

  return (
    <div className={`border rounded-lg bg-gray-50 ${className}`}>
      {/* Filter Header - Always visible */}
      <div 
        className="flex items-center justify-between p-3 cursor-pointer hover:bg-gray-100 transition-colors"
        onClick={toggle}
      >
        <div className="flex items-center space-x-2">
          <Filter className="h-4 w-4 text-gray-600" />
          <span className="text-sm font-medium text-gray-700">
            Investment Filters
          </span>
          {hasActiveFilters && (
            <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
              Active
            </span>
          )}
        </div>
        <div className="text-gray-400">
          {isExpanded ? '−' : '+'}
        </div>
      </div>

      {/* Collapsible Filter Content */}
      {isExpanded && (
        <div className="border-t bg-white p-4 space-y-3">
          {/* Search Text Filter - Full width */}
          <div className="w-full relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-gray-400" />
            </div>
            <input
              type="text"
              value={filters.searchText || ''}
              onChange={(e) => onFiltersChange({ 
                searchText: e.target.value || null 
              })}
              placeholder="Filter by investment concept..."
              className="w-full pl-10 pr-3 py-2 rounded-md border-gray-300 text-sm focus:border-indigo-500 focus:ring-indigo-500"
            />
          </div>
          
          {/* Category and Date Filters - Grid layout */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {/* Category Filter */}
            <select
              value={filters.categoryId || ''}
              onChange={(e) => onFiltersChange({ 
                categoryId: e.target.value ? parseInt(e.target.value) : null 
              })}
              className="rounded-md border-gray-300 text-sm py-2 px-3 focus:border-indigo-500 focus:ring-indigo-500"
            >
              <option value="">All Categories</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>{category.name}</option>
              ))}
            </select>

            {/* Date Filter */}
            <input
              type="date"
              value={filters.date || ''}
              onChange={(e) => onFiltersChange({ 
                date: e.target.value || null 
              })}
              placeholder="Filter by date"
              className="rounded-md border-gray-300 text-sm py-2 px-3 focus:border-indigo-500 focus:ring-indigo-500"
            />
          </div>

          {/* Clear Filters Button */}
          {hasActiveFilters && (
            <div className="pt-2">
              <button
                onClick={() => onFiltersChange({ 
                  categoryId: null, 
                  date: null, 
                  searchText: null 
                })}
                className="text-sm text-gray-600 hover:text-gray-800 underline"
              >
                Clear investment filters
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
