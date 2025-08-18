'use client'

import { useState } from 'react'
import { Filter, X, Search } from 'lucide-react'
import { useAdminFilters } from '@/presentation/features/admin/hooks/useAdminFilters'
import { Class, Student, InvestmentCategory, Achievement } from '@/types/database'
import { ACHIEVEMENT_CATEGORIES, ACHIEVEMENT_RARITIES } from '@/shared/constants/achievements'

interface MobileFiltersProps {
  classes: Class[]
  students?: Student[]
  categories?: InvestmentCategory[]
  achievements?: Achievement[]
  showStudentFilter?: boolean
  showCategoryFilter?: boolean
  showDateFilter?: boolean
  showSearchFilter?: boolean
  showAchievementFilters?: boolean
}

export default function MobileFilters({
  classes,
  students = [],
  categories = [],
  achievements = [],
  showStudentFilter = false,
  showCategoryFilter = false,
  showDateFilter = false,
  showSearchFilter = false,
  showAchievementFilters = false
}: MobileFiltersProps) {
  const { filters, updateFilters } = useAdminFilters()
  const [isOpen, setIsOpen] = useState(false)

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

  const activeFiltersCount = 
    (filters.classId ? 1 : 0) + 
    (filters.studentId ? 1 : 0) +
    (filters.categoryId ? 1 : 0) +
    (filters.date ? 1 : 0) +
    (filters.searchText ? 1 : 0) +
    (filters.achievementCategory ? 1 : 0) +
    (filters.achievementRarity ? 1 : 0) +
    (filters.achievementId ? 1 : 0)

  const handleClassChange = (value: string) => {
    const classId = value ? parseInt(value) : null
    updateFilters({ classId })
  }

  const handleStudentChange = (value: string) => {
    const studentId = value ? parseInt(value) : null
    updateFilters({ studentId })
  }

  const clearFilters = () => {
    updateFilters({ classId: null, studentId: null, categoryId: null, date: null, searchText: null, achievementCategory: null, achievementRarity: null, achievementId: null })
    setIsOpen(false)
  }

  const filteredStudents = filters.classId 
    ? students.filter(student => student.class_id === filters.classId)
    : students

  return (
    <>
      {/* Filter Button - Show only on mobile */}
      <button
        onClick={() => setIsOpen(true)}
        className="md:hidden inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
      >
        <Filter className="h-4 w-4" />
        <span>Filters</span>
        {activeFiltersCount > 0 && (
          <span className="inline-flex items-center justify-center w-5 h-5 text-xs font-medium text-white bg-indigo-600 rounded-full">
            {activeFiltersCount}
          </span>
        )}
      </button>

      {/* Mobile Filter Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="fixed inset-0 bg-black bg-opacity-25" onClick={() => setIsOpen(false)} />
          
          <div className="fixed bottom-0 left-0 right-0 bg-white rounded-t-lg shadow-lg">
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="text-lg font-medium text-gray-900">Filters</h3>
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-4 space-y-4">
              {/* Search Filter - First in mobile for better UX */}
              {showSearchFilter && (
                <div>
                  <label htmlFor="mobile-search" className="block text-sm font-medium text-gray-700 mb-2">
                    Search by Concept
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Search className="h-4 w-4 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      id="mobile-search"
                      value={filters.searchText || ''}
                      onChange={(e) => {
                        const searchText = e.target.value || null
                        updateFilters({ searchText })
                      }}
                      placeholder="Search by concept..."
                      className="block w-full pl-10 pr-3 py-2 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    />
                  </div>
                </div>
              )}

              {/* Class Filter */}
              <div>
                <label htmlFor="mobile-class" className="block text-sm font-medium text-gray-700 mb-2">
                  Filter by Class
                </label>
                <select
                  id="mobile-class"
                  value={filters.classId || ''}
                  onChange={(e) => handleClassChange(e.target.value)}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                >
                  <option value="">All Classes</option>
                  {classes.map((cls) => (
                    <option key={cls.id} value={cls.id}>
                      {cls.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Student Filter - Show only if enabled and students available */}
              {showStudentFilter && students.length > 0 && (
                <div>
                  <label htmlFor="mobile-student" className="block text-sm font-medium text-gray-700 mb-2">
                    Filter by Student
                  </label>
                  <select
                    id="mobile-student"
                    value={filters.studentId || ''}
                    onChange={(e) => handleStudentChange(e.target.value)}
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  >
                    <option value="">All Students</option>
                    {filteredStudents.map((student) => (
                      <option key={student.id} value={student.id}>
                        {student.name} (#{student.registro})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Category Filter */}
              {showCategoryFilter && (
                <div>
                  <label htmlFor="mobile-category" className="block text-sm font-medium text-gray-700 mb-2">
                    Filter by Category
                  </label>
                  <select
                    id="mobile-category"
                    value={filters.categoryId || ''}
                    onChange={(e) => {
                      const categoryId = e.target.value ? parseInt(e.target.value) : null
                      updateFilters({ categoryId })
                    }}
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  >
                    <option value="">All Categories</option>
                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Date Filter */}
              {showDateFilter && (
                <div>
                  <label htmlFor="mobile-date" className="block text-sm font-medium text-gray-700 mb-2">
                    Filter by Date
                  </label>
                  <input
                    type="date"
                    id="mobile-date"
                    value={filters.date || ''}
                    onChange={(e) => {
                      const date = e.target.value || null
                      updateFilters({ date })
                    }}
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  />
                </div>
              )}

              {/* Achievement Filters */}
              {showAchievementFilters && (
                <>
                  <div>
                    <label htmlFor="mobile-achievement-category" className="block text-sm font-medium text-gray-700 mb-2">
                      Achievement Category
                    </label>
                    <select
                      id="mobile-achievement-category"
                      value={filters.achievementCategory || ''}
                      onChange={(e) => {
                        const category = e.target.value || null
                        updateFilters({ 
                          achievementCategory: category,
                          // Clear achievement ID when category changes
                          achievementId: null
                        })
                      }}
                      className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    >
                      <option value="">All Categories</option>
                      {ACHIEVEMENT_CATEGORIES.map((category) => (
                        <option key={category.value} value={category.value}>
                          {category.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label htmlFor="mobile-achievement-rarity" className="block text-sm font-medium text-gray-700 mb-2">
                      Achievement Rarity
                    </label>
                    <select
                      id="mobile-achievement-rarity"
                      value={filters.achievementRarity || ''}
                      onChange={(e) => {
                        const rarity = e.target.value || null
                        updateFilters({ 
                          achievementRarity: rarity,
                          // Clear achievement ID when rarity changes
                          achievementId: null
                        })
                      }}
                      className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
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
                  <div>
                    <label htmlFor="mobile-achievement-specific" className="block text-sm font-medium text-gray-700 mb-2">
                      Specific Achievement
                    </label>
                    <select
                      id="mobile-achievement-specific"
                      value={filters.achievementId || ''}
                      onChange={(e) => {
                        const achievementId = e.target.value ? parseInt(e.target.value) : null
                        updateFilters({ achievementId })
                      }}
                      className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
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
                </>
              )}

              {/* Clear Filters Button */}
              {activeFiltersCount > 0 && (
                <button
                  onClick={clearFilters}
                  className="w-full px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                >
                  Clear All Filters
                </button>
              )}
            </div>

            <div className="p-4 border-t">
              <button
                onClick={() => setIsOpen(false)}
                className="w-full px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
              >
                Apply Filters
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
