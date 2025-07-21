import { auth } from '@/auth'
import { AdminService } from '@/services/admin-service'
import { redirect } from 'next/navigation'
import ClassesAdminClient from '@/app/admin/classes/classes-admin-client'

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
    
    return (
      <ClassesAdminClient 
        initialClasses={classes}
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
