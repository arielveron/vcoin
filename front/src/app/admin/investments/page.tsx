import { redirect } from 'next/navigation'
import { auth } from '@/auth'
import { AdminService } from '@/services/admin-service'
import { Suspense } from 'react'
import InvestmentsAdminClient from './investments-admin-client'
import { formatInvestmentsForClient, formatStudentsForClient, formatClassesForClient } from '@/utils/admin-data-types'
import { createInvestment, updateInvestment, deleteInvestment, createBatchInvestments, getStudentsForBatch } from './actions'

interface InvestmentsPageProps {
  searchParams: Promise<{ qc?: string, qs?: string }>
}

export default async function InvestmentsAdminPage({ searchParams }: InvestmentsPageProps) {
  const session = await auth()
  
  if (!session) {
    redirect('/admin/auth/signin')
  }

  const adminService = new AdminService()
  const params = await searchParams
  const classId = params.qc ? parseInt(params.qc) : null
  
  // Get data based on filters
  const investments = await adminService.getAllInvestments()
  const students = classId 
    ? await adminService.getStudentsByClass(classId)
    : await adminService.getAllStudents()
  const classes = await adminService.getAllClasses()
  const categories = await adminService.getAllCategories(true) // Only active categories

  // Use centralized formatting utilities
  const investmentsForClient = formatInvestmentsForClient(investments)
  const studentsForClient = formatStudentsForClient(students)
  const classesForClient = formatClassesForClient(classes)

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
          initialInvestments={investmentsForClient} 
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
