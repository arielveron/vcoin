/**
 * Groups Page Component
 * Main client component for groups management - orchestrates all modular components
 */
'use client'

import { useState } from 'react'
import { Plus, AlertTriangle } from 'lucide-react'
import { useAdminFilters } from '../hooks/useAdminFilters'
import type { 
  GroupWithDetailsForClient, 
  ClassForClient
} from '@/utils/admin-data-types'
import { formatGroupsWithDetailsForClient } from '@/utils/admin-data-types'
import type { ActionResult } from '@/utils/admin-server-action-types'
import type { GroupWithDetails } from '@/types/database'

// Import modular components
import GroupsTable from './components/GroupsTable'
import GroupForm from './components/GroupForm'
import GroupFilters from './components/GroupFilters'

interface PaginationInfo {
  totalItems: number
  totalPages: number
  currentPage: number
  offset: number
  limit: number
}

interface GroupsPageProps {
  initialGroups: GroupWithDetailsForClient[]
  classes: ClassForClient[]
  pagination: PaginationInfo
  createGroup: (formData: FormData) => Promise<ActionResult<GroupWithDetails>>
  updateGroup: (formData: FormData) => Promise<ActionResult<GroupWithDetails>>
}

export default function GroupsPage({
  initialGroups,
  classes,
  pagination,
  createGroup,
  updateGroup
}: GroupsPageProps) {
  // State management
  const [groups, setGroups] = useState(initialGroups)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingGroup, setEditingGroup] = useState<GroupWithDetailsForClient | null>(null)

  // VCoin standard filter management
  const { filters, updateFilters } = useAdminFilters()

  const handleFormSuccess = (group: GroupWithDetails) => {
    const formattedGroup = formatGroupsWithDetailsForClient([group])[0]
    
    if (editingGroup) {
      // Update existing group
      setGroups(groups.map(g => 
        g.id === editingGroup.id ? formattedGroup : g
      ))
      setEditingGroup(null)
    } else {
      // Add new group
      setGroups([...groups, formattedGroup])
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

  const preSelectedClassId = filters.classId || undefined

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Groups Management</h1>
          <p className="text-gray-600 mt-1">
            Manage student groups and organize classes
          </p>
        </div>
        <button
          onClick={handleCreateGroup}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2"
        >
          <Plus className="h-4 w-4" />
          <span>New Group</span>
        </button>
      </div>

      {/* Filters */}
      <GroupFilters
        classes={classes}
        filters={filters}
        onFiltersChange={updateFilters}
      />

      {/* Main Content */}
      <GroupsTable
        groups={groups}
        onEdit={handleEditGroup}
        onDelete={() => {}} // Simplified for now
        onToggleStatus={() => {}} // Simplified for now  
        onManageStudents={() => {}} // Simplified for now
        loading={false}
      />

      {/* Pagination Info */}
      {pagination.totalItems > 0 && (
        <div className="flex justify-between items-center text-sm text-gray-700 bg-white px-6 py-3 rounded-lg shadow">
          <span>
            Showing {pagination.offset + 1} to {Math.min(pagination.offset + pagination.limit, pagination.totalItems)} of {pagination.totalItems} groups
          </span>
          <span>
            Page {pagination.currentPage} of {pagination.totalPages}
          </span>
        </div>
      )}

      {/* No Results Message */}
      {groups.length === 0 && (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <AlertTriangle className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No groups found</h3>
          <p className="mt-1 text-sm text-gray-500">
            {Object.values(filters).some(Boolean) 
              ? 'Try adjusting your filters or create a new group.'
              : 'Get started by creating your first group.'
            }
          </p>
        </div>
      )}

      {/* Create Form Modal */}
      {isFormOpen && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <GroupForm
              classes={classes}
              editingGroup={editingGroup}
              createGroup={createGroup}
              updateGroup={updateGroup}
              onSuccess={handleFormSuccess}
              onCancel={handleFormCancel}
              preSelectedClassId={preSelectedClassId}
            />
          </div>
        </div>
      )}
    </div>
  )
}
