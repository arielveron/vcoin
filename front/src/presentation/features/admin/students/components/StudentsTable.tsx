/**
 * Students Table Component
 * Displays students in a responsive table format
 * Extracted from students-admin-client.tsx
 */
import { User, Mail, Edit, Key, Trash2 } from 'lucide-react'
import ResponsiveTable from '@/components/admin/responsive-table'
import type { Class } from '@/types/database'
import { StudentForClient } from '@/utils/admin-data-types'
import { t } from '@/config/translations'

interface StudentsTableProps {
  students: StudentForClient[]
  classes: Class[]
  onEdit: (student: StudentForClient) => void
  onDelete: (id: number) => void
  onSetPassword: (student: StudentForClient) => void
}

export default function StudentsTable({
  students,
  classes,
  onEdit,
  onDelete,
  onSetPassword
}: StudentsTableProps) {

  // Define columns for ResponsiveTable
  const columns = [
    {
      key: 'student',
      header: 'Estudiante',
      render: (student: StudentForClient) => (
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center flex-shrink-0">
            <User className="h-4 w-4 text-indigo-600" />
          </div>
          <div>
            <div className="text-sm font-medium text-gray-900">{student.name}</div>
            <div className="text-sm text-gray-500">Registro: {student.registro}</div>
          </div>
        </div>
      )
    },
    {
      key: 'email',
      header: 'Email',
      hideOnMobile: true,
      render: (student: StudentForClient) => (
        <div className="flex items-center space-x-2">
          <Mail className="h-4 w-4 text-gray-400" />
          <span>{student.email || 'Sin email'}</span>
        </div>
      )
    },
    {
      key: 'class',
      header: 'Clase',
      render: (student: StudentForClient) => {
        const studentClass = classes.find(c => c.id === student.class_id)
        return studentClass?.name || 'Sin clase asignada'
      }
    },
    {
      key: 'password_status',
      header: 'Password Status',
      hideOnMobile: true,
      render: (student: StudentForClient) => (
        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
          student.password_hash 
            ? 'bg-green-100 text-green-800' 
            : 'bg-red-100 text-red-800'
        }`}>
          {student.password_hash ? 'Set' : 'Not Set'}
        </span>
      )
    },
    {
      key: 'actions',
      header: 'Actions',
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

  // Custom mobile card
  const mobileCard = (student: StudentForClient) => {
    const studentClass = classes.find(c => c.id === student.class_id)
    
    return (
      <div>
        <div className="flex justify-between items-start mb-3">
          <div className="flex items-center space-x-3">
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
        
        {student.email && (
          <div className="flex items-center space-x-2 mb-2">
            <Mail className="h-4 w-4 text-gray-400" />
            <span className="text-sm text-gray-600">{student.email}</span>
          </div>
        )}
        
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600">
            Clase: {studentClass?.name || 'Sin clase asignada'}
          </span>
          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
            student.password_hash 
              ? 'bg-green-100 text-green-800' 
              : 'bg-red-100 text-red-800'
          }`}>
            {student.password_hash ? 'Set' : 'Not Set'}
          </span>
        </div>
      </div>
    )
  }

  return (
    <ResponsiveTable
      data={students}
      columns={columns}
      mobileCard={mobileCard}
      emptyMessage={t('students.noStudents')}
    />
  )
}
