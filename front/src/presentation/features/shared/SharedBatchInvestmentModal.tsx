/**
 * Shared Batch Investment Modal Component
 * Reusable modal for creating multiple investments at once
 * Can work with pre-selected students or use class-based selection
 */
'use client'

import { X, Users } from 'lucide-react'
import type { InvestmentCategory, BatchInvestmentResult, Student } from '@/types/database'
import type { ClassForClient, StudentForClient } from '@/utils/admin-data-types'
import type { ActionResult } from '@/utils/admin-server-action-types'
import { BatchInvestmentTable } from '../admin/investments/components/batch/BatchInvestmentTable'
import { useEnhancedBatchInvestment } from './hooks/useEnhancedBatchInvestment'
import { EnhancedBatchInvestmentForm } from './components/EnhancedBatchInvestmentForm'

interface SharedBatchInvestmentModalProps {
  isOpen: boolean
  onClose: () => void
  classes: ClassForClient[]
  categories: InvestmentCategory[]
  onSubmit: (formData: FormData) => Promise<ActionResult<BatchInvestmentResult>>
  getStudentsForBatch: (formData: FormData) => Promise<ActionResult<Student[]>>
  // Pre-selected students (optional)
  preSelectedStudents?: StudentForClient[]
  // Default values for form
  defaultClassId?: number | null
  defaultCategoryId?: number | null
  defaultDate?: string | null
}

export default function SharedBatchInvestmentModal({
  isOpen,
  onClose,
  classes,
  categories,
  onSubmit,
  getStudentsForBatch,
  preSelectedStudents = [],
  defaultClassId,
  defaultCategoryId,
  defaultDate
}: SharedBatchInvestmentModalProps) {
  const {
    step,
    setStep,
    batchData,
    availableStudents,
    studentRows,
    setStudentRows,
    loadingStudents,
    submitting,
    handleClose,
    handleFormSubmit,
    handleTableSubmit,
    toggleStudentExclusion
  } = useEnhancedBatchInvestment({ 
    onSubmit, 
    getStudentsForBatch, 
    onClose,
    preSelectedStudents
  })

  if (!isOpen) return null

  const hasPreSelectedStudents = preSelectedStudents.length > 0
  const modalTitle = hasPreSelectedStudents 
    ? `Batch Investment - ${preSelectedStudents.length} Selected Students`
    : 'Batch Investment Setup'

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5 text-blue-600" />
            <h2 className="text-xl font-semibold text-gray-900">
              {step === 1 ? modalTitle : 'Set Investment Amounts'}
            </h2>
          </div>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            disabled={submitting}
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Pre-selected Students Info */}
        {hasPreSelectedStudents && step === 1 && (
          <div className="px-6 py-3 bg-blue-50 border-b">
            <div className="text-sm text-blue-800">
              <strong>{preSelectedStudents.length}</strong> estudiante(s) pre-seleccionado(s) para inversión en lote
            </div>
            <div className="text-xs text-blue-600 mt-1">
              {preSelectedStudents.map(s => s.name).join(', ')}
            </div>
          </div>
        )}

        {/* Content */}
        <div className="overflow-y-auto max-h-[calc(90vh-140px)]">
          {step === 1 ? (
            <EnhancedBatchInvestmentForm
              classes={classes}
              categories={categories}
              onSubmit={handleFormSubmit}
              loading={loadingStudents}
              defaultClassId={defaultClassId}
              defaultCategoryId={defaultCategoryId}
              defaultDate={defaultDate}
              preSelectedStudents={preSelectedStudents}
              hideClassSelection={hasPreSelectedStudents}
            />
          ) : (
            <BatchInvestmentTable
              batchData={batchData!}
              students={availableStudents}
              studentRows={studentRows}
              onStudentRowsChange={setStudentRows}
              onSubmit={handleTableSubmit}
              onBack={() => setStep(1)}
              loading={submitting}
              onToggleExclusion={toggleStudentExclusion}
            />
          )}
        </div>
      </div>
    </div>
  )
}
