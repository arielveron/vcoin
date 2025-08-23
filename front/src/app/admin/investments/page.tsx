import { redirect } from 'next/navigation'
import { auth } from '@/auth'
import { AdminService } from '@/services/admin-service'
import { Suspense } from 'react'
import InvestmentsAdminClient from './investments-admin-client'
import { formatInvestmentsForClient, formatStudentsForClient, formatClassesForClient } from '@/utils/admin-data-types'
import { createInvestment, updateInvestment, deleteInvestment, createBatchInvestments, getStudentsForBatch } from './actions'

interface InvestmentsPageProps {
  searchParams: Promise<{ 
    qc?: string,      // class filter
    qs?: string,      // student filter
    qcat?: string,    // category filter
    qd?: string,      // date filter
    qt?: string,      // search text filter (legacy)
    qstext?: string,  // student search text filter
    qitext?: string,  // investment search text filter
    page?: string,
    size?: string
  }>
}

export default async function InvestmentsAdminPage({ searchParams }: InvestmentsPageProps) {
  const session = await auth()
  
  if (!session) {
    redirect('/admin/auth/signin')
  }

  const adminService = new AdminService()
  const params = await searchParams
  const classId = params.qc ? parseInt(params.qc) : null
  const studentId = params.qs ? parseInt(params.qs) : null
  const categoryId = params.qcat ? parseInt(params.qcat) : null
  const date = params.qd || null
  const searchText = params.qitext || params.qt || null  // Use 'qitext' primarily, fallback to 'qt' for backward compatibility
  
  // Parse pagination parameters
  const page = params.page ? parseInt(params.page) : 1
  const size = params.size ? parseInt(params.size) : 10
  
  // Get paginated investments based on filters
  const filters = {
    ...(classId && { classId }),
    ...(studentId && { studentId }),
    ...(categoryId && { categoryId }),
    ...(date && { date }),
    ...(searchText && { searchText })
  }
  
  const investmentsResult = await adminService.getInvestmentsPaginated(page, size, filters)
  const { investments, total: totalInvestments, totalPages } = investmentsResult
  const students = classId 
    ? await adminService.getStudentsByClass(classId)
    : await adminService.getAllStudents()
  const classes = await adminService.getAllClasses()
  const categories = await adminService.getAllCategories(true) // Only active categories

  // Get investment counts for students
  const studentIds = students.map(student => student.id)
  const investmentCounts = await adminService.getInvestmentCountsByStudents(studentIds)

  // Use centralized formatting utilities
  const investmentsForClient = formatInvestmentsForClient(investments)
  const studentsForClient = formatStudentsForClient(students, investmentCounts)
  const classesForClient = formatClassesForClient(classes)

  // Create a filter key to force re-render when filters change
  const filterKey = `${classId || 'all'}-${studentId || 'all'}-${categoryId || 'all'}-${date || 'all'}-${searchText || 'all'}-${page}-${size}`

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Investments Management</h1>
        <p className="mt-2 text-gray-600">
          Track and manage student investment records.
        </p>
      </div>
      
      <Suspense fallback={<div>Loading investments...</div>}>
        <InvestmentsAdminClient 
          key={filterKey}
          initialInvestments={investmentsForClient}
          totalInvestments={totalInvestments}
          totalPages={totalPages}
          currentPage={page}
          pageSize={size}
          students={studentsForClient} 
          classes={classesForClient}
          categories={categories}
          createInvestment={createInvestment}
          updateInvestment={updateInvestment}
          deleteInvestment={deleteInvestment}
          createBatchInvestments={createBatchInvestments}
          getStudentsForBatch={getStudentsForBatch}
        />
      </Suspense>
    </div>
  )
}
