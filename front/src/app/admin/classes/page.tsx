import { auth } from '@/auth'
import { AdminService } from '@/services/admin-service'
import { redirect } from 'next/navigation'
import { ClassesPage } from '@/presentation/features/admin/classes'
import { createClass, updateClass, deleteClass } from './actions'
import { formatClassesForClient } from '@/utils/admin-data-types'

export default async function ClassesAdmin() {
  // Check authentication on server side
  const session = await auth()
  if (!session) {
    redirect('/admin/auth/signin')
  }

  // Fetch data on server side
  const adminService = new AdminService()
  
  try {
    const classes = await adminService.getAllClasses()
    
    // Format dates for client components (prevents hydration mismatches)
    const classesForClient = formatClassesForClient(classes)
    
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Classes Management</h1>
          <p className="text-gray-600">Manage classes, set end dates, and configure timezones</p>
        </div>
        
        <ClassesPage 
          initialClasses={classesForClient}
          createClass={createClass}
          updateClass={updateClass}
          deleteClass={deleteClass}
        />
      </div>
    )
  } catch (error) {
    console.error('Error fetching classes:', error)
    
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Classes Management</h1>
          <p className="text-red-600">Error loading classes. Please try again.</p>
        </div>
        
        <ClassesPage 
          initialClasses={[]}
          createClass={createClass}
          updateClass={updateClass}
          deleteClass={deleteClass}
        />
      </div>
    )
  }
}
