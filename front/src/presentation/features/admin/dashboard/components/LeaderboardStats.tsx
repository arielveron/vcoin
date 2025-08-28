/**
 * Leaderboard Stats Component
 * Displays summary statistics for the leaderboard
 */
'use client'

interface LeaderboardStatsProps {
  totalStudents: number
  topBalance: string
  averageBalance: string
}

export default function LeaderboardStats({ totalStudents, topBalance, averageBalance }: LeaderboardStatsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
      <div className="bg-blue-50 p-4 rounded-lg text-center">
        <div className="text-2xl font-bold text-blue-600">{totalStudents}</div>
        <div className="text-sm text-gray-600">Total Students</div>
      </div>
      <div className="bg-green-50 p-4 rounded-lg text-center">
        <div className="text-2xl font-bold text-green-600">{topBalance}</div>
        <div className="text-sm text-gray-600">Top Balance</div>
      </div>
      <div className="bg-purple-50 p-4 rounded-lg text-center">
        <div className="text-2xl font-bold text-purple-600">{averageBalance}</div>
        <div className="text-sm text-gray-600">Average Balance</div>
      </div>
    </div>
  )
}
