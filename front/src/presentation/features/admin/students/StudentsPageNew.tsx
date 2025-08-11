/**
 * Students Page Component (New Version)
 * Main orchestrator component for the students admin
 * Refactored from massive 531-line students-admin-client.tsx
 * Uses unified filter pattern (self-managing)
 */
'use client'

import { useState } from 'react'
import { Plus } from 'lucide-react'
import { useAdminFilters } from '@/hooks/useAdminFilters'
import { useServerAction } from '@/presentation/hooks'
import FilterBadges from '@/app/admin/components/filter-badges'
import MobileFilters from '@/components/admin/mobile-filters'
import {
  StudentsTable,
  StudentForm,
  PasswordDialog
} from './components'
import type { Student } from '@/types/database'
import { StudentsPageProps, ActionResult } from '@/utils/admin-server-action-types'
import { StudentForClient } from '@/utils/admin-data-types'

// Types for formatted data (using centralized types when needed)

export default function StudentsPage({
  initialStudents,
  classes,
  createStudent,
  updateStudent,
  deleteStudent,
  setStudentPassword
}: StudentsPageProps) {
  const { filters } = useAdminFilters()
  const [students, setStudents] = useState(initialStudents)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingStudent, setEditingStudent] = useState<Student | null>(null)
  const [passwordDialogStudent, setPasswordDialogStudent] = useState<Student | null>(null)

  // Server actions
  const { execute: executeDelete } = useServerAction(deleteStudent)

  // Filter students based on current filters
  const filteredStudents = students.filter(student => {
    if (filters.classId && student.class_id !== filters.classId) return false
    return true
  })

  // Transform students for table display (keep raw Student objects)
  const tableStudents = filteredStudents.map(student => {
    const studentClass = classes.find(cls => cls.id === student.class_id)
    return {
      ...student,
      class_name: studentClass?.name || 'Unknown Class'
    }
  })

  // Handlers
  const handleCreateStudent = () => {
    setEditingStudent(null)
    setIsFormOpen(true)
  }

  const handleEditStudent = (student: Student) => {
    setEditingStudent(student)
    setIsFormOpen(true)
  }

  const handleDeleteStudent = async (id: number) => {
    const result = await executeDelete(id)
    if (!result?.success) {
      alert(result?.error || 'Failed to delete student')
    } else {
      // Update local state
      setStudents(prev => prev.filter(student => student.id !== id))
    }
  }

  const handleSetPassword = (student: Student) => {
    setPasswordDialogStudent(student)
  }

  const handleFormSubmit = async (formData: FormData): Promise<ActionResult<Student>> => {
    return editingStudent ? 
      await updateStudent(editingStudent.id, formData) : 
      await createStudent(formData)
  }

  const handleFormSuccess = (student: Student) => {
    if (editingStudent) {
      // Update existing student - preserve formatted fields
      setStudents(prev => prev.map(s => 
        s.id === student.id 
          ? { ...student, created_at_formatted: s.created_at_formatted, updated_at_formatted: s.updated_at_formatted }
          : s
      ))
    } else {
      // Add new student - format dates
      const newStudentForClient: StudentForClient = {
        ...student,
        created_at_formatted: new Date(student.created_at).toLocaleDateString('es-AR'),
        updated_at_formatted: new Date(student.updated_at).toLocaleDateString('es-AR')
      }
      setStudents(prev => [...prev, newStudentForClient])
    }
    setIsFormOpen(false)
    setEditingStudent(null)
  }

  const handleFormCancel = () => {
    setIsFormOpen(false)
    setEditingStudent(null)
  }

  const handlePasswordSuccess = () => {
    setPasswordDialogStudent(null)
    // Password change doesn't need to update student data
  }

  const handlePasswordCancel = () => {
    setPasswordDialogStudent(null)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Students</h1>
          <p className="text-sm text-gray-600 mt-1">
            Manage student accounts and class assignments
          </p>
        </div>
        
        <button
          onClick={handleCreateStudent}
          className="w-full sm:w-auto inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
        >
          <Plus size={20} />
          <span>Add Student</span>
        </button>
      </div>

      {/* Filters - Using unified pattern */}
      <div className="flex flex-col sm:flex-row gap-4">
        <FilterBadges classes={classes} students={students} />
        <MobileFilters classes={classes} showStudentFilter={false} />
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
        students={tableStudents}
        classes={classes}
        onEdit={handleEditStudent}
        onDelete={handleDeleteStudent}
        onSetPassword={handleSetPassword}
      />
    </div>
  )
}
