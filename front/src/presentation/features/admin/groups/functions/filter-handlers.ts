/**
 * Filter Handler Functions
 * Handles filter changes and URL parameter updates
 */
import { useRouter } from 'next/navigation'

export type FilterHandlers = {
  handleFiltersChange: (newFilters: {
    classId?: number | undefined
    searchText?: string | undefined
    statusFilter?: string | undefined
  }) => void
}

export function createFilterHandlers(
  router: ReturnType<typeof useRouter>
): FilterHandlers {

  const handleFiltersChange = (newFilters: {
    classId?: number | undefined
    searchText?: string | undefined
    statusFilter?: string | undefined
  }) => {
    const params = new URLSearchParams()
    
    if (newFilters.classId) params.set('classId', newFilters.classId.toString())
    if (newFilters.searchText) params.set('searchText', newFilters.searchText)
    if (newFilters.statusFilter) params.set('statusFilter', newFilters.statusFilter)
    
    router.push(`/admin/groups?${params.toString()}`)
  }

  return {
    handleFiltersChange
  }
}
