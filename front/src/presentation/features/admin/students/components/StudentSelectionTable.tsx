/**
 * Student Selection Table Component
 * Enhanced table with multi-select capabilities for batch operations
 * Extends the existing StudentsTable component
 */
'use client'

import { User, Edit, Key, Trash2, CheckSquare, Square } from 'lucide-react'
import ResponsiveTable from '@/components/admin/responsive-table'
import type { ClassForClient } from '@/utils/admin-data-types'
import { StudentForClient } from '@/utils/admin-data-types'

interface StudentSelectionTableProps {
  students: StudentForClient[]
  classes: ClassForClient[]
  selectedStudentIds: number[]
  onStudentToggle: (studentId: number) => void
  onEdit: (student: StudentForClient) => void
  onDelete: (id: number) => void
  onSetPassword: (student: StudentForClient) => void
}

export default function StudentSelectionTable({
  students,
  classes,
  selectedStudentIds,
  onStudentToggle,
  onEdit,
  onDelete,
  onSetPassword
}: StudentSelectionTableProps) {

  // Helper to toggle all students
  const handleToggleAll = () => {
    const allSelected = students.every(s => selectedStudentIds.includes(s.id))
    students.forEach(student => {
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
      header: 'Fecha de Registro',
      render: (student: StudentForClient) => (
        <span className="text-sm text-gray-500">
          {student.created_at_formatted}
        </span>
      )
    },
    {
      key: 'investment_count',
      header: 'Inversiones',
      render: (student: StudentForClient) => (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
          {student.investment_count}
        </span>
      )
    },
    {
      key: 'achievement_count', 
      header: 'Logros',
      render: (student: StudentForClient) => (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
          {student.achievement_count}
        </span>
      )
    },
    {
      key: 'actions',
      header: 'Acciones',
      render: (student: StudentForClient) => (
        <div className="flex items-center space-x-2">
          <button
            onClick={() => onEdit(student)}
            className="text-blue-600 hover:text-blue-900 p-1 hover:bg-blue-50 rounded transition-colors"
            title="Editar estudiante"
          >
            <Edit className="h-4 w-4" />
          </button>
          <button
            onClick={() => onSetPassword(student)}
            className="text-green-600 hover:text-green-900 p-1 hover:bg-green-50 rounded transition-colors"
            title="Establecer contraseña"
          >
            <Key className="h-4 w-4" />
          </button>
          <button
            onClick={() => onDelete(student.id)}
            className="text-red-600 hover:text-red-900 p-1 hover:bg-red-50 rounded transition-colors"
            title="Eliminar estudiante"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      )
    }
  ]

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
        data={students}
        columns={columns}
        emptyMessage="No se encontraron estudiantes"
      />
    </div>
  )
}
