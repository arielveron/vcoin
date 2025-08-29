/**
 * Group Action Functions
 * Handles delete and toggle status operations for groups
 */
import type { GroupWithDetailsForClient } from '@/utils/admin-data-types'
import { formatGroupsWithDetailsForClient } from '@/utils/admin-data-types'
import type { GroupWithDetails } from '@/types/database'

export type GroupActionHandlers = {
  handleDelete: (groupId: number) => Promise<void>
  handleToggleStatus: (groupId: number) => Promise<void>
}

export function createGroupActionHandlers(
  groups: GroupWithDetailsForClient[],
  setGroups: (groups: GroupWithDetailsForClient[]) => void,
  executeDelete: (formData: FormData) => Promise<{ success: boolean; error?: string }>,
  executeToggle: (formData: FormData) => Promise<{ success: boolean; data?: unknown; error?: string }>
): GroupActionHandlers {

  const handleDelete = async (groupId: number) => {
    if (!confirm('Are you sure you want to delete this group? This action cannot be undone.')) {
      return
    }

    const formData = new FormData()
    formData.append('id', groupId.toString())

    const result = await executeDelete(formData)
    if (result.success) {
      setGroups(groups.filter(g => g.id !== groupId))
      alert('Group deleted successfully!')
    } else {
      alert(result.error || 'Failed to delete group')
    }
  }

  const handleToggleStatus = async (groupId: number) => {
    const formData = new FormData()
    formData.append('id', groupId.toString())

    const result = await executeToggle(formData)
    if (result.success && result.data) {
      // Format the returned group data properly
      const rawGroup = result.data as GroupWithDetails
      const formattedGroup = formatGroupsWithDetailsForClient([rawGroup])[0]
      
      console.log('Toggle update - groupId:', groupId, 'formattedGroup:', formattedGroup)
      console.log('Current groups before update:', groups.map(g => ({ id: g.id, enabled: g.is_enabled })))
      
      const updatedGroups = groups.map(g => g.id === groupId ? formattedGroup : g)
      setGroups(updatedGroups)
      
      console.log('Groups after update:', updatedGroups.map(g => ({ id: g.id, enabled: g.is_enabled })))
      alert(`Group ${formattedGroup.is_enabled ? 'enabled' : 'disabled'} successfully!`)
    } else {
      alert(result.error || 'Failed to toggle group status')
    }
  }

  return {
    handleDelete,
    handleToggleStatus
  }
}
