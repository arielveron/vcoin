/**
 * Legacy Form Handlers
 * Legacy handlers that use executeCreate/executeUpdate pattern
 * These can be removed once the new form pattern is fully implemented
 */
import type { GroupWithDetails } from '@/types/database'
import type { GroupWithDetailsForClient } from '@/utils/admin-data-types'
import { formatGroupsWithDetailsForClient } from '@/utils/admin-data-types'

export type LegacyFormHandlers = {
  handleCreateSubmit: (formData: FormData) => Promise<void>
  handleEditSubmit: (formData: FormData) => Promise<void>
}

export function createLegacyFormHandlers(
  groups: GroupWithDetailsForClient[],
  setGroups: (groups: GroupWithDetailsForClient[]) => void,
  editingGroup: GroupWithDetailsForClient | null,
  setEditingGroup: (group: GroupWithDetailsForClient | null) => void,
  setIsFormOpen: (open: boolean) => void,
  executeCreate: (formData: FormData) => Promise<{ success: boolean; data?: unknown; error?: string }>,
  executeUpdate: (formData: FormData) => Promise<{ success: boolean; data?: unknown; error?: string }>
): LegacyFormHandlers {

  const handleCreateSubmit = async (formData: FormData) => {
    const result = await executeCreate(formData)
    if (result.success && result.data) {
      // Use VCoin's native formatters to convert raw data to client format
      const groupForClient = formatGroupsWithDetailsForClient([result.data as GroupWithDetails])[0]
      setGroups([groupForClient, ...groups])
      setIsFormOpen(false)
      alert('Group created successfully!')
    } else {
      alert(result.error || 'Failed to create group')
    }
  }

  const handleEditSubmit = async (formData: FormData) => {
    if (!editingGroup) return

    const result = await executeUpdate(formData)
    if (result.success && result.data) {
      // Use VCoin's native formatters to convert raw data to client format
      const groupForClient = formatGroupsWithDetailsForClient([result.data as GroupWithDetails])[0]
      setGroups(groups.map(g => g.id === editingGroup.id ? groupForClient : g))
      setEditingGroup(null)
      alert('Group updated successfully!')
    } else {
      alert(result.error || 'Failed to update group')
    }
  }

  return {
    handleCreateSubmit,
    handleEditSubmit
  }
}
