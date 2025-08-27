/**
 * Classes Page Component
 * Main orchestrator component for the classes admin
 * Refactored from 294-line classes-admin-client.tsx
 */
'use client'

import { useState } from 'react'
import ClassForm from './components/ClassForm'
import ClassesTable from './components/ClassesTable'
import ClassActions from './components/ClassActions'
import { useAdminSorting, sortData, createFieldAccessor } from '@/presentation/hooks/useAdminSorting'
import type { ClassForClient } from '@/utils/admin-data-types'
import type { ClassesPageProps } from '@/utils/admin-server-action-types'

export default function ClassesPage({
  initialClasses,
  createClass,
  updateClass,
  deleteClass
}: ClassesPageProps) {
  const [classes] = useState<ClassForClient[]>(initialClasses)
  const [showForm, setShowForm] = useState(false)
  const [editingClass, setEditingClass] = useState<ClassForClient | null>(null)

  // Sorting functionality
  const { currentSort, updateSort } = useAdminSorting({ 
    defaultSort: { field: 'name', direction: 'asc' }
  })

  // Create field accessor for custom sorting
  const fieldAccessor = createFieldAccessor<ClassForClient>({
    // Custom accessors for complex fields can be added here if needed
  })

  // Apply client-side sorting
  const sortedClasses = sortData(classes, currentSort, fieldAccessor)

  const handleEdit = (classItem: ClassForClient) => {
    setEditingClass(classItem)
    setShowForm(true)
  }

  const handleCreateNew = () => {
    setEditingClass(null)
    setShowForm(true)
  }

  const handleCloseForm = () => {
    setShowForm(false)
    setEditingClass(null)
  }

  const classActions = ClassActions({
    onCreateNew: handleCreateNew,
    onDelete: deleteClass
  })

  return (
    <div className="space-y-6">
      {/* Action buttons */}
      <classActions.ActionButtons />

      {/* Classes table */}
      <ClassesTable
        classes={sortedClasses}
        onEdit={handleEdit}
        onDelete={classActions.handleDelete}
        sortBy={currentSort.field || undefined}
        sortDirection={currentSort.direction}
        onSort={updateSort}
      />

      {/* Form modal */}
      <ClassForm
        showForm={showForm}
        editingClass={editingClass}
        onClose={handleCloseForm}
        onCreate={createClass}
        onUpdate={updateClass}
      />
    </div>
  )
}
