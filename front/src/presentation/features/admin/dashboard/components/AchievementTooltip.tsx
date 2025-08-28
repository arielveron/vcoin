/**
 * Achievement Tooltip Component
 * Shows achievement details on hover with name, description, and metadata
 */
'use client'

import { useState, useRef, useEffect } from 'react'
import { AchievementWithProgress } from '@/types/database'
import { ACHIEVEMENT_RARITIES } from '@/shared/constants'

interface AchievementTooltipProps {
  achievement: AchievementWithProgress
  children: React.ReactNode
}

// Helper function to get rarity styling
const getRarityClasses = (rarity: string) => {
  const rarityConfig = ACHIEVEMENT_RARITIES.find(r => r.value === rarity)
  if (!rarityConfig) return 'bg-gray-100 text-gray-800 border-gray-200'
  
  switch (rarityConfig.color) {
    case 'green': return 'bg-green-100 text-green-800 border-green-200'
    case 'blue': return 'bg-blue-100 text-blue-800 border-blue-200'
    case 'purple': return 'bg-purple-100 text-purple-800 border-purple-200'
    case 'orange': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
    default: return 'bg-gray-100 text-gray-800 border-gray-200'
  }
}

export default function AchievementTooltip({ achievement, children }: AchievementTooltipProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const triggerRef = useRef<HTMLDivElement>(null)
  const tooltipRef = useRef<HTMLDivElement>(null)

  const updatePosition = (event: MouseEvent) => {
    if (!tooltipRef.current) return

    const tooltip = tooltipRef.current
    const rect = tooltip.getBoundingClientRect()
    const viewportWidth = window.innerWidth
    const viewportHeight = window.innerHeight

    let x = event.clientX + 10
    let y = event.clientY + 10

    // Adjust horizontal position if tooltip would go off-screen
    if (x + rect.width > viewportWidth) {
      x = event.clientX - rect.width - 10
    }

    // Adjust vertical position if tooltip would go off-screen
    if (y + rect.height > viewportHeight) {
      y = event.clientY - rect.height - 10
    }

    setPosition({ x, y })
  }

  useEffect(() => {
    const handleMouseMove = (event: MouseEvent) => {
      if (isVisible) {
        updatePosition(event)
      }
    }

    document.addEventListener('mousemove', handleMouseMove)
    return () => document.removeEventListener('mousemove', handleMouseMove)
  }, [isVisible])

  const handleMouseEnter = (event: React.MouseEvent) => {
    setIsVisible(true)
    updatePosition(event.nativeEvent)
  }

  const handleMouseLeave = () => {
    setIsVisible(false)
  }

  // Parse trigger config for additional details
  const triggerDetails = achievement.trigger_config ? {
    metric: achievement.trigger_config.metric || 'Unknown',
    operator: achievement.trigger_config.operator || '>=',
    value: achievement.trigger_config.value || 0
  } : null

  const getTriggerDescription = () => {
    if (!triggerDetails) return null
    
    const { metric, operator, value } = triggerDetails
    
    switch (metric) {
      case 'investment_count':
        return `Receive ${operator === '>=' ? 'at least' : ''} ${value} investment${value !== 1 ? 's' : ''}`
      case 'total_invested':
        return `Accumulate ${operator === '>=' ? 'at least' : ''} ${value.toLocaleString('es-AR', { style: 'currency', currency: 'ARS' })} VCoins`
      case 'streak_days':
        return `Maintain a ${value}-day investment streak`
      default:
        if (metric.startsWith('category_')) {
          const categoryId = metric.replace('category_', '').replace('_count', '')
          return `Receive ${value} investment${value !== 1 ? 's' : ''} in category ${categoryId}`
        }
        return `${metric} ${operator} ${value}`
    }
  }

  return (
    <>
      <div
        ref={triggerRef}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className="cursor-help"
      >
        {children}
      </div>

      {isVisible && (
        <div
          ref={tooltipRef}
          className="fixed z-50 pointer-events-none"
          style={{
            left: `${position.x}px`,
            top: `${position.y}px`,
          }}
        >
          <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-4 max-w-xs">
            <div className="space-y-3">
              {/* Achievement Name */}
              <div>
                <h4 className="font-semibold text-gray-900 text-sm">
                  {achievement.name}
                </h4>
              </div>

              {/* Description */}
              <div>
                <p className="text-xs text-gray-600 leading-relaxed">
                  {achievement.description}
                </p>
              </div>

              {/* Rarity and Points */}
              <div className="flex items-center justify-between">
                <span className={`px-2 py-1 text-xs rounded-full border ${getRarityClasses(achievement.rarity)}`}>
                  {achievement.rarity}
                </span>
                <span className="text-xs font-medium text-orange-600">
                  {achievement.points} pts
                </span>
              </div>

              {/* Trigger Details */}
              {triggerDetails && achievement.trigger_type === 'automatic' && (
                <div className="pt-2 border-t border-gray-100">
                  <div className="text-xs text-gray-500">
                    <span className="font-medium">Requirement:</span>
                  </div>
                  <div className="text-xs text-gray-700">
                    {getTriggerDescription()}
                  </div>
                </div>
              )}

              {/* Manual Achievement Note */}
              {achievement.trigger_type === 'manual' && (
                <div className="pt-2 border-t border-gray-100">
                  <div className="text-xs text-orange-600 font-medium">
                    Manually awarded by admin
                  </div>
                </div>
              )}

              {/* Category */}
              <div className="pt-1">
                <span className="text-xs text-gray-500 capitalize">
                  {achievement.category} Achievement
                </span>
              </div>
            </div>

            {/* Tooltip arrow */}
            <div 
              className="absolute w-2 h-2 bg-white border-l border-t border-gray-200 transform rotate-45"
              style={{
                left: '12px',
                top: '-5px',
              }}
            />
          </div>
        </div>
      )}
    </>
  )
}
