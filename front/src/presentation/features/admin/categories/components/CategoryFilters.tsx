/**
 * Category Filters Component
 * Handles filtering of categories by class
 */
'use client'

import type { Class } from '@/types/database'

interface AdminFilters {
  classId: number | null
  studentId: number | null
  categoryId: number | null
  date: string | null
  searchText: string | null
}

interface CategoryFiltersProps {
  classes: Class[]
  filters: AdminFilters
  onFiltersChange: (filters: Partial<AdminFilters>) => void
  className?: string
}

export default function CategoryFilters({
  classes,
  filters,
  onFiltersChange,
  className = ""
}: CategoryFiltersProps) {
  return (
    <div className={`space-y-3 ${className}`}>
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
