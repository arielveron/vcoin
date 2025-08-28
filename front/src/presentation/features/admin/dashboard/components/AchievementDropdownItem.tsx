/**
 * Achievement Dropdown Item Component
 * Displays individual achievement details in dropdown menus
 */
'use client'

import { AchievementWithProgress } from '@/types/database'
import IconRenderer from '@/components/icon-renderer'
import { ACHIEVEMENT_RARITIES } from '@/shared/constants'

interface AchievementDropdownItemProps {
  achievement: AchievementWithProgress
  size?: 'sm' | 'md' | 'lg'
  showFullDescription?: boolean
}

export default function AchievementDropdownItem({ 
  achievement, 
  size = 'md',
  showFullDescription = true 
}: AchievementDropdownItemProps) {
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

  const rarityStyle = getRarityClasses(achievement.rarity)

  // Size configurations
  const sizeConfig = {
    sm: {
      container: 'p-1.5',
      icon: { size: 14, className: 'w-5 h-5' },
      iconContainer: 'w-5 h-5',
      title: 'text-xs',
      description: 'text-xs',
      rarity: 'text-xs px-1 py-0.5',
      points: 'text-xs'
    },
    md: {
      container: 'p-2',
      icon: { size: 16, className: 'w-6 h-6' },
      iconContainer: 'w-6 h-6',
      title: 'text-xs',
      description: 'text-xs',
      rarity: 'text-xs px-1.5 py-0.5',
      points: 'text-xs'
    },
    lg: {
      container: 'p-2',
      icon: { size: 20, className: 'w-8 h-8' },
      iconContainer: 'w-8 h-8',
      title: 'text-sm',
      description: 'text-sm',
      rarity: 'text-xs px-2 py-1',
      points: 'text-sm'
    }
  }

  const config = sizeConfig[size]

  return (
    <div className={`flex items-center space-x-2 sm:space-x-3 hover:bg-gray-50 rounded ${config.container}`}>
      <div className={`${config.iconContainer} rounded-full flex items-center justify-center ${rarityStyle.bgColor} flex-shrink-0`}>
        <IconRenderer
          name={achievement.icon_config.name}
          library={achievement.icon_config.library}
          size={config.icon.size}
          color={achievement.icon_config.color || '#6B7280'}
          className={`${config.icon.className} ${rarityStyle.textColor}`}
        />
      </div>
      <div className="flex-1 min-w-0">
        <div className={`${config.title} font-medium text-gray-900 truncate`}>
          {achievement.name}
        </div>
        {showFullDescription && (
          <div className={`${config.description} text-gray-500 truncate`}>
            {achievement.description}
          </div>
        )}
        <div className="flex items-center space-x-2 sm:space-x-3 mt-1">
          <span className={`${config.rarity} rounded ${rarityStyle.bgColor} ${rarityStyle.textColor}`}>
            {achievement.rarity}
          </span>
          <span className={`${config.points} text-purple-600 font-medium`}>
            {achievement.points} pts
          </span>
        </div>
      </div>
    </div>
  )
}
