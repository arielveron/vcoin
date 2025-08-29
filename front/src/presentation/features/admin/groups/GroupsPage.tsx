/**
 * Groups Page Component
 * Main client component for groups management - orchestrates all modular components
 */
'use client'

import { useState } from 'react'
import { Plus, AlertTriangle } from 'lucide-react'
import { useServerAction } from '@/presentation/hooks'
import { useAdminFilters } from '../hooks/useAdminFilters'
import type { 
  GroupWithDetailsForClient, 
  ClassForClient, 
  StudentForClient 
} from '@/utils/admin-data-types'

// Import modular components
import GroupsTable from './components/GroupsTable'
import GroupForm from './components/GroupForm'
import GroupFilters from './components/GroupFilters'
import StudentAssignmentModal from './components/StudentAssignmentModal'

// Import handler functions
import {
  createFormHandlers,
  createGroupActionHandlers,
  createStudentAssignmentHandlers
} from './functions'

// Import server actions
import { 
  deleteGroup, 
  toggleGroupStatus,
  addStudentsToGroup,
  removeStudentsFromGroup
} from '@/actions/group-actions'

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
  allStudents: StudentForClient[]
  pagination: PaginationInfo
}

export default function GroupsPage({
  initialGroups,
  classes,
  allStudents,
  pagination
}: GroupsPageProps) {
  // State management
  const [groups, setGroups] = useState(initialGroups)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingGroup, setEditingGroup] = useState<GroupWithDetailsForClient | null>(null)
  const [studentModalGroup, setStudentModalGroup] = useState<GroupWithDetailsForClient | null>(null)
  const [localStudents, setLocalStudents] = useState(allStudents)

  // VCoin standard filter management
  const { filters, updateFilters } = useAdminFilters()

  // Server action hooks
  const { execute: executeDelete, loading: deleteLoading } = useServerAction(deleteGroup)
  const { execute: executeToggle, loading: toggleLoading } = useServerAction(toggleGroupStatus)
  const { execute: executeAssign, loading: assignLoading } = useServerAction(addStudentsToGroup)
  const { execute: executeRemove, loading: removeLoading } = useServerAction(removeStudentsFromGroup)

  const anyLoading = deleteLoading || toggleLoading || assignLoading || removeLoading

  // Create handler functions using extracted modules
  const { handleFormSubmit, handleFormSuccess, handleFormCancel, handleCreateGroup, handleEditGroup } = createFormHandlers(
    editingGroup,
    groups,
    setGroups,
    setEditingGroup,
    setIsFormOpen
  )

  const { handleDelete, handleToggleStatus } = createGroupActionHandlers(
    groups,
    setGroups,
    executeDelete,
    executeToggle
  )

  const { handleAssignStudent, handleRemoveStudent } = createStudentAssignmentHandlers(
    groups,
    setGroups,
    localStudents,
    setLocalStudents,
    studentModalGroup,
    executeAssign,
    executeRemove
  )

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
          disabled={anyLoading}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 disabled:opacity-50"
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
        onDelete={handleDelete}
        onToggleStatus={handleToggleStatus}
        onManageStudents={setStudentModalGroup}
        loading={anyLoading}
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
      {groups.length === 0 && !anyLoading && (
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
              group={editingGroup}
              onSubmit={handleFormSubmit}
              onSuccess={handleFormSuccess}
              onCancel={handleFormCancel}
              preSelectedClassId={preSelectedClassId}
            />
          </div>
        </div>
      )}

      {/* Student Assignment Modal */}
      {studentModalGroup && (
        <StudentAssignmentModal
          group={studentModalGroup}
          allStudents={localStudents}
          onClose={() => setStudentModalGroup(null)}
          onAssignStudent={handleAssignStudent}
          onRemoveStudent={handleRemoveStudent}
          loading={assignLoading || removeLoading}
        />
      )}
    </div>
  )
}
