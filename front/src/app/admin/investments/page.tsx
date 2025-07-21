import { redirect } from 'next/navigation'
import { auth } from '@/auth'
import { AdminService } from '@/services/admin-service'
import InvestmentsAdminClient from './investments-admin-client'

export default async function InvestmentsAdminPage() {
  const session = await auth()
  
  if (!session) {
    redirect('/admin/auth/signin')
  }

  const adminService = new AdminService()
  const investments = await adminService.getAllInvestments()
  const students = await adminService.getAllStudents()
  const classes = await adminService.getAllClasses()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Investments Management</h1>
        <p className="mt-2 text-gray-600">
          Track and manage student investment records.
        </p>
      </div>
      
      <InvestmentsAdminClient investments={investments} students={students} classes={classes} />
    </div>
  )
}
