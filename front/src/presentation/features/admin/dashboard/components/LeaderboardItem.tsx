/**
 * Leaderboard Item Component
 * Displays individual student ranking with achievements
 */
'use client'

import { Medal, Users, Crown, Award, ChevronDown, ChevronUp, TrendingUp } from 'lucide-react'
import { useState, useRef, useEffect } from 'react'
import { AchievementWithProgress } from '@/types/database'
import IconRenderer from '@/components/icon-renderer'
import { ACHIEVEMENT_RARITIES } from '@/shared/constants'
import AchievementDropdownItem from './AchievementDropdownItem'
import InvestmentDropdownItem from './InvestmentDropdownItem'

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
  investments?: Array<{
    id: number
    fecha: Date
    monto: number
    montoFormatted: string
    concepto: string
    category?: {
      id: number
      nombre: string
      icon_config?: {
        name: string
        library: string
        size?: number
        color?: string
        backgroundColor?: string
        padding?: number
        animationClass?: string
        effectClass?: string
      }
      text_style?: {
        fontSize?: string
        fontWeight?: string
        fontStyle?: string
        textColor?: string
        effectClass?: string
        customCSS?: string
      }
    } | null
  }>
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
  const [isAchievementDropdownOpen, setIsAchievementDropdownOpen] = useState(false)
  const [isInvestmentDropdownOpen, setIsInvestmentDropdownOpen] = useState(false)
  const mobileDropdownRef = useRef<HTMLDivElement>(null)
  const desktopDropdownRef = useRef<HTMLDivElement>(null)
  const mobileInvestmentDropdownRef = useRef<HTMLDivElement>(null)
  const desktopInvestmentDropdownRef = useRef<HTMLDivElement>(null)
  const styling = getRankStyling(item.rank)
  const IconComponent = styling.icon

  // Close dropdowns when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if ((mobileDropdownRef.current && !mobileDropdownRef.current.contains(event.target as Node)) &&
          (desktopDropdownRef.current && !desktopDropdownRef.current.contains(event.target as Node))) {
        setIsAchievementDropdownOpen(false)
      }
      if ((mobileInvestmentDropdownRef.current && !mobileInvestmentDropdownRef.current.contains(event.target as Node)) &&
          (desktopInvestmentDropdownRef.current && !desktopInvestmentDropdownRef.current.contains(event.target as Node))) {
        setIsInvestmentDropdownOpen(false)
      }
    }

    if (isAchievementDropdownOpen || isInvestmentDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isAchievementDropdownOpen, isInvestmentDropdownOpen])

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

  // Helper function to get rarity order for sorting (highest first)
  const getRarityOrder = (rarity: string) => {
    const rarityConfig = ACHIEVEMENT_RARITIES.find(r => r.value === rarity)
    if (!rarityConfig) return 0
    
    switch (rarityConfig.value) {
      case 'legendary': return 4
      case 'epic': return 3
      case 'rare': return 2
      case 'common': return 1
      default: return 0
    }
  }

  // Sort achievements by points (highest first), then by rarity (highest first)
  const sortedAchievements = [...item.unlockedAchievements].sort((a, b) => {
    if (a.points !== b.points) {
      return b.points - a.points // Higher points first
    }
    return getRarityOrder(b.rarity) - getRarityOrder(a.rarity) // Higher rarity first
  })

  // Sort investments by date (most recent first)
  const sortedInvestments = item.investments ? [...item.investments].sort((a, b) => {
    return b.fecha.getTime() - a.fecha.getTime() // Most recent first
  }) : []

  // Toggle achievement dropdown
  const toggleAchievementDropdown = () => {
    setIsAchievementDropdownOpen(!isAchievementDropdownOpen)
    if (isInvestmentDropdownOpen) setIsInvestmentDropdownOpen(false) // Close other dropdown
  }

  // Toggle investment dropdown
  const toggleInvestmentDropdown = () => {
    setIsInvestmentDropdownOpen(!isInvestmentDropdownOpen)
    if (isAchievementDropdownOpen) setIsAchievementDropdownOpen(false) // Close other dropdown
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
          <div className="relative" ref={mobileInvestmentDropdownRef}>
            <div className="text-gray-500">Investments</div>
              <div 
                className="flex items-center space-x-1 cursor-pointer hover:bg-gray-50 p-1 rounded"
                onClick={toggleInvestmentDropdown}
              >
                <span className="font-semibold text-blue-600">{item.investmentCount}</span>
                <TrendingUp className="h-3 w-3 text-blue-400" />
                {/* Always show chevron for now to debug */}
                {isInvestmentDropdownOpen ? 
                  <ChevronUp className="h-3 w-3 text-gray-400 ml-1" /> : 
                  <ChevronDown className="h-3 w-3 text-gray-400 ml-1" />
                }
              </div>            {/* Investment Dropdown */}
            {isInvestmentDropdownOpen && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-64 overflow-y-auto">
                <div className="p-2">
                  <div className="text-xs font-medium text-gray-600 mb-2">
                    All Investments ({sortedInvestments.length})
                  </div>
                  {sortedInvestments.length > 0 ? (
                    sortedInvestments.map((investment) => (
                      <InvestmentDropdownItem 
                        key={investment.id} 
                        investment={investment} 
                        size="sm"
                      />
                    ))
                  ) : (
                    <div className="p-2 text-xs text-gray-500 text-center">
                      No investment data available
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
          <div className="col-span-2 relative" ref={mobileDropdownRef}>
            <div className="text-gray-500">Achievements</div>
            <div 
              className="flex items-center space-x-1 cursor-pointer hover:bg-gray-50 p-1 rounded"
              onClick={toggleAchievementDropdown}
            >
              <span className="font-semibold text-purple-600">{item.achievementCount}</span>
              {sortedAchievements.slice(0, 5).map((achievement) => {
                const rarityStyle = getRarityClasses(achievement.rarity)
                return (
                  <div
                    key={achievement.id}
                    className={`w-4 h-4 rounded-full flex items-center justify-center ${rarityStyle.bgColor}`}
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
              {sortedAchievements.length > 5 && (
                <span className="text-xs text-gray-500">+{sortedAchievements.length - 5}</span>
              )}
              {sortedAchievements.length > 0 && (
                isAchievementDropdownOpen ? 
                  <ChevronUp className="h-3 w-3 text-gray-400 ml-1" /> : 
                  <ChevronDown className="h-3 w-3 text-gray-400 ml-1" />
              )}
            </div>
            
            {/* Achievement Dropdown */}
            {isAchievementDropdownOpen && sortedAchievements.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-64 overflow-y-auto">
                <div className="p-2">
                  <div className="text-xs font-medium text-gray-600 mb-2">All Achievements ({sortedAchievements.length})</div>
                  {sortedAchievements.map((achievement) => (
                    <AchievementDropdownItem 
                      key={achievement.id} 
                      achievement={achievement} 
                      size="sm"
                    />
                  ))}
                </div>
              </div>
            )}
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
            <div className="text-center min-w-[100px] relative" ref={desktopInvestmentDropdownRef}>
              <div className="text-gray-500">Investments</div>
              <div 
                className="flex items-center justify-center space-x-1 cursor-pointer hover:bg-gray-50 p-1 rounded"
                onClick={toggleInvestmentDropdown}
              >
                <span className="font-semibold text-blue-600">{item.investmentCount}</span>
                <TrendingUp className="h-3 w-3 text-blue-400" />
                {/* Always show chevron for now to debug */}
                {isInvestmentDropdownOpen ? 
                  <ChevronUp className="h-3 w-3 text-gray-400 ml-1" /> : 
                  <ChevronDown className="h-3 w-3 text-gray-400 ml-1" />
                }
              </div>
              
              {/* Investment Dropdown */}
              {isInvestmentDropdownOpen && (
                <div className="absolute top-full right-0 mt-1 w-80 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-64 overflow-y-auto">
                  <div className="p-3">
                    <div className="text-sm font-medium text-gray-600 mb-3">
                      All Investments ({sortedInvestments.length})
                    </div>
                    {sortedInvestments.length > 0 ? (
                      sortedInvestments.map((investment) => (
                        <InvestmentDropdownItem 
                          key={investment.id} 
                          investment={investment} 
                          size="md"
                        />
                      ))
                    ) : (
                      <div className="p-2 text-sm text-gray-500 text-center">
                        No investment data available
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
            <div className="text-center min-w-[150px] relative" ref={desktopDropdownRef}>
              <div className="text-gray-500">Achievements</div>
              <div 
                className="flex items-center justify-center space-x-1 cursor-pointer hover:bg-gray-50 p-1 rounded"
                onClick={toggleAchievementDropdown}
              >
                <span className="font-semibold text-purple-600">{item.achievementCount}</span>
                <div className="flex items-center space-x-1 ml-2">
                  {sortedAchievements.slice(0, 5).map((achievement) => {
                    const rarityStyle = getRarityClasses(achievement.rarity)
                    return (
                      <div
                        key={achievement.id}
                        className={`w-6 h-6 rounded-full flex items-center justify-center ${rarityStyle.bgColor} transform hover:scale-110 transition-transform`}
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
                  {sortedAchievements.length > 5 && (
                    <span className="text-xs text-gray-500 ml-1">+{sortedAchievements.length - 5}</span>
                  )}
                </div>
                {sortedAchievements.length > 0 && (
                  isAchievementDropdownOpen ? 
                    <ChevronUp className="h-3 w-3 text-gray-400 ml-1" /> : 
                    <ChevronDown className="h-3 w-3 text-gray-400 ml-1" />
                )}
              </div>
              
              {/* Achievement Dropdown */}
              {isAchievementDropdownOpen && sortedAchievements.length > 0 && (
                <div className="absolute top-full right-0 mt-1 w-80 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-64 overflow-y-auto">
                  <div className="p-3">
                    <div className="text-sm font-medium text-gray-600 mb-3">All Achievements ({sortedAchievements.length})</div>
                    {sortedAchievements.map((achievement) => (
                      <AchievementDropdownItem 
                        key={achievement.id} 
                        achievement={achievement} 
                        size="lg"
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
