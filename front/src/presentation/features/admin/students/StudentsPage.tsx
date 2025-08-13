/**
 * Students Page Component
 * Main orchestrator component for the students admin
 * Refactored from 546-line students-admin-client.tsx
 */
'use client'

import { useState } from 'react'
import { Plus } from 'lucide-react'
import { useAdminFilters } from '../hooks/useAdminFilters'
import { useServerAction } from '@/presentation/hooks'
import FilterBadges from '@/app/admin/components/filter-badges'
import MobileFilters from '@/components/admin/mobile-filters'
import {
  StudentsTable,
  StudentForm,
  PasswordDialog
} from './components'
import type { Student } from '@/types/database'
import { 
  StudentsPageProps, 
  ActionResult 
} from '@/utils/admin-server-action-types'
import { 
  StudentForClient 
} from '@/utils/admin-data-types'

export default function StudentsPage({
  initialStudents,
  classes,
  createStudent,
  updateStudent,
  deleteStudent,
  setStudentPassword
}: StudentsPageProps) {
  const [students, setStudents] = useState<StudentForClient[]>(initialStudents)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingStudent, setEditingStudent] = useState<StudentForClient | null>(null)
  const [passwordDialogStudent, setPasswordDialogStudent] = useState<StudentForClient | null>(null)
  const { filters } = useAdminFilters()

  // Server actions
  const { execute: executeDelete } = useServerAction(deleteStudent)

  // Filter students based on selected class
  const filteredStudents = filters.classId 
    ? students.filter(student => student.class_id === filters.classId)
    : students

  const handleFormSubmit = async (formData: FormData): Promise<ActionResult<Student>> => {
    if (editingStudent) {
      // Include the student ID in the FormData for update
      formData.set('id', editingStudent.id.toString())
      return await updateStudent(formData)
    } else {
      return await createStudent(formData)
    }
  }

  const handleFormSuccess = (student: Student) => {
    if (editingStudent) {
      // Update existing student
      setStudents(students.map(s => 
        s.id === editingStudent.id 
          ? { ...student, created_at_formatted: s.created_at_formatted, updated_at_formatted: s.updated_at_formatted }
          : s
      ))
      setEditingStudent(null)
    } else {
      // Add new student
      const newStudentForClient = {
        ...student,
        created_at_formatted: new Date(student.created_at).toLocaleDateString('es-AR'),
        updated_at_formatted: new Date(student.updated_at).toLocaleDateString('es-AR')
      }
      setStudents([...students, newStudentForClient])
    }
    setIsFormOpen(false)
  }

  const handleFormCancel = () => {
    setIsFormOpen(false)
    setEditingStudent(null)
  }

  const handleCreateClick = () => {
    setEditingStudent(null)
    setIsFormOpen(true)
  }

  const handleEditStudent = (student: StudentForClient) => {
    setEditingStudent(student)
    setIsFormOpen(true)
  }

  const handleDeleteStudent = async (id: number) => {
    if (!confirm('¿Estás seguro de que quieres eliminar este estudiante?')) return
    
    const formData = new FormData()
    formData.set('id', id.toString())
    
    const result = await executeDelete(formData)
    if (!result?.success) {
      alert(result?.error || 'Failed to delete student')
    } else {
      // Update local state
      setStudents(students.filter(s => s.id !== id))
    }
  }

  const handleSetPasswordClick = (student: StudentForClient) => {
    setPasswordDialogStudent(student)
  }

  const handlePasswordSuccess = (student: Student) => {
    // Update student in state to show password is set
    setStudents(students.map(s => 
      s.id === student.id 
        ? { ...s, password_hash: 'set' }
        : s
    ))
    setPasswordDialogStudent(null)
  }

  const handlePasswordCancel = () => {
    setPasswordDialogStudent(null)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <div>
          <h2 className="text-xl lg:text-2xl font-semibold text-gray-900">
            Gestión de Estudiantes
          </h2>
          <p className="text-sm lg:text-base text-gray-600 mt-1">
            Administrar estudiantes de VCoin
          </p>
        </div>
        <button
          onClick={handleCreateClick}
          className="w-full sm:w-auto inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
        >
          <Plus className="h-4 w-4" />
          Crear Estudiante
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <FilterBadges classes={classes} students={students} />
        <div className="block lg:hidden">
          <MobileFilters 
            classes={classes}
            students={students}
            showStudentFilter={false}
          />
        </div>
      </div>

      {/* Student Form Modal */}
      {isFormOpen && (
        <StudentForm
          editingStudent={editingStudent}
          classes={classes}
          classId={filters.classId ?? undefined}
          onSubmit={handleFormSubmit}
          onSuccess={handleFormSuccess}
          onCancel={handleFormCancel}
        />
      )}

      {/* Password Dialog */}
      {passwordDialogStudent && (
        <PasswordDialog
          student={passwordDialogStudent}
          onSubmit={setStudentPassword}
          onSuccess={handlePasswordSuccess}
          onCancel={handlePasswordCancel}
        />
      )}

      {/* Students Table */}
      <StudentsTable
        students={filteredStudents}
        classes={classes}
        onEdit={handleEditStudent}
        onDelete={handleDeleteStudent}
        onSetPassword={handleSetPasswordClick}
      />
    </div>
  )
}
