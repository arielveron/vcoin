/**
 * Student Leaderboard Component
 * Displays top-performing students ranked by VCoin accumulation and achievements
 * Designed for admin dashboard view
 */
'use client'

import { useState } from 'react'
import { Trophy, Medal, Users, Crown, Award } from 'lucide-react'
import { Class, AchievementWithProgress } from '@/types/database'
import IconRenderer from '@/components/icon-renderer'
import AchievementTooltip from './AchievementTooltip'

export interface StudentLeaderboardData {
  student: {
    id: number
    name: string
    registro: number // Changed from string to number to match database
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

// Helper function to get rank styling with tie support
const getRankStyling = (rank: number, hasTies?: boolean) => {
  switch (rank) {
    case 1:
      return {
        bgColor: 'bg-gradient-to-r from-yellow-100 to-amber-100',
        borderColor: 'border-yellow-300',
        textColor: 'text-yellow-800',
        icon: Crown,
        iconColor: 'text-yellow-600',
        rankBadge: hasTies ? 'bg-yellow-500 text-white' : 'bg-yellow-500 text-white'
      }
    case 2:
      return {
        bgColor: 'bg-gradient-to-r from-gray-100 to-slate-100',
        borderColor: 'border-gray-300',
        textColor: 'text-gray-800',
        icon: Medal,
        iconColor: 'text-gray-600',
        rankBadge: hasTies ? 'bg-gray-500 text-white' : 'bg-gray-500 text-white'
      }
    case 3:
      return {
        bgColor: 'bg-gradient-to-r from-orange-100 to-amber-100',
        borderColor: 'border-orange-300',
        textColor: 'text-orange-800',
        icon: Award,
        iconColor: 'text-orange-600',
        rankBadge: hasTies ? 'bg-orange-500 text-white' : 'bg-orange-500 text-white'
      }
    default:
      return {
        bgColor: 'bg-white',
        borderColor: 'border-gray-200',
        textColor: 'text-gray-900',
        icon: Users,
        iconColor: 'text-gray-500',
        rankBadge: 'bg-gray-400 text-white'
      }
  }
}

export default function StudentLeaderboard({ 
  leaderboardData, 
  classes, 
  onClassFilterChange,
  currentClassFilter 
}: StudentLeaderboardProps) {
  const [showAll, setShowAll] = useState(false)
  
  // Determine how many items to show
  const displayData = showAll ? leaderboardData : leaderboardData.slice(0, 10)
  
  // Calculate some statistics
  const totalStudents = leaderboardData.length
  const avgVCoins = totalStudents > 0 
    ? leaderboardData.reduce((sum, item) => sum + item.totalVCoins, 0) / totalStudents 
    : 0

  // Detect ties for each rank
  const getTieInfo = (currentItem: StudentLeaderboardData) => {
    const sameRankStudents = leaderboardData.filter(item => 
      item.rank === currentItem.rank &&
      item.totalVCoins === currentItem.totalVCoins &&
      item.totalAchievementPoints === currentItem.totalAchievementPoints &&
      item.investmentCount === currentItem.investmentCount
    )
    return {
      hasTies: sameRankStudents.length > 1,
      tiedCount: sameRankStudents.length
    }
  }

  return (
    <div className="bg-white shadow rounded-lg p-4 lg:p-6">
      <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-4 mb-6">
        <div className="flex items-center">
          <Trophy className="h-5 w-5 mr-2 text-yellow-600" />
          <h3 className="text-lg font-semibold text-gray-900">Student Leaderboard</h3>
        </div>
        
        {/* Class Filter */}
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
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-blue-50 p-4 rounded-lg text-center">
          <div className="text-2xl font-bold text-blue-600">{totalStudents}</div>
          <div className="text-sm text-gray-600">Total Students</div>
        </div>
        <div className="bg-green-50 p-4 rounded-lg text-center">
          <div className="text-2xl font-bold text-green-600">
            {leaderboardData.length > 0 ? leaderboardData[0].totalVCoinsFormatted : '$0'}
          </div>
          <div className="text-sm text-gray-600">Top Balance</div>
        </div>
        <div className="bg-purple-50 p-4 rounded-lg text-center">
          <div className="text-2xl font-bold text-purple-600">
            {Math.round(avgVCoins).toLocaleString('es-AR', { style: 'currency', currency: 'ARS' })}
          </div>
          <div className="text-sm text-gray-600">Average Balance</div>
        </div>
      </div>

      {/* Leaderboard List */}
      <div className="space-y-3">
        {displayData.map((item) => {
          const tieInfo = getTieInfo(item)
          const styling = getRankStyling(item.rank, tieInfo.hasTies)
          const IconComponent = styling.icon
          
          return (
            <div
              key={item.student.id}
              className={`${styling.bgColor} ${styling.borderColor} border rounded-lg p-4 transition-all hover:shadow-md`}
            >
              {/* Mobile Layout */}
              <div className="block lg:hidden space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`${styling.bgColor} p-2 rounded-full`}>
                      <IconComponent className={`h-5 w-5 ${styling.iconColor}`} />
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-bold ${styling.rankBadge}`}>
                          #{item.rank}{tieInfo.hasTies && ` (tied ${tieInfo.tiedCount})`}
                        </span>
                        <span className={`text-lg font-semibold ${styling.textColor}`}>
                          {item.student.name}
                        </span>
                      </div>
                      <div className="text-sm text-gray-500">Registro: {item.student.registro}</div>
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <div className="text-gray-500">VCoins</div>
                    <div className="font-semibold text-green-600">{item.totalVCoinsFormatted}</div>
                  </div>
                  <div>
                    <div className="text-gray-500">Investments</div>
                    <div className="font-semibold text-blue-600">{item.investmentCount}</div>
                  </div>
                  <div>
                    <div className="text-gray-500">Points</div>
                    <div className="font-semibold text-orange-600">{item.totalAchievementPoints}</div>
                  </div>
                  <div>
                    <div className="text-gray-500">Achievements</div>
                    <div className="flex items-center space-x-1">
                      <span className="font-semibold text-purple-600">{item.achievementCount}</span>
                      {item.unlockedAchievements.slice(0, 3).map((achievement) => (
                        achievement.icon_config && (
                          <AchievementTooltip key={achievement.id} achievement={achievement}>
                            <IconRenderer
                              name={achievement.icon_config.name}
                              library={achievement.icon_config.library}
                              size={achievement.icon_config.size || 16}
                              color={achievement.icon_config.color || '#6B7280'}
                              className="flex-shrink-0"
                            />
                          </AchievementTooltip>
                        )
                      ))}
                      {item.unlockedAchievements.length > 3 && (
                        <span className="text-xs text-gray-500">+{item.unlockedAchievements.length - 3}</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Desktop Layout */}
              <div className="hidden lg:block">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-3">
                      <div className={`${styling.bgColor} p-2 rounded-full`}>
                        <IconComponent className={`h-6 w-6 ${styling.iconColor}`} />
                      </div>
                      <div className={`px-3 py-1 rounded-full text-sm font-bold ${styling.rankBadge}`}>
                        #{item.rank}{tieInfo.hasTies && ` (tied)`}
                      </div>
                    </div>
                    
                    <div className="min-w-0 flex-1">
                      <div className={`text-lg font-semibold ${styling.textColor} truncate`}>
                        {item.student.name}
                      </div>
                      <div className="text-sm text-gray-500">
                        Registro: {item.student.registro}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-6 text-sm">
                    <div className="text-center">
                      <div className="text-gray-500">VCoins</div>
                      <div className="font-semibold text-green-600">{item.totalVCoinsFormatted}</div>
                    </div>
                    <div className="text-center">
                      <div className="text-gray-500">Investments</div>
                      <div className="font-semibold text-blue-600">{item.investmentCount}</div>
                    </div>
                    <div className="text-center">
                      <div className="text-gray-500">Points</div>
                      <div className="font-semibold text-orange-600">{item.totalAchievementPoints}</div>
                    </div>
                    <div className="text-center min-w-[120px]">
                      <div className="text-gray-500">Achievements</div>
                      <div className="flex items-center justify-center space-x-1">
                        <span className="font-semibold text-purple-600">{item.achievementCount}</span>
                        <div className="flex items-center space-x-1 ml-2">
                          {item.unlockedAchievements.slice(0, 4).map((achievement) => (
                            achievement.icon_config && (
                              <AchievementTooltip key={achievement.id} achievement={achievement}>
                                <IconRenderer
                                  name={achievement.icon_config.name}
                                  library={achievement.icon_config.library}
                                  size={achievement.icon_config.size || 20}
                                  color={achievement.icon_config.color || '#6B7280'}
                                  className="flex-shrink-0"
                                />
                              </AchievementTooltip>
                            )
                          ))}
                          {item.unlockedAchievements.length > 4 && (
                            <span className="text-xs text-gray-500 ml-1">+{item.unlockedAchievements.length - 4}</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Show More/Less Button */}
      {leaderboardData.length > 10 && (
        <div className="mt-6 text-center">
          <button
            onClick={() => setShowAll(!showAll)}
            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md text-sm font-medium transition-colors"
          >
            {showAll ? 'Show Top 10' : `Show All ${leaderboardData.length} Students`}
          </button>
        </div>
      )}

      {leaderboardData.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <Trophy className="h-12 w-12 mx-auto mb-4 text-gray-300" />
          <p>No students found for the selected criteria.</p>
        </div>
      )}
    </div>
  )
}
