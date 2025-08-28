/**
 * Leaderboard List Component
 * Manages the display of student rankings with show more/less functionality
 */
'use client'

import { useState } from 'react'
import { Trophy } from 'lucide-react'
import LeaderboardItem, { LeaderboardItemData } from './LeaderboardItem'

interface LeaderboardListProps {
  leaderboardData: LeaderboardItemData[]
}

export default function LeaderboardList({ leaderboardData }: LeaderboardListProps) {
  const [showAll, setShowAll] = useState(false)
  
  // Determine how many items to show
  const displayData = showAll ? leaderboardData : leaderboardData.slice(0, 10)

  return (
    <div>
      {/* Leaderboard List */}
      <div className="space-y-3">
        {displayData.map((item) => (
          <LeaderboardItem key={item.student.id} item={item} />
        ))}
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
