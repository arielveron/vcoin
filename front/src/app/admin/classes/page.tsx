import { auth } from '@/auth'
import { AdminService } from '@/services/admin-service'
import { redirect } from 'next/navigation'
import ClassesAdminClient from '@/app/admin/classes/classes-admin-client'
import { withFormattedDates, DateFieldSets, WithFormattedDates } from '@/utils/format-dates'
import { Class } from '@/types/database'

// Define the type for the server component
type ClassForClient = WithFormattedDates<Class, 'end_date' | 'created_at' | 'updated_at'>

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
    
    // Add formatted dates while keeping original data for calculations
    const classesForClient = withFormattedDates(classes, [...DateFieldSets.CLASS_FIELDS]) as unknown as ClassForClient[]
    
    return (
      <ClassesAdminClient 
        initialClasses={classesForClient}
      />
    )
  } catch (error) {
    console.error('Error fetching classes:', error)
    
    return (
      <ClassesAdminClient 
        initialClasses={[]}
      />
    )
  }
}
