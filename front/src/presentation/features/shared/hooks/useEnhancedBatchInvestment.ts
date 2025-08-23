/**
 * Enhanced Batch Investment Hook
 * Business logic for batch investment modal with pre-selected students support
 */
import { useState } from 'react'
import { useServerAction } from '@/presentation/hooks'
import type { Student, BatchInvestmentResult } from '@/types/database'
import type { ActionResult } from '@/utils/admin-server-action-types'
import type { StudentForClient } from '@/utils/admin-data-types'

interface BatchInvestmentData {
  fecha: string
  concepto: string
  category_id: number
  class_id: number
}

interface StudentRow {
  student_id: number
  student_name: string
  student_registro: number
  monto: number
  excluded: boolean // Track if student is temporarily excluded
}

interface UseEnhancedBatchInvestmentProps {
  onSubmit: (formData: FormData) => Promise<ActionResult<BatchInvestmentResult>>
  getStudentsForBatch: (formData: FormData) => Promise<ActionResult<Student[]>>
  onClose: () => void
  preSelectedStudents?: StudentForClient[]
}

export function useEnhancedBatchInvestment({
  onSubmit,
  getStudentsForBatch,
  onClose,
  preSelectedStudents = []
}: UseEnhancedBatchInvestmentProps) {
  const [step, setStep] = useState(1) // 1: Form, 2: Table
  const [batchData, setBatchData] = useState<BatchInvestmentData | null>(null)
  const [availableStudents, setAvailableStudents] = useState<Student[]>([])
  const [studentRows, setStudentRows] = useState<StudentRow[]>([])
  
  const { execute: executeGetStudents, loading: loadingStudents } = useServerAction(getStudentsForBatch)
  const { execute: executeSubmit, loading: submitting } = useServerAction(onSubmit)

  const hasPreSelectedStudents = preSelectedStudents.length > 0

  // Reset modal state
  const handleClose = () => {
    setStep(1)
    setBatchData(null)
    setAvailableStudents([])
    setStudentRows([])
    onClose()
  }

  // Convert StudentForClient to Student for compatibility
  const convertToStudents = (studentsForClient: StudentForClient[]): Student[] => {
    return studentsForClient.map(student => ({
      id: student.id,
      name: student.name,
      registro: student.registro,
      email: '', // Email not needed for batch investment
      class_id: student.class_id,
      password_hash: '', // Not needed for batch investment
      personalizacion: null, // Not needed for batch investment
      created_at: new Date(student.created_at), // Convert back to Date
      updated_at: new Date() // Default to current time
    }))
  }

  // Handle form submission for step 1
  const handleFormSubmit = async (formData: BatchInvestmentData) => {
    setBatchData(formData)
    
    if (hasPreSelectedStudents) {
      // Use pre-selected students directly
      const students = convertToStudents(preSelectedStudents)
      setAvailableStudents(students)
      // Initialize student rows with 0 amounts and not excluded
      setStudentRows(students.map(student => ({
        student_id: student.id,
        student_name: student.name,
        student_registro: student.registro,
        monto: 0,
        excluded: false
      })))
      setStep(2)
    } else {
      // Get available students from class
      const studentsFormData = new FormData()
      studentsFormData.append('class_id', formData.class_id.toString())
      studentsFormData.append('fecha', formData.fecha)
      studentsFormData.append('concepto', formData.concepto)
      studentsFormData.append('category_id', formData.category_id.toString())
      
      const result = await executeGetStudents(studentsFormData)
      
      if (result?.success && result.data) {
        setAvailableStudents(result.data)
        // Initialize student rows with 0 amounts and not excluded
        setStudentRows(result.data.map(student => ({
          student_id: student.id,
          student_name: student.name,
          student_registro: student.registro,
          monto: 0,
          excluded: false
        })))
        setStep(2)
      } else {
        alert(result?.error || 'Failed to load students')
      }
    }
  }

  // Handle table submission for step 2
  const handleTableSubmit = async (rows: StudentRow[]) => {
    if (!batchData) return
    
    // Get non-excluded students
    const activeRows = rows.filter(row => !row.excluded)
    
    // Check that all active students have valid amounts
    const emptyRows = activeRows.filter(row => !row.monto || row.monto <= 0)
    if (emptyRows.length > 0) {
      const studentNames = emptyRows.map(row => row.student_name).join(', ')
      alert(`Please enter valid investment amounts for all students or exclude them. Missing amounts for: ${studentNames}`)
      return
    }
    
    // Filter rows with amounts > 0 and not excluded
    const validRows = rows.filter(row => row.monto > 0 && !row.excluded)
    
    if (validRows.length === 0) {
      alert('Please enter at least one investment amount greater than 0')
      return
    }

    // Create form data
    const formData = new FormData()
    formData.append('fecha', batchData.fecha)
    formData.append('concepto', batchData.concepto)
    formData.append('category_id', batchData.category_id.toString())
    
    // Convert to JSON for the investments data
    const investments = validRows.map(row => ({
      student_id: row.student_id,
      student_name: row.student_name,
      student_registro: row.student_registro,
      monto: row.monto // Keep original amount, no conversion to cents
    }))
    
    formData.append('investments', JSON.stringify(investments))
    
    const result = await executeSubmit(formData)
    
    if (result?.success) {
      const data = result.data
      if (data?.success) {
        alert(`Successfully created ${data.created_count} investments`)
        handleClose()
      } else {
        const errorMsg = data?.errors?.join('\n') || 'Failed to create some investments'
        alert(`Created ${data?.created_count || 0} investments. ${data?.failed_count || 0} failed:\n${errorMsg}`)
      }
    } else {
      alert(result?.error || 'Failed to create batch investments')
    }
  }

  // Toggle student exclusion
  const toggleStudentExclusion = (studentId: number) => {
    setStudentRows(prev => prev.map(row => 
      row.student_id === studentId 
        ? { ...row, excluded: !row.excluded, monto: row.excluded ? row.monto : 0 } // Reset amount when excluding
        : row
    ))
  }

  return {
    step,
    setStep,
    batchData,
    availableStudents,
    studentRows,
    setStudentRows,
    loadingStudents,
    submitting,
    hasPreSelectedStudents,
    handleClose,
    handleFormSubmit,
    handleTableSubmit,
    toggleStudentExclusion
  }
}
