import { AdminService } from '@/services/admin-service'
import { Suspense } from 'react'
import AdminDashboardClient from '@/app/admin/components/admin-dashboard-client'
import { checkAdminAuth } from '@/utils/admin-auth'
import { StudentLeaderboardData } from '@/presentation/features/admin/dashboard'

// Force dynamic rendering to avoid build-time evaluation
export const dynamic = 'force-dynamic'
export const revalidate = 0

interface AdminDashboardProps {
  searchParams: Promise<{ qc?: string; qs?: string }>
}

export default async function AdminDashboard({ searchParams }: AdminDashboardProps) {
  // Check authentication and configuration
  const authResult = await checkAdminAuth()
  
  if ('error' in authResult) {
    return authResult.error
  }

  const { session } = authResult

  // Parse filters from query parameters
  const params = await searchParams
  const classId = params.qc ? parseInt(params.qc) : undefined
  const studentId = params.qs ? parseInt(params.qs) : undefined

  // Fetch data on server side
  const adminService = new AdminService()
  
  try {
    const [stats, classes, students, achievements, achievementStudentCounts, leaderboardData] = await Promise.all([
      adminService.getAdminStats(classId, studentId),
      adminService.getAllClasses(),
      adminService.getAllStudents(),
      adminService.getAllAchievements(),
      adminService.getStudentCountsByAchievements(classId),
      adminService.getStudentLeaderboard(classId, 20) // Get top 20 students for leaderboard
    ])
    
    return (
      <Suspense fallback={<div>Loading admin dashboard...</div>}>
        <AdminDashboardClient 
          stats={stats}
          user={session.user ? { name: session.user.name || undefined } : null}
          classes={classes}
          students={students}
          achievements={achievements}
          achievementStudentCounts={achievementStudentCounts}
          leaderboardData={leaderboardData}
        />
      </Suspense>
    )
  } catch (error) {
    console.error('Error fetching admin stats:', error)
    
    // Return with empty stats if there's an error
    const emptyStats = {
      totalClasses: 0,
      totalStudents: 0,
      totalInvestments: 0,
      totalInvestmentAmount: 0,
      totalInvestmentAmountFormatted: '$0,00'
    }
    
    const [classes, students, achievements] = await Promise.all([
      adminService.getAllClasses().catch(() => []),
      adminService.getAllStudents().catch(() => []),
      adminService.getAllAchievements().catch(() => [])
    ])

    // Create empty achievement student counts map for error case
    const achievementStudentCounts = new Map<number, number>()
    const leaderboardData: StudentLeaderboardData[] = [] // Empty leaderboard for error case
    
    return (
      <Suspense fallback={<div>Loading admin dashboard...</div>}>
        <AdminDashboardClient 
          stats={emptyStats}
          user={session.user ? { name: session.user.name || undefined } : null}
          classes={classes}
          students={students}
          achievements={achievements}
          achievementStudentCounts={achievementStudentCounts}
          leaderboardData={leaderboardData}
        />
      </Suspense>
    )
  }
}