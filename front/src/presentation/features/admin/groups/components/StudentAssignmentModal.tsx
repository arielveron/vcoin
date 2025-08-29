/**
 * StudentAssignmentModal Component
 * Modal for managing student assignments to groups
 */
'use client'

import { useState, useEffect } from 'react'
import { X, User, Users } from 'lucide-react'
import type { GroupWithDetailsForClient, StudentForClient } from '@/utils/admin-data-types'

interface StudentAssignmentModalProps {
  group: GroupWithDetailsForClient | null
  allStudents: StudentForClient[]
  onClose: () => void
  onAssignStudent: (studentId: number, groupId: number) => Promise<void>
  onRemoveStudent: (studentId: number) => Promise<void>
  loading?: boolean
}

export default function StudentAssignmentModal({
  group,
  allStudents,
  onClose,
  onAssignStudent,
  onRemoveStudent,
  loading = false
}: StudentAssignmentModalProps) {
  const [availableStudents, setAvailableStudents] = useState<StudentForClient[]>([])
  const [searchText, setSearchText] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Filter available students (same class, not in this group, enabled)
  useEffect(() => {
    if (!group) return

    const available = allStudents.filter(student => 
      student.class_id === group.class_id && // Same class
      student.group_id !== group.id && // Not already in this group
      (!searchText || 
        student.name.toLowerCase().includes(searchText.toLowerCase()) ||
        student.registro.toString().includes(searchText)
      )
    )

    setAvailableStudents(available)
  }, [group, allStudents, searchText])

  const handleAssignStudent = async (studentId: number) => {
    if (!group || isSubmitting) return

    setIsSubmitting(true)
    try {
      await onAssignStudent(studentId, group.id)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleRemoveStudent = async (studentId: number) => {
    if (isSubmitting) return

    setIsSubmitting(true)
    try {
      await onRemoveStudent(studentId)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!group) return null

  const currentStudents = group.students || []

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-11/12 max-w-4xl shadow-lg rounded-md bg-white">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-900">
            Manage Students - Group #{group.group_number}: {group.name}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
            disabled={isSubmitting}
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Current Students */}
          <div>
            <h4 className="text-md font-medium text-gray-900 mb-3 flex items-center">
              <Users className="h-5 w-5 mr-2" />
              Current Students ({currentStudents.length})
            </h4>
            
            <div className="border rounded-lg max-h-80 overflow-y-auto">
              {currentStudents.length === 0 ? (
                <div className="p-4 text-center text-gray-500">
                  No students assigned to this group
                </div>
              ) : (
                <div className="divide-y divide-gray-200">
                  {currentStudents.map((student) => (
                    <div key={student.id} className="p-3 flex items-center justify-between hover:bg-gray-50">
                      <div className="flex items-center">
                        <User className="h-4 w-4 text-gray-400 mr-2" />
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {student.name}
                          </div>
                          <div className="text-xs text-gray-500">
                            Registro: {student.registro}
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={() => handleRemoveStudent(student.id)}
                        disabled={isSubmitting || loading}
                        className="text-red-600 hover:text-red-900 text-sm disabled:opacity-50"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Available Students */}
          <div>
            <h4 className="text-md font-medium text-gray-900 mb-3 flex items-center">
              <User className="h-5 w-5 mr-2" />
              Available Students ({availableStudents.length})
            </h4>
            
            {/* Search Input */}
            <div className="mb-3">
              <input
                type="text"
                placeholder="Search students..."
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                disabled={isSubmitting}
              />
            </div>

            <div className="border rounded-lg max-h-80 overflow-y-auto">
              {availableStudents.length === 0 ? (
                <div className="p-4 text-center text-gray-500">
                  {searchText ? 'No students found matching search' : 'No available students in this class'}
                </div>
              ) : (
                <div className="divide-y divide-gray-200">
                  {availableStudents.map((student) => (
                    <div key={student.id} className="p-3 flex items-center justify-between hover:bg-gray-50">
                      <div className="flex items-center">
                        <User className="h-4 w-4 text-gray-400 mr-2" />
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {student.name}
                          </div>
                          <div className="text-xs text-gray-500">
                            Registro: {student.registro}
                            {student.group_name && (
                              <span className="ml-2 text-orange-600">
                                Currently in: {student.group_name}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={() => handleAssignStudent(student.id)}
                        disabled={isSubmitting || loading}
                        className="text-blue-600 hover:text-blue-900 text-sm disabled:opacity-50"
                      >
                        {student.group_id ? 'Move Here' : 'Assign'}
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md shadow-sm hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 disabled:opacity-50"
          >
            Close
          </button>
        </div>

        {/* Loading Overlay */}
        {(isSubmitting || loading) && (
          <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center rounded-md">
            <div className="flex items-center">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mr-2"></div>
              <span className="text-gray-600">Processing...</span>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
