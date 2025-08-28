/**
 * Leaderboard Filters Component
 * Handles class filtering for the leaderboard
 */
'use client'

import { Class } from '@/types/database'

interface LeaderboardFiltersProps {
  classes: Class[]
  currentClassFilter?: number | null
  onClassFilterChange?: (classId: number | null) => void
}

export default function LeaderboardFilters({ 
  classes, 
  currentClassFilter, 
  onClassFilterChange 
}: LeaderboardFiltersProps) {
  return (
    <div className="flex flex-col lg:flex-row gap-3 lg:items-center">
      <select
        value={currentClassFilter || ''}
        onChange={(e) => onClassFilterChange?.(e.target.value ? parseInt(e.target.value) : null)}
        className="block w-full lg:w-auto px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
      >
        <option value="">All Classes</option>
        {classes.map((cls) => (
          <option key={cls.id} value={cls.id}>
            {cls.name}
          </option>
        ))}
      </select>
    </div>
  )
}
