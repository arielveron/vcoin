/**
 * Students Page Component
 * Main orchestrator component for the students admin
 * Refactored from 546-line students-admin-client.tsx
 */
'use client'

import { useState } from 'react'
import { Plus } from 'lucide-react'
import { useAdminFilters } from '@/hooks/useAdminFilters'
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
import { t } from '@/config/translations'

export default function StudentsPage({
  initialStudents,
  classes,
  createStudent,
  updateStudent,
  deleteStudent,
  setStudentPassword
}: StudentsPageProps) {
  const [students, setStudents] = useState<StudentForClient[]>(initialStudents)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [editingStudent, setEditingStudent] = useState<StudentForClient | null>(null)
  const [passwordDialogStudent, setPasswordDialogStudent] = useState<StudentForClient | null>(null)
  const { filters } = useAdminFilters()

  // Filter students based on selected class
  const filteredStudents = filters.classId 
    ? students.filter(student => student.class_id === filters.classId)
    : students

  const handleFormSubmit = async (formData: FormData): Promise<ActionResult<Student>> => {
    return editingStudent ? 
      await updateStudent(editingStudent.id, formData) : 
      await createStudent(formData)
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
    setShowCreateForm(false)
  }

  const handleFormCancel = () => {
    setShowCreateForm(false)
    setEditingStudent(null)
  }

  const handleCreateClick = () => {
    setEditingStudent(null)
    setShowCreateForm(true)
  }

  const handleEditStudent = (student: StudentForClient) => {
    setEditingStudent(student)
    setShowCreateForm(true)
  }

  const handleDeleteStudent = async (id: number) => {
    if (!confirm(t('students.confirmDelete'))) return
    
    const result = await deleteStudent(id)
    if (result.success) {
      setStudents(students.filter(s => s.id !== id))
    } else {
      alert(result.error || 'Error deleting student')
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
      <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-4">
        <div>
          <h2 className="text-xl lg:text-2xl font-semibold text-gray-900">
            {t('students.title')}
          </h2>
          <p className="text-sm lg:text-base text-gray-600 mt-1">
            {t('students.subtitle')}
          </p>
        </div>
        <button
          onClick={handleCreateClick}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 self-start lg:self-center"
        >
          <Plus className="h-4 w-4" />
          {t('students.createStudent')}
        </button>
      </div>

      {/* Filters */}
      <div className="block lg:hidden">
        <MobileFilters 
          classes={classes}
          students={students}
          showStudentFilter={false}
        />
      </div>

      <FilterBadges 
        classes={classes}
        students={students}
      />

      {/* Student Form Modal */}
      {showCreateForm && (
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
