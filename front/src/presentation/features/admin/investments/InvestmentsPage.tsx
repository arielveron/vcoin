/**
 * Investments Page Component
 * Main orchestrator component for the investments admin
 * Refactored from large investments-admin-client.tsx
 */
'use client'

import { useState } from 'react'
import { Plus } from 'lucide-react'
import { useAdminFilters } from '@/hooks/useAdminFilters'
import { useServerAction } from '@/presentation/hooks'
import FilterBadges from '@/app/admin/components/filter-badges'
import MobileFilters from '@/components/admin/mobile-filters'
import {
  InvestmentsSummaryStats,
  InvestmentForm,
  InvestmentFilters,
  InvestmentsTable
} from './components'
import type { InvestmentWithStudent, Student, Class, InvestmentCategory } from '@/types/database'
import { WithFormattedDates } from '@/utils/format-dates'

// Types for formatted data
type InvestmentForClient = WithFormattedDates<InvestmentWithStudent, 'fecha' | 'created_at' | 'updated_at'> & {
  monto_formatted: string
}
type StudentForClient = WithFormattedDates<Student, 'created_at' | 'updated_at'>
type ClassForClient = WithFormattedDates<Class, 'end_date' | 'created_at' | 'updated_at'>

interface InvestmentsPageProps {
  initialInvestments: InvestmentForClient[]
  students: StudentForClient[]
  classes: ClassForClient[]
  categories: InvestmentCategory[]
  createInvestment: (formData: FormData) => Promise<{ success: boolean; error?: string }>
  updateInvestment: (formData: FormData) => Promise<{ success: boolean; error?: string }>
  deleteInvestment: (formData: FormData) => Promise<{ success: boolean; error?: string }>
}

export default function InvestmentsPage({
  initialInvestments,
  students,
  classes,
  categories,
  createInvestment,
  updateInvestment,
  deleteInvestment
}: InvestmentsPageProps) {
  const { filters, updateFilters } = useAdminFilters()
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingInvestment, setEditingInvestment] = useState<InvestmentForClient | null>(null)
  
  // Server actions
  const { execute: executeDelete } = useServerAction(deleteInvestment)
  
  // Filter investments based on current filters
  const filteredInvestments = initialInvestments.filter(investment => {
    if (filters.classId) {
      const student = students.find(s => s.id === investment.student_id)
      if (!student || student.class_id !== filters.classId) return false
    }
    if (filters.studentId && investment.student_id !== filters.studentId) return false
    return true
  })

  // Handlers
  const handleCreateInvestment = () => {
    setEditingInvestment(null)
    setIsFormOpen(true)
  }

  const handleEditInvestment = (investment: InvestmentForClient) => {
    setEditingInvestment(investment)
    setIsFormOpen(true)
  }

  const handleDeleteInvestment = async (id: number) => {
    const formData = new FormData()
    formData.append('id', id.toString())
    
    const result = await executeDelete(formData)
    if (!result?.success) {
      alert(result?.error || 'Failed to delete investment')
    }
  }

  const handleFormSubmit = editingInvestment ? updateInvestment : createInvestment

  // Wrapper to convert table investment back to full investment for editing
  const handleEditInvestmentWrapper = (tableInvestment: {
    id: number
    student_id: number
    student_name: string
    student_registro: string
    fecha_formatted: string
    monto_formatted: string
    concepto: string
    category_id?: number
    category?: InvestmentCategory
  }) => {
    const fullInvestment = filteredInvestments.find(inv => inv.id === tableInvestment.id)
    if (fullInvestment) {
      handleEditInvestment(fullInvestment)
    }
  }

  // Transform data for table component  
  const tableInvestments = filteredInvestments.map(inv => {
    const student = students.find(s => s.id === inv.student_id)
    return {
      id: inv.id,
      student_id: inv.student_id,
      student_name: inv.student_name,
      student_registro: student?.registro?.toString() || 'N/A',
      fecha_formatted: inv.fecha_formatted,
      monto_formatted: inv.monto_formatted,
      concepto: inv.concepto,
      category_id: inv.category_id,
      category: inv.category_id ? categories.find(c => c.id === inv.category_id) : undefined
    }
  })

  // Remove unused mobileFilterFields variable since we're using MobileFilters directly

  return (
    <div className="space-y-6">
      <FilterBadges classes={classes} students={students} />
      
      {/* Summary Stats */}
      <InvestmentsSummaryStats investments={filteredInvestments} />

      {/* Header with Controls */}
      <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-4">
        <div>
          <h2 className="text-xl lg:text-2xl font-semibold text-gray-900">All Investments</h2>
          <p className="text-gray-600">Total: {filteredInvestments.length} investments</p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-2">
          {/* Desktop Filters */}
          <InvestmentFilters
            classes={classes}
            students={students}
            filters={filters}
            onFiltersChange={updateFilters}
            className="hidden lg:flex"
          />
          
          {/* Mobile Filters */}
          <MobileFilters 
            classes={classes}
            students={students}
            showStudentFilter={true}
          />
          
          {/* Add Investment Button */}
          <button
            onClick={handleCreateInvestment}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Investment
          </button>
        </div>
      </div>

      {/* Investments Table */}
      <InvestmentsTable
        investments={tableInvestments}
        onEdit={handleEditInvestmentWrapper}
        onDelete={handleDeleteInvestment}
      />

      {/* Investment Form Modal */}
      <InvestmentForm
        students={students}
        categories={categories}
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSubmit={handleFormSubmit}
        editingInvestment={editingInvestment ? {
          id: editingInvestment.id,
          student_id: editingInvestment.student_id,
          fecha: editingInvestment.fecha,
          monto: editingInvestment.monto,
          concepto: editingInvestment.concepto,
          category_id: editingInvestment.category_id
        } : null}
        classId={filters.classId}
        studentId={filters.studentId}
      />
    </div>
  )
}
