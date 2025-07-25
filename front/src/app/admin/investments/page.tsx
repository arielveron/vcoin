import { redirect } from 'next/navigation'
import { auth } from '@/auth'
import { AdminService } from '@/services/admin-service'
import { Suspense } from 'react'
import InvestmentsAdminClient from './investments-admin-client'
import { withFormattedDates, DateFieldSets, WithFormattedDates } from '@/utils/format-dates'
import { InvestmentWithStudent, Student, Class } from '@/types/database'
import { formatCurrency } from '@/utils/format'

// Define types for client components
type InvestmentForClient = WithFormattedDates<InvestmentWithStudent, 'fecha' | 'created_at' | 'updated_at'> & {
  monto_formatted: string
}
type StudentForClient = WithFormattedDates<Student, 'created_at' | 'updated_at'>
type ClassForClient = WithFormattedDates<Class, 'end_date' | 'created_at' | 'updated_at'>

export default async function InvestmentsAdminPage() {
  const session = await auth()
  
  if (!session) {
    redirect('/admin/auth/signin')
  }

  const adminService = new AdminService()
  const investments = await adminService.getAllInvestments()
  const students = await adminService.getAllStudents()
  const classes = await adminService.getAllClasses()
  const categories = await adminService.getAllCategories(true) // Only active categories

  // Use hybrid approach: format dates + currency on server, keep original data
  const investmentsForClient = withFormattedDates(investments as unknown as Record<string, unknown>[], [...DateFieldSets.INVESTMENT_FIELDS])
    .map(investment => ({
      ...investment,
      monto_formatted: formatCurrency((investment as unknown as { monto: number }).monto)
    })) as InvestmentForClient[]

  const studentsForClient = withFormattedDates(students as unknown as Record<string, unknown>[], [...DateFieldSets.AUDIT_FIELDS]) as unknown as StudentForClient[]
  const classesForClient = withFormattedDates(classes as unknown as Record<string, unknown>[], [...DateFieldSets.CLASS_FIELDS]) as unknown as ClassForClient[]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Investments Management</h1>
        <p className="mt-2 text-gray-600">
          Track and manage student investment records.
        </p>
      </div>
      
      <Suspense fallback={<div>Loading investments...</div>}>
        <InvestmentsAdminClient 
          investments={investmentsForClient} 
          students={studentsForClient} 
          classes={classesForClient}
          categories={categories}
        />
      </Suspense>
    </div>
  )
}
