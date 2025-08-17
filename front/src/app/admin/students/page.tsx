import { redirect } from 'next/navigation'
import { auth } from '@/auth'
import { AdminService } from '@/services/admin-service'
import { Suspense } from 'react'
import StudentsPage from '@/presentation/features/admin/students/StudentsPage'
import { createStudent, updateStudent, deleteStudent, setStudentPassword } from './actions'
import { formatStudentsForClient } from '@/utils/admin-data-types'

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

  // Get investment counts for all students
  const studentIds = students.map(student => student.id)
  const investmentCounts = await adminService.getInvestmentCountsByStudents(studentIds)

  // Format data for client components with investment counts
  const studentsForClient = formatStudentsForClient(students, investmentCounts)

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
          initialStudents={studentsForClient} 
          classes={classes}
          createStudent={createStudent}
          updateStudent={updateStudent}
          deleteStudent={deleteStudent}
          setStudentPassword={setStudentPassword}
        />
      </Suspense>
    </div>
  )
}
