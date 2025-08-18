/**
 * Student Filters Panel Component
 * Unified component containing both investment and achievement filters
 * Follows standardized collapsible filter pattern
 */
'use client'

import { useState } from 'react'
import { Search, Filter } from 'lucide-react'
import type { InvestmentCategory, Achievement } from '@/types/database'
import type { AdminFilters } from '../../hooks/useAdminFilters'
import { ACHIEVEMENT_CATEGORIES, ACHIEVEMENT_RARITIES } from '@/shared/constants'

interface StudentFiltersPanelProps {
  categories: InvestmentCategory[]
  achievements: Achievement[]
  filters: AdminFilters
  onFiltersChange: (filters: Partial<AdminFilters>) => void
  className?: string
}

export default function StudentFiltersPanel({
  categories,
  achievements,
  filters,
  onFiltersChange,
  className = ""
}: StudentFiltersPanelProps) {
  const [isInvestmentExpanded, setIsInvestmentExpanded] = useState(false)
  const [isAchievementExpanded, setIsAchievementExpanded] = useState(false)

  // Check for active filters
  const hasActiveInvestmentFilters = filters.categoryId || filters.date || filters.searchText
  const hasActiveAchievementFilters = filters.achievementCategory || filters.achievementRarity || filters.achievementId

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

  // Get unique categories from actual achievements data
  const availableCategories = Array.from(
    new Set(achievements.map(achievement => achievement.category))
  ).map(category => {
    const categoryConfig = ACHIEVEMENT_CATEGORIES.find(cat => cat.value === category)
    return {
      value: category,
      label: categoryConfig?.label || category,
      icon: categoryConfig?.icon || ''
    }
  })

  // Get unique rarities from actual achievements data
  const availableRarities = Array.from(
    new Set(achievements.map(achievement => achievement.rarity))
  ).map(rarity => {
    const rarityConfig = ACHIEVEMENT_RARITIES.find(rar => rar.value === rarity)
    return {
      value: rarity,
      label: rarityConfig?.label || rarity
    }
  })

  const toggleInvestment = () => setIsInvestmentExpanded(!isInvestmentExpanded)
  const toggleAchievement = () => setIsAchievementExpanded(!isAchievementExpanded)

  return (
    <div className={`${className}`}>
      {/* Desktop: Side by side layout, Mobile: Stacked layout */}
      <div className="flex flex-col lg:flex-row lg:gap-4 space-y-4 lg:space-y-0 lg:items-start">
        {/* Investment Filters */}
        <div className="border rounded-lg bg-gray-50 lg:flex-1 lg:self-start">
        {/* Investment Filter Header */}
        <div 
          className="flex items-center justify-between p-3 cursor-pointer hover:bg-gray-100 transition-colors"
          onClick={toggleInvestment}
        >
          <div className="flex items-center space-x-2">
            <Filter className="h-4 w-4 text-gray-600" />
            <span className="text-sm font-medium text-gray-700">
              Investment Filters
            </span>
            {hasActiveInvestmentFilters && (
              <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                Active
              </span>
            )}
          </div>
          <div className="text-gray-400">
            {isInvestmentExpanded ? '−' : '+'}
          </div>
        </div>

        {/* Investment Filter Content */}
        {isInvestmentExpanded && (
          <div className="border-t bg-white p-4 space-y-3">
            {/* Search Text Filter */}
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
            
            {/* Category and Date Filters */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
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

            {/* Clear Investment Filters */}
            {hasActiveInvestmentFilters && (
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

      {/* Achievement Filters */}
      <div className="border rounded-lg bg-gray-50 lg:flex-1 lg:self-start">
        {/* Achievement Filter Header */}
        <div 
          className="flex items-center justify-between p-3 cursor-pointer hover:bg-gray-100 transition-colors"
          onClick={toggleAchievement}
        >
          <div className="flex items-center space-x-2">
            <Filter className="h-4 w-4 text-gray-600" />
            <span className="text-sm font-medium text-gray-700">
              Achievement Filters
            </span>
            {hasActiveAchievementFilters && (
              <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-purple-100 text-purple-800">
                Active
              </span>
            )}
          </div>
          <div className="text-gray-400">
            {isAchievementExpanded ? '−' : '+'}
          </div>
        </div>

        {/* Achievement Filter Content */}
        {isAchievementExpanded && (
          <div className="border-t bg-white p-4 space-y-3">
            {/* Category and Rarity Filters */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {/* Achievement Category Filter */}
              <select
                value={filters.achievementCategory || ''}
                onChange={(e) => onFiltersChange({ 
                  achievementCategory: e.target.value || null,
                  // Clear achievement ID when category changes
                  achievementId: null
                })}
                className="rounded-md border-gray-300 text-sm py-2 px-3 focus:border-indigo-500 focus:ring-indigo-500"
              >
                <option value="">All Categories</option>
                {availableCategories.map((category) => (
                  <option key={category.value} value={category.value}>
                    {category.icon && `${category.icon} `}{category.label}
                  </option>
                ))}
              </select>

              {/* Achievement Rarity Filter */}
              <select
                value={filters.achievementRarity || ''}
                onChange={(e) => onFiltersChange({ 
                  achievementRarity: e.target.value || null,
                  // Clear achievement ID when rarity changes
                  achievementId: null
                })}
                className="rounded-md border-gray-300 text-sm py-2 px-3 focus:border-indigo-500 focus:ring-indigo-500"
              >
                <option value="">All Rarities</option>
                {availableRarities.map((rarity) => (
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
                className="w-full rounded-md border-gray-300 text-sm py-2 px-3 focus:border-indigo-500 focus:ring-indigo-500 font-mono"
                disabled={filteredAchievements.length === 0}
              >
                <option value="">All Achievements</option>
                {filteredAchievements.map((achievement) => {
                  // Get category config for icon
                  const categoryConfig = ACHIEVEMENT_CATEGORIES.find(cat => cat.value === achievement.category)
                  const icon = categoryConfig?.icon || '🏆'
                  
                  // Format the option text with rich information
                  const optionText = `${icon} ${achievement.name} • ${achievement.category} • ${achievement.rarity} • ${achievement.points}pts`
                  
                  return (
                    <option key={achievement.id} value={achievement.id}>
                      {optionText}
                    </option>
                  )
                })}
              </select>
              {filteredAchievements.length === 0 && (filters.achievementCategory || filters.achievementRarity) && (
                <p className="text-xs text-gray-500 mt-1">
                  No achievements found for selected category/rarity
                </p>
              )}
              {filteredAchievements.length === 0 && !filters.achievementCategory && !filters.achievementRarity && (
                <p className="text-xs text-gray-500 mt-1">
                  Select category/rarity to filter specific achievements
                </p>
              )}
            </div>

            {/* Clear Achievement Filters */}
            {hasActiveAchievementFilters && (
              <div className="pt-2">
                <button
                  onClick={() => onFiltersChange({ 
                    achievementCategory: null, 
                    achievementRarity: null, 
                    achievementId: null 
                  })}
                  className="text-sm text-gray-600 hover:text-gray-800 underline"
                >
                  Clear achievement filters
                </button>
              </div>
            )}
          </div>
        )}
      </div>
      </div> {/* Close flex container */}
    </div>
  )
}
