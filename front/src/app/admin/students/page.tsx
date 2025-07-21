import { redirect } from 'next/navigation'
import { auth } from '@/auth'
import { AdminService } from '@/services/admin-service'
import StudentsAdminClient from './students-admin-client'
import { withFormattedDates, DateFieldSets } from '@/utils/format-dates'

interface StudentsPageProps {
  searchParams: Promise<{ qc?: string, qs?: string }>
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

  // Add formatted dates while keeping original data for calculations
  const studentsForClient = withFormattedDates(students, [...DateFieldSets.AUDIT_FIELDS])
  const classesForClient = withFormattedDates(classes, [...DateFieldSets.CLASS_FIELDS])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Students Management</h1>
        <p className="mt-2 text-gray-600">
          Manage student records and class assignments.
        </p>
      </div>
      
      <StudentsAdminClient 
        students={studentsForClient as any} 
        classes={classesForClient as any} 
      />
    </div>
  )
}
