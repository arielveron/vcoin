'use client'

import { useState } from 'react'
import { Student, Class } from '@/types/database'
import { createStudent, updateStudent, deleteStudent, setStudentPassword } from './actions'
import { useAdminFilters } from '@/presentation/features/admin/hooks/useAdminFilters'
import { useAutoRefresh } from '@/presentation/hooks/useAutoRefresh'
import FilterBadges from '@/app/admin/components/filter-badges'
import ResponsiveTable from '@/components/admin/responsive-table'
import MobileFilters from '@/components/admin/mobile-filters'
import { User, Mail, Edit, Key, Trash2, Plus, X } from 'lucide-react'

interface StudentsAdminClientProps {
  students: Student[]
  classes: Class[]
}

export default function StudentsAdminClient({ students: initialStudents, classes }: StudentsAdminClientProps) {
  const [students] = useState(initialStudents) // setStudents removed since we use auto-refresh
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [editingStudent, setEditingStudent] = useState<Student | null>(null)
  const [passwordDialogStudent, setPasswordDialogStudent] = useState<Student | null>(null)
  const [newPassword, setNewPassword] = useState('')
  const [settingPassword, setSettingPassword] = useState(false)
  const { filters } = useAdminFilters()
  const { refreshAfterFormAction, isPending } = useAutoRefresh({
    showAlerts: true
  })

  const handleCreateStudent = async (formData: FormData) => {
    const result = await refreshAfterFormAction(createStudent, formData, 'Student created successfully')
    if (result.success) {
      setShowCreateForm(false)
    }
  }

  const handleUpdateStudent = async (formData: FormData) => {
    if (!editingStudent) return
    
    // Include the student ID in the FormData
    formData.set('id', editingStudent.id.toString())
    
    const result = await refreshAfterFormAction(updateStudent, formData, 'Student updated successfully')
    if (result.success) {
      setEditingStudent(null)
    }
  }

  const handleDeleteStudent = async (id: number) => {
    if (!confirm('¿Estás seguro de que quieres eliminar este estudiante?')) return
    
    const formData = new FormData()
    formData.set('id', id.toString())
    
    await refreshAfterFormAction(deleteStudent, formData, 'Student deleted successfully')
  }

  const handleSetPassword = async () => {
    if (!passwordDialogStudent || !newPassword) return
    
    setSettingPassword(true)
    try {
      const formData = new FormData()
      formData.append('student_id', passwordDialogStudent.id.toString())
      formData.append('password', newPassword)

      const result = await refreshAfterFormAction(setStudentPassword, formData, 'Password set successfully')
      
      if (result.success) {
        setPasswordDialogStudent(null)
        setNewPassword('')
      }
    } catch {
      alert('Error setting password')
    } finally {
      setSettingPassword(false)
    }
  }

  // Filter students based on selected class
  const filteredStudents = filters.classId 
    ? students.filter(student => student.class_id === filters.classId)
    : students

  // Define columns for ResponsiveTable
  const columns = [
    {
      key: 'student',
      header: 'Estudiante',
      render: (student: Student) => (
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
      render: (student: Student) => (
        <div className="flex items-center space-x-2">
          <Mail className="h-4 w-4 text-gray-400" />
          <span>{student.email || 'Sin email'}</span>
        </div>
      )
    },
    {
      key: 'class',
      header: 'Clase',
      render: (student: Student) => {
        const studentClass = classes.find(c => c.id === student.class_id)
        return studentClass?.name || 'Sin clase asignada'
      }
    },
    {
      key: 'password_status',
      header: 'Password Status',
      render: (student: Student) => (
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
      render: (student: Student) => (
        <div className="flex space-x-1">
          <button
            onClick={() => setEditingStudent(student)}
            className="text-indigo-600 hover:text-indigo-900 p-1"
            aria-label="Edit student"
          >
            <Edit className="h-4 w-4" />
          </button>
          <button
            onClick={() => setPasswordDialogStudent(student)}
            className="text-green-600 hover:text-green-900 p-1"
            aria-label="Set password"
          >
            <Key className="h-4 w-4" />
          </button>
          <button
            onClick={() => handleDeleteStudent(student.id)}
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
  const mobileCard = (student: Student) => {
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
              onClick={() => setEditingStudent(student)}
              className="text-indigo-600 p-1"
            >
              <Edit className="h-5 w-5" />
            </button>
            <button
              onClick={() => setPasswordDialogStudent(student)}
              className="text-green-600 p-1"
            >
              <Key className="h-5 w-5" />
            </button>
            <button
              onClick={() => handleDeleteStudent(student.id)}
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
    <div className="space-y-6">
      {/* Loading indicator */}
      {isPending && (
        <div className="fixed top-4 right-4 bg-blue-500 text-white px-4 py-2 rounded-md shadow-lg z-50">
          Updating...
        </div>
      )}

      {/* Filter Badges */}
      <FilterBadges classes={classes} students={students} />

      {/* Header with Create Button */}
      <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-4">
        <div>
          <h2 className="text-xl lg:text-2xl font-semibold text-gray-900">Gestión de Estudiantes</h2>
          <p className="text-gray-600">Total: {filteredStudents.length} estudiantes en esta clase</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          <MobileFilters
            classes={classes}
          />
          <button
            onClick={() => setShowCreateForm(true)}
            disabled={isPending}
            className="flex items-center justify-center bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 min-h-[44px] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Plus className="h-4 w-4 mr-2" />
            Crear Nuevo Estudiante
          </button>
        </div>
      </div>

      {/* Create Form */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-0 lg:top-10 mx-auto p-0 lg:p-5 border w-full lg:w-2xl h-full lg:h-auto shadow-lg lg:rounded-md bg-white">
            <div className="flex flex-col h-full lg:h-auto">
              <div className="flex items-center justify-between p-4 border-b lg:border-0">
                <h3 className="text-lg font-medium text-gray-900">Crear Nuevo Estudiante</h3>
                <button
                  onClick={() => setShowCreateForm(false)}
                  className="lg:hidden p-2 text-gray-400 hover:text-gray-600"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              
              <form key={`create-${filters.classId || 'all'}`} action={handleCreateStudent} 
                    className="flex-1 overflow-y-auto p-4 lg:p-0 space-y-4">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                      Nombre del Estudiante
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      required
                      placeholder="Ingresa el nombre del estudiante"
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 py-3 lg:py-2"
                    />
                  </div>
                  <div>
                    <label htmlFor="registro" className="block text-sm font-medium text-gray-700">
                      Número de Registro
                    </label>
                    <input
                      type="number"
                      id="registro"
                      name="registro"
                      required
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 py-3 lg:py-2"
                    />
                  </div>
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                      Correo Electrónico
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      required
                      placeholder="Ingresa el correo electrónico"
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 py-3 lg:py-2"
                    />
                  </div>
                  <div>
                    <label htmlFor="class_id" className="block text-sm font-medium text-gray-700">
                      Clase
                    </label>
                    <select
                      id="class_id"
                      name="class_id"
                      required
                      defaultValue={filters.classId ? filters.classId.toString() : ''}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 py-3 lg:py-2"
                    >
                      <option value="">Seleccionar clase</option>
                      {classes.map((cls) => (
                        <option key={cls.id} value={cls.id}>
                          {cls.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="flex flex-col-reverse lg:flex-row gap-2 pt-4 border-t lg:border-0">
                  <button
                    type="button"
                    onClick={() => setShowCreateForm(false)}
                    className="w-full lg:w-auto px-4 py-3 lg:py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="w-full lg:w-auto px-4 py-3 lg:py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700"
                  >
                    Crear
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Edit Form */}
      {editingStudent && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-0 lg:top-10 mx-auto p-0 lg:p-5 border w-full lg:w-2xl h-full lg:h-auto shadow-lg lg:rounded-md bg-white">
            <div className="flex flex-col h-full lg:h-auto">
              <div className="flex items-center justify-between p-4 border-b lg:border-0">
                <h3 className="text-lg font-medium text-gray-900">Editar</h3>
                <button
                  onClick={() => setEditingStudent(null)}
                  className="lg:hidden p-2 text-gray-400 hover:text-gray-600"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              
              <form action={handleUpdateStudent} 
                    className="flex-1 overflow-y-auto p-4 lg:p-0 space-y-4">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="edit-name" className="block text-sm font-medium text-gray-700">
                      Nombre del Estudiante
                    </label>
                    <input
                      type="text"
                      id="edit-name"
                      name="name"
                      defaultValue={editingStudent.name}
                      required
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 py-3 lg:py-2"
                    />
                  </div>
                  <div>
                    <label htmlFor="edit-registro" className="block text-sm font-medium text-gray-700">
                      Número de Registro
                    </label>
                    <input
                      type="number"
                      id="edit-registro"
                      name="registro"
                      defaultValue={editingStudent.registro}
                      required
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 py-3 lg:py-2"
                    />
                  </div>
                  <div>
                    <label htmlFor="edit-email" className="block text-sm font-medium text-gray-700">
                      Correo Electrónico
                    </label>
                    <input
                      type="email"
                      id="edit-email"
                      name="email"
                      defaultValue={editingStudent.email || ''}
                      required
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 py-3 lg:py-2"
                    />
                  </div>
                  <div>
                    <label htmlFor="edit-class_id" className="block text-sm font-medium text-gray-700">
                      Clase
                    </label>
                    <select
                      id="edit-class_id"
                      name="class_id"
                      defaultValue={editingStudent.class_id}
                      required
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 py-3 lg:py-2"
                    >
                      {classes.map((cls) => (
                        <option key={cls.id} value={cls.id}>
                          {cls.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="flex flex-col-reverse lg:flex-row gap-2 pt-4 border-t lg:border-0">
                  <button
                    type="button"
                    onClick={() => setEditingStudent(null)}
                    className="w-full lg:w-auto px-4 py-3 lg:py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="w-full lg:w-auto px-4 py-3 lg:py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700"
                  >
                    Guardar
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Responsive Students Table */}
      <ResponsiveTable
        data={filteredStudents}
        columns={columns}
        mobileCard={mobileCard}
        emptyMessage="No se encontraron estudiantes. Crea tu primer estudiante arriba."
      />

      {/* Password Dialog - Mobile-friendly */}
      {passwordDialogStudent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">
                Set Password for {passwordDialogStudent.name}
              </h3>
              <button
                onClick={() => {
                  setPasswordDialogStudent(null)
                  setNewPassword('')
                }}
                className="p-2 text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label htmlFor="new-password" className="block text-sm font-medium text-gray-700">
                  New Password
                </label>
                <input
                  type="password"
                  id="new-password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 py-3"
                  placeholder="Enter new password"
                  minLength={6}
                />
              </div>
              <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded-md">
                <p className="font-medium mb-2">Student login credentials:</p>
                <p><strong>Class ID:</strong> {passwordDialogStudent.class_id}</p>
                <p><strong>Registry:</strong> {passwordDialogStudent.registro}</p>
                <p><strong>Password:</strong> [The password you set above]</p>
              </div>
            </div>
            
            <div className="flex flex-col-reverse sm:flex-row gap-2 mt-6">
              <button
                onClick={() => {
                  setPasswordDialogStudent(null)
                  setNewPassword('')
                }}
                className="w-full sm:w-auto px-4 py-3 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={handleSetPassword}
                disabled={!newPassword || settingPassword}
                className="w-full sm:w-auto px-4 py-3 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 disabled:opacity-50"
              >
                {settingPassword ? 'Setting...' : 'Set Password'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
