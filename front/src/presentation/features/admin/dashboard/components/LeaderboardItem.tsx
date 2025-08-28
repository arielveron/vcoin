/**
 * Leaderboard Item Component
 * Displays individual student ranking with achievements
 */
'use client'

import { Medal, Users, Crown, Award } from 'lucide-react'
import { AchievementWithProgress } from '@/types/database'
import IconRenderer from '@/components/icon-renderer'
import { ACHIEVEMENT_RARITIES } from '@/shared/constants'

export interface LeaderboardItemData {
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
  onAchievementMouseEnter: (achievement: AchievementWithProgress, event: React.MouseEvent) => void
  onAchievementMouseLeave: () => void
}

interface LeaderboardItemProps {
  item: LeaderboardItemData
}

// Helper function to get rank styling
const getRankStyling = (rank: number) => {
  switch (rank) {
    case 1:
      return {
        bgColor: 'bg-gradient-to-r from-yellow-100 to-amber-100',
        borderColor: 'border-yellow-300',
        textColor: 'text-yellow-800',
        icon: Crown,
        iconColor: 'text-yellow-600'
      }
    case 2:
      return {
        bgColor: 'bg-gradient-to-r from-gray-100 to-slate-100',
        borderColor: 'border-gray-300',
        textColor: 'text-gray-800',
        icon: Medal,
        iconColor: 'text-gray-600'
      }
    case 3:
      return {
        bgColor: 'bg-gradient-to-r from-orange-100 to-amber-100',
        borderColor: 'border-orange-300',
        textColor: 'text-orange-800',
        icon: Award,
        iconColor: 'text-orange-600'
      }
    default:
      return {
        bgColor: 'bg-white',
        borderColor: 'border-gray-200',
        textColor: 'text-gray-900',
        icon: Users,
        iconColor: 'text-gray-500'
      }
  }
}

export default function LeaderboardItem({ item }: LeaderboardItemProps) {
  const styling = getRankStyling(item.rank)
  const IconComponent = styling.icon

  // Helper function to get rarity styling based on centralized constants
  const getRarityClasses = (rarity: string) => {
    const rarityConfig = ACHIEVEMENT_RARITIES.find(r => r.value === rarity)
    if (!rarityConfig) return { bgColor: 'bg-gray-100', textColor: 'text-gray-800' }
    
    switch (rarityConfig.color) {
      case 'green': return { bgColor: 'bg-green-100', textColor: 'text-green-800' }
      case 'blue': return { bgColor: 'bg-blue-100', textColor: 'text-blue-800' }
      case 'purple': return { bgColor: 'bg-purple-100', textColor: 'text-purple-800' }
      case 'orange': return { bgColor: 'bg-yellow-100', textColor: 'text-yellow-800' }
      default: return { bgColor: 'bg-gray-100', textColor: 'text-gray-800' }
    }
  }

  return (
    <div
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
                <span className="text-2xl font-bold text-gray-800">#{item.rank}</span>
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
            <div className="text-gray-500">Total Invested</div>
            <div className="font-semibold text-orange-600">{item.originalInvestedFormatted}</div>
          </div>
          <div>
            <div className="text-gray-500">Achievements</div>
            <div className="flex items-center space-x-1">
              <span className="font-semibold text-purple-600">{item.achievementCount}</span>
              {item.unlockedAchievements.slice(0, 3).map((achievement) => {
                const rarityStyle = getRarityClasses(achievement.rarity)
                return (
                  <div
                    key={achievement.id}
                    className={`w-4 h-4 rounded-full flex items-center justify-center ${rarityStyle.bgColor} cursor-pointer`}
                    onMouseEnter={(e) => item.onAchievementMouseEnter(achievement, e)}
                    onMouseLeave={item.onAchievementMouseLeave}
                  >
                    <IconRenderer
                      name={achievement.icon_config.name}
                      library={achievement.icon_config.library}
                      size={achievement.icon_config.size || 16}
                      color={achievement.icon_config.color || '#6B7280'}
                      className={`w-2 h-2 ${rarityStyle.textColor}`}
                    />
                  </div>
                )
              })}
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
              <div className="flex items-center space-x-2">
                <span className="text-2xl font-bold text-gray-800">#{item.rank}</span>
              </div>
            </div>
            
            <div className="min-w-0 flex-1">
              <div className={`text-lg font-semibold ${styling.textColor} truncate`}>
                {item.student.name}
              </div>
              <div className="text-sm text-gray-500">
                Registro: {item.student.registro} | Class ID: {item.student.class_id}
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
              <div className="text-gray-500">Total Invested</div>
              <div className="font-semibold text-orange-600">{item.originalInvestedFormatted}</div>
            </div>
            <div className="text-center min-w-[120px]">
              <div className="text-gray-500">Achievements</div>
              <div className="flex items-center justify-center space-x-1">
                <span className="font-semibold text-purple-600">{item.achievementCount}</span>
                <div className="flex items-center space-x-1 ml-2">
                  {item.unlockedAchievements.slice(0, 4).map((achievement) => {
                    const rarityStyle = getRarityClasses(achievement.rarity)
                    return (
                      <div
                        key={achievement.id}
                        className={`w-6 h-6 rounded-full flex items-center justify-center ${rarityStyle.bgColor} cursor-pointer transform hover:scale-110 transition-transform`}
                        onMouseEnter={(e) => item.onAchievementMouseEnter(achievement, e)}
                        onMouseLeave={item.onAchievementMouseLeave}
                      >
                        <IconRenderer
                          name={achievement.icon_config.name}
                          library={achievement.icon_config.library}
                          size={achievement.icon_config.size || 20}
                          color={achievement.icon_config.color || '#6B7280'}
                          className={`w-3 h-3 ${rarityStyle.textColor}`}
                        />
                      </div>
                    )
                  })}
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
}
