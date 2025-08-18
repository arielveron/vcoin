/**
 * Achievement Filters Component
 * Handles filtering of students by achievement category and rarity
 */
'use client'

import type { AdminFilters } from '../../hooks/useAdminFilters'
import type { Achievement } from '@/types/database'
import { ACHIEVEMENT_CATEGORIES, ACHIEVEMENT_RARITIES } from '@/shared/constants'

interface AchievementFiltersProps {
  filters: AdminFilters
  onFiltersChange: (filters: Partial<AdminFilters>) => void
  achievements?: Achievement[]
  className?: string
}

export default function AchievementFilters({
  filters,
  onFiltersChange,
  achievements = [],
  className = ""
}: AchievementFiltersProps) {
  // Filter achievements based on selected category and rarity
  const filteredAchievements = achievements.filter(achievement => {
    if (filters.achievementCategory && achievement.category !== filters.achievementCategory) {
      return false
    }
    if (filters.achievementRarity && achievement.rarity !== filters.achievementRarity) {
      return false
    }
    return true
  })

  return (
    <div className={`space-y-3 ${className}`}>
      <div className="text-sm font-medium text-gray-700 mb-2">Achievement Filters</div>
      
      {/* Achievement Category Filter */}
      <div className="w-full">
        <select
          value={filters.achievementCategory || ''}
          onChange={(e) => onFiltersChange({ 
            achievementCategory: e.target.value || null,
            // Clear achievement ID when category changes
            achievementId: null
          })}
          className="w-full rounded-md border-gray-300 text-sm py-2 px-3 focus:border-indigo-500 focus:ring-indigo-500"
        >
          <option value="">All Categories</option>
          {ACHIEVEMENT_CATEGORIES.map((category) => (
            <option key={category.value} value={category.value}>
              {category.label}
            </option>
          ))}
        </select>
      </div>

      {/* Achievement Rarity Filter */}
      <div className="w-full">
        <select
          value={filters.achievementRarity || ''}
          onChange={(e) => onFiltersChange({ 
            achievementRarity: e.target.value || null,
            // Clear achievement ID when rarity changes
            achievementId: null
          })}
          className="w-full rounded-md border-gray-300 text-sm py-2 px-3 focus:border-indigo-500 focus:ring-indigo-500"
        >
          <option value="">All Rarities</option>
          {ACHIEVEMENT_RARITIES.map((rarity) => (
            <option key={rarity.value} value={rarity.value}>
              {rarity.label}
            </option>
          ))}
        </select>
      </div>

      {/* Specific Achievement Filter */}
      <div className="w-full">
        <select
          value={filters.achievementId || ''}
          onChange={(e) => onFiltersChange({ 
            achievementId: e.target.value ? parseInt(e.target.value) : null
          })}
          className="w-full rounded-md border-gray-300 text-sm py-2 px-3 focus:border-indigo-500 focus:ring-indigo-500"
          disabled={filteredAchievements.length === 0}
        >
          <option value="">All Achievements</option>
          {filteredAchievements.map((achievement) => (
            <option key={achievement.id} value={achievement.id}>
              {achievement.name}
            </option>
          ))}
        </select>
        {filteredAchievements.length === 0 && (
          <p className="text-xs text-gray-500 mt-1">
            Select category/rarity to filter specific achievements
          </p>
        )}
      </div>
    </div>
  )
}