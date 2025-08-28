/**
 * Student Selection Table Component
 * Enhanced table with multi-select capabilities for batch operations
 * Includes mobile card layout and responsive design
 */
'use client'

import { User, Edit, Key, Trash2, CheckSquare, Square } from 'lucide-react'
import ResponsiveTable from '@/components/admin/responsive-table'
import { useAdminSorting } from '@/presentation/hooks/useAdminSorting'
import type { ClassForClient } from '@/utils/admin-data-types'
import { StudentForClient } from '@/utils/admin-data-types'

interface StudentSelectionTableProps {
  students: StudentForClient[]
  classes: ClassForClient[]
  selectedStudentIds: number[]
  currentSort?: { field: string; direction: 'asc' | 'desc' }
  onStudentToggle: (studentId: number) => void
  onEdit: (student: StudentForClient) => void
  onDelete: (id: number) => void
  onSetPassword: (student: StudentForClient) => void
}

export default function StudentSelectionTable({
  students,
  classes,
  selectedStudentIds,
  currentSort: serverCurrentSort,
  onStudentToggle,
  onEdit,
  onDelete,
  onSetPassword
}: StudentSelectionTableProps) {

  // Initialize sorting with server-provided sort state or default
  const { currentSort, updateSort } = useAdminSorting({
    defaultSort: serverCurrentSort || { field: 'name', direction: 'asc' },
    preserveFilters: true
  })

  // For server-side pagination with sorting, we don't apply client-side sorting
  // The data is already sorted by the server, so we use it as-is
  const sortedStudents = students

  // Helper to toggle all students
  const handleToggleAll = () => {
    const allSelected = sortedStudents.every(s => selectedStudentIds.includes(s.id))
    sortedStudents.forEach(student => {
      if (allSelected && selectedStudentIds.includes(student.id)) {
        onStudentToggle(student.id)
      } else if (!allSelected && !selectedStudentIds.includes(student.id)) {
        onStudentToggle(student.id)
      }
    })
  }

  // Define columns for ResponsiveTable with selection
  const columns = [
    {
      key: 'selection',
      header: '', // Remove header text to allow column to shrink
      sortable: false,
      render: (student: StudentForClient) => (
        <button
          onClick={() => onStudentToggle(student.id)}
          className="p-1 hover:bg-gray-100 rounded transition-colors"
        >
          {selectedStudentIds.includes(student.id) ? (
            <CheckSquare className="h-5 w-5 text-blue-600" />
          ) : (
            <Square className="h-5 w-5 text-gray-400" />
          )}
        </button>
      )
    },
    {
      key: 'student',
      header: 'Estudiante',
      sortable: true,
      sortField: 'name',
      render: (student: StudentForClient) => (
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center flex-shrink-0">
            <User className="h-4 w-4 text-indigo-600" />
          </div>
          <div>
            <div className="text-sm font-medium text-gray-900">
              {student.name}
            </div>
            <div className="text-sm text-gray-500">
              Registro: {student.registro}
            </div>
          </div>
        </div>
      )
    },
    {
      key: 'class',
      header: 'Clase',
      sortable: true,
      sortField: 'class_name',
      render: (student: StudentForClient) => {
        const studentClass = classes.find(c => c.id === student.class_id)
        return (
          <span className="text-sm text-gray-900">
            {studentClass?.name || 'Sin clase asignada'}
          </span>
        )
      }
    },
    {
      key: 'created_at',
      header: 'Alta',
      sortable: true,
      sortField: 'created_at',
      render: (student: StudentForClient) => (
        <span className="text-sm text-gray-500">
          {student.created_at_formatted}
        </span>
      )
    },
    {
      key: 'investment_count',
      header: 'Inv',
      hideOnMobile: true,
      sortable: true,
      sortField: 'investment_count',
      render: (student: StudentForClient) => (
        <div className="text-center">
          <span className="inline-flex px-2 py-1 text-sm font-medium rounded-full bg-blue-100 text-blue-800">
            {student.investment_count}
          </span>
        </div>
      )
    },
    {
      key: 'achievement_count', 
      header: 'Logr',
      hideOnMobile: true,
      sortable: true,
      sortField: 'achievement_count',
      render: (student: StudentForClient) => (
        <div className="text-center">
          <span className="inline-flex px-2 py-1 text-sm font-medium rounded-full bg-yellow-100 text-yellow-800">
            {student.achievement_count}
          </span>
        </div>
      )
    },
    {
      key: 'password_status',
      header: 'Pass',
      hideOnMobile: false,
      sortable: true,
      sortField: 'password_status',
      render: (student: StudentForClient) => (
        <div className="text-center">
          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
            student.password_hash 
              ? 'bg-green-100 text-green-800' 
              : 'bg-red-100 text-red-800'
          }`}>
            {student.password_hash ? 'Set' : 'No Set'}
          </span>
        </div>
      )
    },
    {
      key: 'actions',
      header: 'Actions',
      sortable: false,
      render: (student: StudentForClient) => (
        <div className="flex space-x-2">
          <button
            onClick={() => onEdit(student)}
            className="text-indigo-600 hover:text-indigo-900 p-1"
            aria-label="Edit student"
          >
            <Edit className="h-4 w-4" />
          </button>
          <button
            onClick={() => onSetPassword(student)}
            className="text-green-600 hover:text-green-900 p-1"
            aria-label="Set password"
          >
            <Key className="h-4 w-4" />
          </button>
          <button
            onClick={() => onDelete(student.id)}
            className="text-red-600 hover:text-red-900 p-1"
            aria-label="Delete student"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      )
    }
  ]

  // Custom mobile card with selection functionality
  const mobileCard = (student: StudentForClient) => {
    const studentClass = classes.find(c => c.id === student.class_id)
    
    return (
      <div>
        <div className="flex justify-between items-start mb-3">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => onStudentToggle(student.id)}
              className="p-1 hover:bg-gray-100 rounded transition-colors flex-shrink-0"
            >
              {selectedStudentIds.includes(student.id) ? (
                <CheckSquare className="h-5 w-5 text-blue-600" />
              ) : (
                <Square className="h-5 w-5 text-gray-400" />
              )}
            </button>
            <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
              <User className="h-5 w-5 text-indigo-600" />
            </div>
            <div>
              <h3 className="text-lg font-medium text-gray-900">{student.name}</h3>
              <p className="text-sm text-gray-500">Registro: {student.registro}</p>
            </div>
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => onEdit(student)}
              className="text-indigo-600 p-1"
            >
              <Edit className="h-5 w-5" />
            </button>
            <button
              onClick={() => onSetPassword(student)}
              className="text-green-600 p-1"
            >
              <Key className="h-5 w-5" />
            </button>
            <button
              onClick={() => onDelete(student.id)}
              className="text-red-600 p-1"
            >
              <Trash2 className="h-5 w-5" />
            </button>
          </div>
        </div>
        
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm text-gray-600">
            Clase: {studentClass?.name || 'Sin clase asignada'}
          </span>
          <span className="text-sm text-gray-600">
            Registro: {student.created_at_formatted}
          </span>
        </div>
        
        <div className="flex justify-between items-center mb-2">
          <div className="flex space-x-2">
            <span className="inline-flex px-2 py-1 text-sm font-medium rounded-full bg-blue-100 text-blue-800">
              {student.investment_count} inversiones
            </span>
            <span className="inline-flex px-2 py-1 text-sm font-medium rounded-full bg-yellow-100 text-yellow-800">
              {student.achievement_count} logros
            </span>
          </div>
        </div>
        
        <div className="flex justify-end">
          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
            student.password_hash 
              ? 'bg-green-100 text-green-800' 
              : 'bg-red-100 text-red-800'
          }`}>
            {student.password_hash ? 'Set' : 'No Set'}
          </span>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Selection Summary and Controls */}
      {selectedStudentIds.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <div className="flex items-center justify-between">
            <div className="text-sm text-blue-800">
              <strong>{selectedStudentIds.length}</strong> estudiante(s) seleccionado(s)
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={handleToggleAll}
                className="text-xs text-blue-600 hover:text-blue-800 underline"
              >
                {students.every(s => selectedStudentIds.includes(s.id)) ? 'Deseleccionar todos' : 'Seleccionar todos'}
              </button>
              <span className="text-gray-300">|</span>
              <button
                onClick={() => selectedStudentIds.forEach(onStudentToggle)}
                className="text-xs text-blue-600 hover:text-blue-800 underline"
              >
                Limpiar selección
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Table */}
      <ResponsiveTable
        data={sortedStudents}
        columns={columns}
        mobileCard={mobileCard}
        emptyMessage="No se encontraron estudiantes. Crea tu primer estudiante arriba."
        enableSorting={true}
        sortConfig={currentSort}
        onSort={updateSort}
      />
    </div>
  )
}
