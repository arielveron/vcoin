/**
 * Investments Page Component
 * Main orchestrator component for the investments admin
 * Refactored from large investments-admin-client.tsx
 */
'use client'

import { useState } from 'react'
import { Plus, Users } from 'lucide-react'
import { useAdminFilters } from '../hooks/useAdminFilters'
import { useServerAction } from '@/presentation/hooks'
import FilterBadges from '@/app/admin/components/filter-badges'
import MobileFilters from '@/components/admin/mobile-filters'
import {
  InvestmentsSummaryStats,
  InvestmentForm,
  InvestmentFilters,
  InvestmentsTable,
  BatchInvestmentModal
} from './components'
import type { InvestmentCategory } from '@/types/database'
import { 
  InvestmentForClient, 
  StudentForClient, 
  ClassForClient
} from '@/utils/admin-data-types'
import type { InvestmentAdminActions } from '@/utils/admin-server-action-types'

interface InvestmentsPageProps {
  initialInvestments: InvestmentForClient[]
  students: StudentForClient[]
  classes: ClassForClient[]
  categories: InvestmentCategory[]
  createInvestment: InvestmentAdminActions['createInvestment']
  updateInvestment: InvestmentAdminActions['updateInvestment']
  deleteInvestment: InvestmentAdminActions['deleteInvestment']
  createBatchInvestments: InvestmentAdminActions['createBatchInvestments']
  getStudentsForBatch: InvestmentAdminActions['getStudentsForBatch']
}

export default function InvestmentsPage({
  initialInvestments,
  students,
  classes,
  categories,
  createInvestment,
  updateInvestment,
  deleteInvestment,
  createBatchInvestments,
  getStudentsForBatch
}: InvestmentsPageProps) {
  const { filters, updateFilters } = useAdminFilters()
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [isBatchModalOpen, setIsBatchModalOpen] = useState(false)
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
    if (filters.categoryId && investment.category_id !== filters.categoryId) return false
    if (filters.date) {
      const investmentDate = new Date(investment.fecha).toISOString().split('T')[0]
      if (investmentDate !== filters.date) return false
    }
    if (filters.searchText) {
      const searchTerm = filters.searchText.toLowerCase()
      if (!investment.concepto.toLowerCase().includes(searchTerm)) return false
    }
    return true
  })

  // Handlers
  const handleCreateInvestment = () => {
    setEditingInvestment(null)
    setIsFormOpen(true)
  }

  const handleCreateBatchInvestment = () => {
    setIsBatchModalOpen(true)
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
            categories={categories}
            filters={filters}
            onFiltersChange={updateFilters}
            className="hidden lg:flex"
          />
          
          {/* Mobile Filters */}
          <MobileFilters 
            classes={classes}
            students={students}
            categories={categories}
            showStudentFilter={true}
            showCategoryFilter={true}
            showDateFilter={true}
            showSearchFilter={true}
          />
          
          {/* Add Investment Buttons */}
          <div className="flex gap-2">
            <button
              onClick={handleCreateInvestment}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Investment
            </button>
            
            <button
              onClick={handleCreateBatchInvestment}
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <Users className="h-4 w-4 mr-2" />
              Batch Investments
            </button>
          </div>
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

      {/* Batch Investment Modal */}
      <BatchInvestmentModal
        isOpen={isBatchModalOpen}
        onClose={() => setIsBatchModalOpen(false)}
        classes={classes}
        categories={categories}
        onSubmit={createBatchInvestments}
        getStudentsForBatch={getStudentsForBatch}
        classId={filters.classId}
        categoryId={filters.categoryId}
        date={filters.date}
      />
    </div>
  )
}
