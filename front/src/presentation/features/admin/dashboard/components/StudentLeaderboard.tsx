/**
 * Student Leaderboard Component
 * Main orchestrator for student rankings display - refactored to follow VCoin architectural guidelines
 */
'use client'

import { useState } from 'react'
import { Trophy } from 'lucide-react'
import { AchievementWithProgress, Class } from '@/types/database'
import AchievementTooltip from './AchievementTooltip'
import LeaderboardStats from './LeaderboardStats'
import LeaderboardFilters from './LeaderboardFilters'
import LeaderboardList from './LeaderboardList'

export type StudentLeaderboardData = {
  student: {
    id: number
    name: string
    registro: number
    email: string
    class_id: number
  }
  totalVCoins: number
  totalVCoinsFormatted: string
  originalInvested: number
  originalInvestedFormatted: string
  investmentCount: number
  achievementCount: number
  totalAchievementPoints: number
  unlockedAchievements: AchievementWithProgress[]
  rank: number
}

interface StudentLeaderboardProps {
  leaderboardData: StudentLeaderboardData[]
  classes: Class[]
  onClassFilterChange?: (classId: number | null) => void
  currentClassFilter?: number | null
}

export default function StudentLeaderboard({
  leaderboardData,
  classes = [],
  onClassFilterChange,
  currentClassFilter
}: StudentLeaderboardProps) {
  const [hoveredAchievement, setHoveredAchievement] = useState<{
    achievement: AchievementWithProgress
    position: { x: number; y: number }
  } | null>(null)

  // Handle class filter change
  const handleClassFilterChange = (classId: number | null) => {
    onClassFilterChange?.(classId)
  }

  // Handle mouse enter for achievement tooltip
  const handleAchievementMouseEnter = (
    achievement: AchievementWithProgress,
    event: React.MouseEvent
  ) => {
    const rect = event.currentTarget.getBoundingClientRect()
    setHoveredAchievement({
      achievement,
      position: {
        x: rect.left + rect.width / 2,
        y: rect.top - 10
      }
    })
  }

  // Handle mouse leave for achievement tooltip
  const handleAchievementMouseLeave = () => {
    setHoveredAchievement(null)
  }

  // Filter data by class if filter is active
  const filteredData = currentClassFilter
    ? leaderboardData.filter(item => item.student.class_id === currentClassFilter)
    : leaderboardData

  // Transform data for LeaderboardList component
  const leaderboardItemsData = filteredData.map(item => ({
    ...item,
    onAchievementMouseEnter: handleAchievementMouseEnter,
    onAchievementMouseLeave: handleAchievementMouseLeave
  }))

  // Format currency helper
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  // Calculate summary statistics from filtered data
  const totalStudents = filteredData.length
  const averageVCoins = filteredData.length > 0 
    ? filteredData.reduce((sum, item) => sum + item.totalVCoins, 0) / filteredData.length 
    : 0

  // Get top performer data
  const topBalanceFormatted = filteredData.length > 0 ? filteredData[0].totalVCoinsFormatted : '$0'
  const averageBalanceFormatted = formatCurrency(averageVCoins)

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-yellow-100 rounded-lg">
            <Trophy className="h-6 w-6 text-yellow-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Student Leaderboard</h3>
            <p className="text-sm text-gray-600">Top performers by VCoin accumulated</p>
          </div>
        </div>
      </div>

      {/* Summary Stats */}
      <LeaderboardStats
        totalStudents={totalStudents}
        topBalance={topBalanceFormatted}
        averageBalance={averageBalanceFormatted}
      />

      {/* Class Filter */}
      <LeaderboardFilters
        classes={classes}
        currentClassFilter={currentClassFilter}
        onClassFilterChange={handleClassFilterChange}
      />

      {/* Leaderboard List */}
      <LeaderboardList leaderboardData={leaderboardItemsData} />

      {/* Achievement Tooltip */}
      {hoveredAchievement && (
        <AchievementTooltip achievement={hoveredAchievement.achievement}>
          <div
            style={{
              position: 'fixed',
              left: hoveredAchievement.position.x,
              top: hoveredAchievement.position.y,
              pointerEvents: 'none',
              zIndex: 9999
            }}
          />
        </AchievementTooltip>
      )}
    </div>
  )
}
