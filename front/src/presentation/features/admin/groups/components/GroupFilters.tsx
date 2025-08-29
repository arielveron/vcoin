/**
 * GroupFilters Component
 * Filter controls for groups management
 * Following VCoin standard pattern like StudentFilters and InvestmentFilters
 */
'use client'

import { DebouncedSearchInput } from '@/shared/components'
import type { ClassForClient } from '@/utils/admin-data-types'

interface AdminFilters {
  classId: number | null
  studentId: number | null
  categoryId: number | null
  date: string | null
  searchText: string | null
  studentSearchText: string | null
  investmentSearchText: string | null
  achievementCategory: string | null
  achievementRarity: string | null
  achievementId: number | null
}

interface GroupFiltersProps {
  classes: ClassForClient[]
  filters: AdminFilters
  onFiltersChange: (filters: Partial<AdminFilters>) => void
  className?: string
}

export default function GroupFilters({
  classes,
  filters,
  onFiltersChange,
  className = ""
}: GroupFiltersProps) {
  return (
    <div className={`space-y-3 ${className}`}>
      {/* Text Search Filter */}
      <DebouncedSearchInput
        value={filters.searchText}
        onChange={(value) => onFiltersChange({ searchText: value })}
        placeholder="Search groups by name or number..."
        debounceMs={300}
        autoFocus={true}
      />
      
      {/* Class Filter */}
      <div className="w-full">
        <select
          value={filters.classId || ''}
          onChange={(e) => onFiltersChange({ 
            classId: e.target.value ? parseInt(e.target.value) : null
          })}
          className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="">All Classes</option>
          {classes.map((classItem) => (
            <option key={classItem.id} value={classItem.id}>
              {classItem.name}
            </option>
          ))}
        </select>
      </div>
    </div>
  )
}
