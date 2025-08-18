import { redirect } from 'next/navigation'
import { auth } from '@/auth'
import { AdminService } from '@/services/admin-service'
import { Suspense } from 'react'
import StudentsPage from '@/presentation/features/admin/students/StudentsPage'
import { createStudent, updateStudent, deleteStudent, setStudentPassword } from './actions'
import { formatStudentsForClient } from '@/utils/admin-data-types'

// Force dynamic rendering to ensure searchParams changes trigger re-rendering
export const dynamic = 'force-dynamic'
export const revalidate = 0

interface StudentsPageProps {
  searchParams: Promise<{ 
    qc?: string, 
    qs?: string, 
    qcat?: string, 
    qd?: string, 
    qt?: string,
    qacategory?: string,
    qararity?: string,
    qachievement?: string
  }>
}

export default async function StudentsAdminPage({ searchParams }: StudentsPageProps) {
  const session = await auth()
  
  if (!session) {
    redirect('/admin/auth/signin')
  }

  const adminService = new AdminService()
  const params = await searchParams
  const classId = params.qc ? parseInt(params.qc) : null
  
  // Get students based on class filter
  const students = classId 
    ? await adminService.getStudentsByClass(classId)
    : await adminService.getAllStudents()
  
  const classes = await adminService.getAllClasses()
  const categories = await adminService.getAllCategories(true) // Only active categories
  const achievements = await adminService.getAllAchievements()

  // Check if investment filters are active
  const investmentFilters = {
    categoryId: params.qcat ? parseInt(params.qcat) : null,
    date: params.qd || null,
    searchText: params.qt || null
  }
  
  const hasInvestmentFilters = investmentFilters.categoryId || investmentFilters.date || investmentFilters.searchText

  // Check if achievement filters are active
  const achievementFilters = {
    category: params.qacategory || null,
    rarity: params.qararity || null,
    achievementId: params.qachievement ? parseInt(params.qachievement) : null
  }
  
  const hasAchievementFilters = achievementFilters.category || achievementFilters.rarity || achievementFilters.achievementId

  // Get investment counts for all students (filtered or unfiltered)
  const studentIds = students.map(student => student.id)
  const investmentCounts = hasInvestmentFilters
    ? await adminService.getFilteredInvestmentCountsByStudents(studentIds, investmentFilters)
    : await adminService.getInvestmentCountsByStudents(studentIds)

  // Get achievement counts for all students (filtered or unfiltered)
  const achievementCounts = hasAchievementFilters
    ? await adminService.getFilteredAchievementCountsByStudents(studentIds, achievementFilters)
    : await adminService.getAchievementCountsByStudents(studentIds)

  // Format data for client components with investment and achievement counts
  const studentsForClient = formatStudentsForClient(students, investmentCounts, achievementCounts)

  // Create a filter key to force re-render when filters change
  const filterKey = `${classId || 'all'}-${investmentFilters.categoryId || 'all'}-${investmentFilters.date || 'all'}-${investmentFilters.searchText || 'all'}-${achievementFilters.category || 'all'}-${achievementFilters.rarity || 'all'}-${achievementFilters.achievementId || 'all'}`

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Students Management</h1>
        <p className="mt-2 text-gray-600">
          Manage student records and class assignments.
        </p>
      </div>
      
      <Suspense fallback={<div>Loading students...</div>}>
        <StudentsPage 
          key={filterKey}
          initialStudents={studentsForClient} 
          classes={classes}
          categories={categories}
          achievements={achievements}
          createStudent={createStudent}
          updateStudent={updateStudent}
          deleteStudent={deleteStudent}
          setStudentPassword={setStudentPassword}
        />
      </Suspense>
    </div>
  )
}
