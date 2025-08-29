/**
 * Form Handler Functions
 * Handles form submission, success, and cancellation for group forms
 */
import type { GroupWithDetails } from '@/types/database'
import type { ActionResult } from '@/utils/server-actions'
import type { GroupWithDetailsForClient } from '@/utils/admin-data-types'
import { formatGroupsWithDetailsForClient } from '@/utils/admin-data-types'
import { createGroup, updateGroup } from '@/actions/group-actions'

export type FormHandlers = {
  handleFormSubmit: (formData: FormData) => Promise<ActionResult<GroupWithDetails>>
  handleFormSuccess: (group: GroupWithDetails) => void
  handleFormCancel: () => void
  handleCreateGroup: () => void
  handleEditGroup: (group: GroupWithDetailsForClient) => void
}

export function createFormHandlers(
  editingGroup: GroupWithDetailsForClient | null,
  groups: GroupWithDetailsForClient[],
  setGroups: (groups: GroupWithDetailsForClient[]) => void,
  setEditingGroup: (group: GroupWithDetailsForClient | null) => void,
  setIsFormOpen: (open: boolean) => void
): FormHandlers {
  
  const handleFormSubmit = async (formData: FormData): Promise<ActionResult<GroupWithDetails>> => {
    if (editingGroup) {
      // Include the group ID in the FormData for update
      formData.set('id', editingGroup.id.toString())
      return await updateGroup(formData) as ActionResult<GroupWithDetails>
    } else {
      return await createGroup(formData) as ActionResult<GroupWithDetails>
    }
  }

  const handleFormSuccess = (group: GroupWithDetails) => {
    if (editingGroup) {
      // Update existing group
      const updatedGroup = formatGroupsWithDetailsForClient([group])[0]
      setGroups(groups.map(g => 
        g.id === editingGroup.id ? updatedGroup : g
      ))
      setEditingGroup(null)
    } else {
      // Add new group
      const newGroupForClient = formatGroupsWithDetailsForClient([group])[0]
      setGroups([newGroupForClient, ...groups])
    }
    setIsFormOpen(false)
  }

  const handleFormCancel = () => {
    setIsFormOpen(false)
    setEditingGroup(null)
  }

  const handleCreateGroup = () => {
    setEditingGroup(null)
    setIsFormOpen(true)
  }

  const handleEditGroup = (group: GroupWithDetailsForClient) => {
    setEditingGroup(group)
    setIsFormOpen(true)
  }

  return {
    handleFormSubmit,
    handleFormSuccess,
    handleFormCancel,
    handleCreateGroup,
    handleEditGroup
  }
}
