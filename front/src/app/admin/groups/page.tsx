import { redirect } from 'next/navigation'
import { auth } from '@/auth'
import { AdminService } from '@/services/admin-service'
import { Suspense } from 'react'
import { GroupsPage } from '@/presentation/features/admin/groups'
import { 
  formatGroupsWithDetailsForClient, 
  formatClassesForClient,
  formatStudentsForClient 
} from '@/utils/admin-data-types'

// Optimize rendering for less frequent updates
export const dynamic = 'force-dynamic'
export const revalidate = 60 // Revalidate every 60 seconds instead of on every request

interface GroupsPageProps {
  searchParams: Promise<{ 
    qc?: string,        // Class filter
    qg?: string,        // Group filter
    qgtext?: string,    // Group search text
    qstext?: string,    // Student search text
    page?: string,
    size?: string,
    sort?: string,      // Sorting field
    order?: string      // Sorting direction
  }>
}

export default async function GroupsAdminPage({ searchParams }: GroupsPageProps) {
  const session = await auth()
  
  if (!session) {
    redirect('/admin/auth/signin')
  }

  const adminService = new AdminService()
  const params = await searchParams
  
  // Parse filters
  const classId = params.qc ? parseInt(params.qc) : null
  const groupId = params.qg ? parseInt(params.qg) : null
  const groupSearchText = params.qgtext || null
  const studentSearchText = params.qstext || null
  
  // Parse pagination parameters
  const page = params.page ? parseInt(params.page) : 1
  const size = params.size ? parseInt(params.size) : 10
  
  // Parse sorting parameters
  const sortField = (params.sort as string) || 'group_number'
  const sortDirection = (params.order as 'asc' | 'desc') || 'asc'

  try {
    // Fetch groups with pagination and filtering
    const { groups, totalGroups, totalPages } = await adminService.getGroupsPaginated({
      page,
      size,
      classId,
      searchText: groupSearchText,
      sortField,
      sortDirection
    })

    // Fetch all classes for filtering and forms
    const classes = await adminService.getAllClasses()
    
    // Fetch students for group management (filtered by class if needed)
    const allStudents = classId 
      ? await adminService.getStudentsByClass(classId)
      : await adminService.getAllStudents()

    // Format data for client components
    const groupsForClient = formatGroupsWithDetailsForClient(groups)
    const classesForClient = formatClassesForClient(classes)
    const studentsForClient = formatStudentsForClient(allStudents)

    // Create a filter key to force re-render when filters change
    const filterKey = `${classId || 'all'}-${groupId || 'all'}-${groupSearchText || 'all'}-${studentSearchText || 'all'}-${page}-${size}-${sortField}-${sortDirection}`

    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Groups Management</h1>
          <p className="mt-2 text-gray-600">
            Manage student groups, assignments, and track group performance.
          </p>
        </div>
        
        <Suspense fallback={<div>Loading groups...</div>}>
          <GroupsPage 
            key={filterKey}
            initialGroups={groupsForClient}
            classes={classesForClient}
            allStudents={studentsForClient}
            pagination={{
              totalItems: totalGroups,
              totalPages: totalPages,
              currentPage: page,
              offset: (page - 1) * size,
              limit: size
            }}
          />
        </Suspense>
      </div>
    )
  } catch (error) {
    console.error('Error loading groups page:', error)
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Groups Management</h1>
          <p className="mt-2 text-red-600">
            Error loading groups data. Please try again later.
          </p>
        </div>
      </div>
    )
  }
}
