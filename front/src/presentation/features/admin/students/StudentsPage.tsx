/**
 * Students Page Component
 * Main orchestrator component for the students admin
 * Refactored from 546-line students-admin-client.tsx
 * Enhanced with pagination support
 */
'use client'

import { useState, useEffect } from 'react'
import { Plus } from 'lucide-react'
import { useAdminFilters } from '../hooks/useAdminFilters'
import { useServerAction, usePagination, useStudentSelectionStore } from '@/presentation/hooks'
import FilterBadges from '@/app/admin/components/filter-badges'
import MobileFilters from '@/components/admin/mobile-filters'
import Pagination from '@/components/admin/pagination'
import PageSizeSelector from '@/components/admin/page-size-selector'
import {
  StudentForm,
  PasswordDialog,
  StudentFilters,
  StudentFiltersPanel,
  StudentSelectionTable
} from './components'
import { BatchInvestmentModal } from '../investments/components'
import type { Student } from '@/types/database'
import { 
  StudentsPageProps, 
  ActionResult 
} from '@/utils/admin-server-action-types'
import { 
  StudentForClient,
  formatStudentForClient 
} from '@/utils/admin-data-types'

export default function StudentsPage({
  initialStudents,
  totalStudents,
  totalPages: serverTotalPages,
  currentPage: serverCurrentPage,
  pageSize: serverPageSize,
  classes,
  categories,
  achievements,
  createStudent,
  updateStudent,
  deleteStudent,
  setStudentPassword,
  createBatchInvestment,
  getStudentsForBatch
}: StudentsPageProps) {
  const [students, setStudents] = useState<StudentForClient[]>(initialStudents)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingStudent, setEditingStudent] = useState<StudentForClient | null>(null)
  const [passwordDialogStudent, setPasswordDialogStudent] = useState<StudentForClient | null>(null)
  
  // Persistent student selection store - survives filter changes and page refreshes
  const studentSelection = useStudentSelectionStore()
  const [isBatchInvestmentModalOpen, setIsBatchInvestmentModalOpen] = useState(false)
  
  const { filters, updateFilters } = useAdminFilters()

  // Update students when initialStudents changes (due to filtering/pagination)
  // but preserve selection state
  useEffect(() => {
    setStudents(initialStudents)
  }, [initialStudents])

  // Server actions
  const { execute: executeDelete } = useServerAction(deleteStudent)

  // Use URL-based pagination hook for navigation
  const { currentPage, itemsPerPage, goToPage, changeItemsPerPage } = usePagination({
    defaultItemsPerPage: serverPageSize || 10
  })

  // Use server-provided pagination data when available, fallback to URL params
  const effectiveCurrentPage = serverCurrentPage || currentPage
  const effectiveItemsPerPage = serverPageSize || itemsPerPage
  const effectiveTotalPages = serverTotalPages || Math.ceil((totalStudents || students.length) / effectiveItemsPerPage)
  const effectiveTotalItems = totalStudents || students.length

  // Calculate pagination display info
  const startIndex = (effectiveCurrentPage - 1) * effectiveItemsPerPage + 1
  const endIndex = Math.min(effectiveCurrentPage * effectiveItemsPerPage, effectiveTotalItems)
  const isEmpty = students.length === 0

  // For server-side pagination, we display all students from the current page
  // Client-side filtering is minimal since server handles the main pagination
  const displayStudents = students

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
      // Update existing student - preserve investment_count from original
      const updatedStudent = formatStudentForClient(student, editingStudent.investment_count)
      setStudents(students.map(s => 
        s.id === editingStudent.id ? updatedStudent : s
      ))
      setEditingStudent(null)
    } else {
      // Add new student - new students start with 0 investments
      const newStudentForClient = formatStudentForClient(student, 0)
      setStudents([...students, newStudentForClient])
    }
    setIsFormOpen(false)
  }

  const handleFormCancel = () => {
    setIsFormOpen(false)
    setEditingStudent(null)
  }

  // Student selection handlers for batch investments
  const handleStudentToggle = (studentId: number) => {
    studentSelection.toggleStudent(studentId)
  }

  const handleOpenBatchInvestmentModal = () => {
    if (studentSelection.getSelectedCount() === 0) {
      alert('Please select at least one student for batch investment')
      return
    }
    setIsBatchInvestmentModalOpen(true)
  }

  const handleCloseBatchInvestmentModal = () => {
    setIsBatchInvestmentModalOpen(false)
    studentSelection.clearAll() // Clear selection after modal closes
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
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          <button
            onClick={handleCreateClick}
            className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
          >
            <Plus className="h-4 w-4" />
            Crear Estudiante
          </button>
          {createBatchInvestment && (
            <button
              onClick={handleOpenBatchInvestmentModal}
              disabled={studentSelection.getSelectedCount() === 0}
              className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
              title={studentSelection.getSelectedCount() === 0 ? 'Select students first' : `Create batch investment for ${studentSelection.getSelectedCount()} students`}
            >
              <Plus className="h-4 w-4" />
              Inversión en Lote ({studentSelection.getSelectedCount()})
            </button>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="space-y-4">
        <FilterBadges classes={classes} students={students} />
        
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Desktop Filters */}
          <StudentFilters
            classes={classes}
            filters={filters}
            onFiltersChange={updateFilters}
            className="hidden lg:block"
          />
          
          {/* Mobile Filters */}
          <div className="block lg:hidden">
            <MobileFilters 
              classes={classes}
              students={students}
              categories={categories}
              achievements={achievements}
              showStudentFilter={false}
              showCategoryFilter={true}
              showDateFilter={true}
              showSearchFilter={true}
              showAchievementFilters={true}
            />
          </div>
        </div>
        
        {/* Investment and Achievement Filters */}
        <StudentFiltersPanel
          categories={categories}
          achievements={achievements}
          filters={filters}
          onFiltersChange={updateFilters}
          className="lg:max-w-2xl"
        />
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
      {isEmpty ? (
        <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
          <div className="text-gray-500">
            {filters.classId ? 'No hay estudiantes en la clase seleccionada' : 'No hay estudiantes registrados'}
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <StudentSelectionTable
            students={displayStudents}
            classes={classes}
            selectedStudentIds={studentSelection.getSelectedIds()}
            onStudentToggle={handleStudentToggle}
            onEdit={handleEditStudent}
            onDelete={handleDeleteStudent}
            onSetPassword={handleSetPasswordClick}
          />
          
          {/* Pagination Controls */}
          {effectiveTotalItems > 0 && (
            <div className="flex flex-col sm:flex-row gap-4 items-center justify-between mt-6">
              <div className="text-sm text-gray-700">
                {effectiveTotalItems === 0 ? (
                  'No students found'
                ) : (
                  <>
                    Showing <span className="font-medium">{startIndex}</span> to{' '}
                    <span className="font-medium">{endIndex}</span> of{' '}
                    <span className="font-medium">{effectiveTotalItems}</span> students
                    {filters.classId && (
                      <span className="text-gray-500"> (filtered)</span>
                    )}
                  </>
                )}
              </div>
              
              <div className="flex items-center gap-4">
                <PageSizeSelector
                  currentPageSize={effectiveItemsPerPage}
                  onPageSizeChange={changeItemsPerPage}
                  options={[5, 10, 25, 50]}
                />
                
                {effectiveTotalPages > 1 && (
                  <Pagination
                    currentPage={effectiveCurrentPage}
                    totalPages={effectiveTotalPages}
                    onPageChange={goToPage}
                  />
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Batch Investment Modal */}
      {createBatchInvestment && getStudentsForBatch && (
        <BatchInvestmentModal
          isOpen={isBatchInvestmentModalOpen}
          onClose={handleCloseBatchInvestmentModal}
          classes={classes}
          categories={categories}
          onSubmit={createBatchInvestment}
          getStudentsForBatch={getStudentsForBatch}
          selectionMode={true}
          selectedStudentIds={studentSelection.getSelectedIds()}
          selectedStudentsCount={studentSelection.getSelectedCount()}
        />
      )}
    </div>
  )
}
