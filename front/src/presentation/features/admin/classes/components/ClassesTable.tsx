/**
 * Classes Table Component
 * Handles data display with responsive table design
 * Extracted from 294-line classes-admin-client.tsx
 */
'use client'

import { Calendar, Edit, Trash2 } from 'lucide-react'
import ResponsiveTable from '@/components/admin/responsive-table'
import type { ClassForClient } from '@/utils/admin-data-types'
import type { SortDirection } from '@/presentation/hooks/useAdminSorting'

interface ClassesTableProps {
  classes: ClassForClient[]
  onEdit: (classItem: ClassForClient) => void
  onDelete: (classId: number) => void
  sortBy?: string
  sortDirection?: SortDirection
  onSort?: (field: string, direction?: SortDirection) => void
}

export default function ClassesTable({
  classes,
  onEdit,
  onDelete,
  sortBy,
  sortDirection,
  onSort
}: ClassesTableProps) {
  // Define columns for ResponsiveTable
  const columns = [
    {
      key: 'id',
      header: 'ID',
      sortable: true,
      render: (item: ClassForClient) => (
        <div className="text-sm text-gray-600 font-mono">{item.id}</div>
      )
    },
    {
      key: 'name',
      header: 'Name',
      sortable: true,
      render: (item: ClassForClient) => (
        <div className="font-medium text-gray-900">{item.name}</div>
      )
    },
    {
      key: 'description',
      header: 'Description',
      hideOnMobile: true,
      sortable: true,
      render: (item: ClassForClient) => item.description || '-'
    },
    {
      key: 'end_date_formatted',
      header: 'End Date',
      sortable: true,
      render: (item: ClassForClient) => (
        <div className="flex items-center space-x-2">
          <Calendar className="h-4 w-4 text-gray-400" />
          <span>{item.end_date_formatted}</span>
        </div>
      )
    },
    {
      key: 'timezone',
      header: 'Timezone',
      hideOnMobile: true,
      sortable: true
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (item: ClassForClient) => (
        <div className="flex space-x-2">
          <button
            onClick={() => onEdit(item)}
            className="text-indigo-600 hover:text-indigo-900 p-1"
            aria-label="Edit class"
          >
            <Edit className="h-4 w-4" />
          </button>
          <button
            onClick={() => onDelete(item.id)}
            className="text-red-600 hover:text-red-900 p-1"
            aria-label="Delete class"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      )
    }
  ]

  // Mobile card layout
  const mobileCard = (item: ClassForClient) => (
    <div className="bg-white p-4 border border-gray-200 rounded-lg shadow-sm">
      <div className="flex justify-between items-start mb-2">
        <div>
          <div className="text-xs text-gray-500 font-mono mb-1">ID: {item.id}</div>
          <h3 className="font-medium text-gray-900">{item.name}</h3>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={() => onEdit(item)}
            className="text-indigo-600 hover:text-indigo-900 p-1"
            aria-label="Edit class"
          >
            <Edit className="h-4 w-4" />
          </button>
          <button
            onClick={() => onDelete(item.id)}
            className="text-red-600 hover:text-red-900 p-1"
            aria-label="Delete class"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>
      
      {item.description && (
        <p className="text-sm text-gray-600 mb-2">{item.description}</p>
      )}
      
      <div className="flex items-center space-x-2 text-sm text-gray-500">
        <Calendar className="h-4 w-4" />
        <span>{item.end_date_formatted}</span>
      </div>
      
      <div className="mt-2 text-xs text-gray-400">
        {item.timezone}
      </div>
    </div>
  )

  // Create sort config for ResponsiveTable
  const sortConfig = sortBy && sortDirection ? { field: sortBy, direction: sortDirection } : undefined
  
  // Wrapper for onSort to match ResponsiveTable's signature
  const handleSort = onSort ? (field: string) => onSort(field) : undefined

  return (
    <ResponsiveTable
      data={classes}
      columns={columns}
      mobileCard={mobileCard}
      emptyMessage="No classes found. Create your first class to get started."
      sortConfig={sortConfig}
      onSort={handleSort}
      enableSorting={!!onSort}
    />
  )
}
