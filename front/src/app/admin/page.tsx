import { auth } from '@/auth'
import { AdminService } from '@/services/admin-service'
import { redirect } from 'next/navigation'
import AdminDashboardClient from '@/app/admin/components/admin-dashboard-client'

interface AdminDashboardProps {
  searchParams: { qc?: string; qs?: string }
}

export default async function AdminDashboard({ searchParams }: AdminDashboardProps) {
  // Check authentication on server side
  const session = await auth()
  if (!session) {
    redirect('/admin/auth/signin')
  }

  // Parse filters from query parameters
  const classId = searchParams.qc ? parseInt(searchParams.qc) : undefined
  const studentId = searchParams.qs ? parseInt(searchParams.qs) : undefined

  // Fetch data on server side
  const adminService = new AdminService()
  
  try {
    const [stats, classes, students] = await Promise.all([
      adminService.getAdminStats(classId, studentId),
      adminService.getAllClasses(),
      adminService.getAllStudents()
    ])
    
    return (
      <AdminDashboardClient 
        stats={stats}
        user={session.user}
        classes={classes}
        students={students}
      />
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
    
    const [classes, students] = await Promise.all([
      adminService.getAllClasses().catch(() => []),
      adminService.getAllStudents().catch(() => [])
    ])
    
    return (
      <AdminDashboardClient 
        stats={emptyStats}
        user={session.user}
        classes={classes}
        students={students}
      />
    )
  }
}
