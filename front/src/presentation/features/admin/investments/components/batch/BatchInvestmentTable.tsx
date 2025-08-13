/**
 * Batch Investment Table Component
 * Second step of batch investment creation - set amounts for each student
 */
'use client'

import { useState } from 'react'
import { ArrowLeft, Save } from 'lucide-react'
import type { Student } from '@/types/database'
import { formatDateForDisplay } from '@/shared/utils/formatting'
import { BulkActions } from './BulkActions'
import { StudentsInvestmentTable } from './StudentsInvestmentTable'
import { BatchSummary } from './BatchSummary'

interface BatchInvestmentTableProps {
  batchData: {
    fecha: string
    concepto: string
    category_id: number
    class_id: number
  }
  students: Student[]
  studentRows: Array<{
    student_id: number
    student_name: string
    student_registro: number
    monto: number
    excluded: boolean
  }>
  onStudentRowsChange: (rows: Array<{
    student_id: number
    student_name: string
    student_registro: number
    monto: number
    excluded: boolean
  }>) => void
  onSubmit: (rows: Array<{
    student_id: number
    student_name: string
    student_registro: number
    monto: number
    excluded: boolean
  }>) => void
  onBack: () => void
  loading: boolean
  onToggleExclusion: (studentId: number) => void
}

export function BatchInvestmentTable({
  batchData,
  students,
  studentRows,
  onStudentRowsChange,
  onSubmit,
  onBack,
  loading,
  onToggleExclusion
}: BatchInvestmentTableProps) {
  const [bulkAmount, setBulkAmount] = useState('')

  // Update amount for a specific student
  const updateStudentAmount = (studentId: number, amount: number) => {
    const updatedRows = studentRows.map(row =>
      row.student_id === studentId ? { ...row, monto: amount } : row
    )
    onStudentRowsChange(updatedRows)
  }

  // Apply bulk amount to all non-excluded students
  const applyBulkAmount = () => {
    const amount = parseFloat(bulkAmount) || 0
    const updatedRows = studentRows.map(row => 
      row.excluded ? row : { ...row, monto: amount }
    )
    onStudentRowsChange(updatedRows)
  }

  // Clear all amounts for non-excluded students
  const clearAllAmounts = () => {
    const updatedRows = studentRows.map(row => 
      row.excluded ? row : { ...row, monto: 0 }
    )
    onStudentRowsChange(updatedRows)
  }

  // Calculate total (only non-excluded students)
  const totalAmount = studentRows.filter(row => !row.excluded).reduce((sum, row) => sum + row.monto, 0)
  const activeStudentsCount = studentRows.filter(row => row.monto > 0 && !row.excluded).length

  const handleSubmit = () => {
    onSubmit(studentRows)
  }

  return (
    <div className="p-6">
      {/* Header Info */}
      <div className="mb-6 p-4 bg-blue-50 rounded-lg">
        <h3 className="font-medium text-blue-900 mb-2">Investment Details</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-blue-800">
          <div>
            <span className="font-medium">Date:</span> {formatDateForDisplay(batchData.fecha)}
          </div>
          <div>
            <span className="font-medium">Concept:</span> {batchData.concepto}
          </div>
          <div>
            <span className="font-medium">Students:</span> {students.length} available
          </div>
        </div>
      </div>

      {/* Bulk Actions */}
      <BulkActions
        bulkAmount={bulkAmount}
        onBulkAmountChange={setBulkAmount}
        onApplyBulkAmount={applyBulkAmount}
        onClearAllAmounts={clearAllAmounts}
      />

      {/* Students Table */}
        <StudentsInvestmentTable 
          studentRows={studentRows} 
          onUpdateAmount={updateStudentAmount}
          onToggleExclusion={onToggleExclusion}
        />      {/* Summary */}
      <BatchSummary
        activeStudentsCount={activeStudentsCount}
        totalStudents={students.length}
        totalAmount={totalAmount}
      />

      {/* Action Buttons */}
      <div className="flex justify-between pt-4 border-t">
        <button
          type="button"
          onClick={onBack}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </button>
        
        <button
          type="button"
          onClick={handleSubmit}
          disabled={loading || activeStudentsCount === 0}
          className="flex items-center gap-2 px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <Save className="h-4 w-4" />
          {loading ? 'Creating Investments...' : `Create ${activeStudentsCount} Investments`}
        </button>
      </div>
    </div>
  )
}
