import { redirect } from 'next/navigation'
import { auth } from '@/auth'
import { AdminService } from '@/services/admin-service'
import { Suspense } from 'react'
import StudentsPage from '@/presentation/features/admin/students/StudentsPage'
import { createStudent, updateStudent, deleteStudent, setStudentPassword } from './actions'
import { formatStudentsForClient, formatClassesForClient } from '@/utils/admin-data-types'
// Import batch investment actions
import { createBatchInvestments, getStudentsForBatch } from '../investments/actions'

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
    qstext?: string,  // Student search text (name/registro)
    qitext?: string,  // Investment search text (concept)
    qacategory?: string,
    qararity?: string,
    qachievement?: string,
    page?: string,
    size?: string,
    sort?: string,   // Sorting field
    order?: string   // Sorting direction
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
  // Use 'qstext' (student-specific search) if available, fallback to 'qt' for backward compatibility
  const studentSearchText = params.qstext || params.qt || null
  
  // Parse pagination parameters
  const page = params.page ? parseInt(params.page) : 1
  const size = params.size ? parseInt(params.size) : 10
  
  // Parse sorting parameters
  const sortField = params.sort || 'name'
  const sortDirection = (params.order === 'desc') ? 'desc' : 'asc'
  
  // Get paginated students with filters and sorting
  const studentFilters = { 
    classId: classId || undefined, 
    searchText: studentSearchText || undefined,
    sortField,
    sortDirection
  }
  const studentsResult = await adminService.getStudentsPaginated(page, size, studentFilters)
  
  const { students, total: totalStudents, totalPages } = studentsResult
  
  const classes = await adminService.getAllClasses()
  const categories = await adminService.getAllCategories(true) // Only active categories
  const achievements = await adminService.getAllAchievements()

  // Check if investment filters are active
  const investmentFilters = {
    categoryId: params.qcat ? parseInt(params.qcat) : null,
    date: params.qd || null,
    searchText: params.qitext || null  // Use 'qitext' for investment search text
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
  const classesForClient = formatClassesForClient(classes)

  // Create a filter key to force re-render when filters change (including sort)
  const filterKey = `${classId || 'all'}-${studentSearchText || 'all'}-${page}-${size}-${sortField}-${sortDirection}-${investmentFilters.categoryId || 'all'}-${investmentFilters.date || 'all'}-${investmentFilters.searchText || 'all'}-${achievementFilters.category || 'all'}-${achievementFilters.rarity || 'all'}-${achievementFilters.achievementId || 'all'}`

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
          totalStudents={totalStudents}
          totalPages={totalPages}
          currentPage={page}
          pageSize={size}
          currentSort={{ field: sortField, direction: sortDirection as 'asc' | 'desc' }}
          classes={classesForClient}
          categories={categories}
          achievements={achievements}
          createStudent={createStudent}
          updateStudent={updateStudent}
          deleteStudent={deleteStudent}
          setStudentPassword={setStudentPassword}
          createBatchInvestment={createBatchInvestments}
          getStudentsForBatch={getStudentsForBatch}
        />
      </Suspense>
    </div>
  )
}
