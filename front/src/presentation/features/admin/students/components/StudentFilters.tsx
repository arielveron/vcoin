/**
 * Student Filters Component
 * Handles filtering of students by class and text search
 */
'use client'

import type { Class } from '@/types/database'
import { DebouncedSearchInput } from '@/shared/components'

interface AdminFilters {
  classId: number | null
  studentId: number | null
  categoryId: number | null
  date: string | null
  searchText: string | null
  studentSearchText: string | null  // For student name/registro search
  investmentSearchText: string | null  // For investment concept search
}

interface StudentFiltersProps {
  classes: Class[]
  filters: AdminFilters
  onFiltersChange: (filters: Partial<AdminFilters>) => void
  className?: string
}

export default function StudentFilters({
  classes,
  filters,
  onFiltersChange,
  className = ""
}: StudentFiltersProps) {
  return (
    <div className={`space-y-3 ${className}`}>
      {/* Text Search Filter */}
      <DebouncedSearchInput
        value={filters.studentSearchText || filters.searchText}
        onChange={(value) => onFiltersChange({ studentSearchText: value })}
        placeholder="Search by name or registro number..."
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
          className="w-full rounded-md border-gray-300 text-sm py-2 px-3 focus:border-indigo-500 focus:ring-indigo-500"
        >
          <option value="">All Classes</option>
          {classes.map((cls) => (
            <option key={cls.id} value={cls.id}>{cls.name}</option>
          ))}
        </select>
      </div>
    </div>
  )
}
