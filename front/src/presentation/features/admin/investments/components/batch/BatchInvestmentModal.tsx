/**
 * Batch Investment Modal Component
 * Modal for creating multiple investments at once
 */
'use client'

import { X, Users } from 'lucide-react'
import type { InvestmentCategory, BatchInvestmentResult, Student } from '@/types/database'
import type { ClassForClient } from '@/utils/admin-data-types'
import type { ActionResult } from '@/utils/admin-server-action-types'
import { BatchInvestmentForm } from './BatchInvestmentForm'
import { BatchInvestmentTable } from './BatchInvestmentTable'
import { useBatchInvestment } from '../../hooks/useBatchInvestment'

interface BatchInvestmentModalProps {
  isOpen: boolean
  onClose: () => void
  classes: ClassForClient[]
  categories: InvestmentCategory[]
  onSubmit: (formData: FormData) => Promise<ActionResult<BatchInvestmentResult>>
  getStudentsForBatch: (formData: FormData) => Promise<ActionResult<Student[]>>
  classId?: number | null
  categoryId?: number | null
  date?: string | null
}

export default function BatchInvestmentModal({
  isOpen,
  onClose,
  classes,
  categories,
  onSubmit,
  getStudentsForBatch,
  classId,
  categoryId,
  date
}: BatchInvestmentModalProps) {
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
  } = useBatchInvestment({ onSubmit, getStudentsForBatch, onClose })

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5 text-blue-600" />
            <h2 className="text-xl font-semibold text-gray-900">
              {step === 1 ? 'Batch Investment Setup' : 'Set Investment Amounts'}
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

        {/* Content */}
        <div className="overflow-y-auto max-h-[calc(90vh-140px)]">
          {step === 1 ? (
            <BatchInvestmentForm
              classes={classes}
              categories={categories}
              onSubmit={handleFormSubmit}
              loading={loadingStudents}
              defaultClassId={classId}
              defaultCategoryId={categoryId}
              defaultDate={date}
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
