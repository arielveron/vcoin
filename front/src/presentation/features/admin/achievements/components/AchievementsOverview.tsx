/**
 * Achievements Overview Component
 * Displays achievement grid with filtering and processing controls
 * Extracted from achievements-admin-client.tsx
 */
'use client'

import { useState } from 'react'
import { Trophy, Play } from 'lucide-react'
import IconRenderer from '@/components/icon-renderer'
import { sortAchievementsForClient } from '@/utils/achievement-sorting'
import type { AchievementForClient } from '@/utils/admin-data-types'

interface AchievementsOverviewProps {
  achievements: AchievementForClient[]
  onProcess: () => Promise<void>
}

export default function AchievementsOverview({ achievements, onProcess }: AchievementsOverviewProps) {
  const [filter, setFilter] = useState<'all' | 'automatic' | 'manual'>('all')
  const [isProcessing, setIsProcessing] = useState(false)

  const filteredAchievements = sortAchievementsForClient(
    filter === 'all' 
      ? achievements 
      : achievements.filter(a => a.trigger_type === filter)
  )

  const handleProcess = async () => {
    setIsProcessing(true)
    try {
      await onProcess()
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <div className="bg-white shadow rounded-lg p-4 lg:p-6">
      <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-4 mb-6">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center">
          <Trophy className="h-5 w-5 mr-2 text-yellow-600" />
          Achievement Overview
        </h3>
        
        <button
          onClick={handleProcess}
          disabled={isProcessing}
          className="w-full lg:w-auto inline-flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Play size={16} />
          {isProcessing ? 'Processing...' : 'Process Achievements'}
        </button>
      </div>
      
      {/* Filter Tabs - Mobile-friendly */}
      <div className="flex flex-wrap gap-2 mb-6">
        {[
          { key: 'all', label: 'All Achievements' },
          { key: 'automatic', label: 'Automatic' },
          { key: 'manual', label: 'Manual' }
        ].map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setFilter(key as typeof filter)}
            className={`px-4 py-2 text-sm font-medium rounded-md min-h-[44px] ${
              filter === key
                ? 'bg-blue-100 text-blue-700'
                : 'text-gray-500 hover:text-gray-700 bg-gray-50'
            }`}
          >
            {label} ({achievements.filter(a => key === 'all' || a.trigger_type === key).length})
          </button>
        ))}
      </div>

      {/* Achievement Grid - Responsive */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
        {filteredAchievements.map((achievement) => (
          <div key={achievement.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0">
                <IconRenderer 
                  name={achievement.icon_config.name}
                  library={achievement.icon_config.library}
                  size={achievement.icon_config.size}
                  color={achievement.icon_config.color}
                  animationClass={achievement.icon_config.animationClass}
                  className="w-8 h-8"
                />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-medium text-gray-900 truncate">
                  {achievement.name}
                </h3>
                <p className="text-xs text-gray-500 mt-1">
                  {achievement.description}
                </p>
                <div className="flex items-center space-x-2 mt-2">
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    achievement.rarity === 'legendary' ? 'bg-yellow-100 text-yellow-800' :
                    achievement.rarity === 'epic' ? 'bg-purple-100 text-purple-800' :
                    achievement.rarity === 'rare' ? 'bg-blue-100 text-blue-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {achievement.rarity}
                  </span>
                  <span className="text-xs text-gray-500">
                    {achievement.points} pts
                  </span>
                  <span className={`text-xs px-2 py-1 rounded ${
                    achievement.trigger_type === 'manual' 
                      ? 'bg-orange-100 text-orange-700'
                      : 'bg-green-100 text-green-700'
                  }`}>
                    {achievement.trigger_type}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredAchievements.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          No achievements found for the selected filter.
        </div>
      )}
    </div>
  )
}
