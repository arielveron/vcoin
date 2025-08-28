/**
 * Student Achievement Management Interface
 * Provides interface for managing all student achievements (manual award/revoke and automatic revoke)
 * Shows both automatic and manual achievements for complete control
 */
'use client'

import { useState, useEffect } from 'react'
import { Users, BookOpen } from 'lucide-react'
import { sortAchievementsForClient } from '@/utils/achievement-sorting'
import AwardForm from './AwardForm'
import type { Student, Class, Achievement, AchievementWithProgress, InvestmentCategory } from '@/types/database'
import { formatAchievementForClient } from '@/utils/admin-data-types'
import type { AchievementForClient } from '@/utils/admin-data-types'
import type { ActionResult } from '@/utils/server-actions'
import type { OperationResult } from '@/utils/admin-server-action-types'

interface StudentAchievementManagementProps {
  achievements: AchievementForClient[]
  students: Student[]
  classes: Class[]
  categories: InvestmentCategory[]
  selectedStudent: number | null
  studentAchievements: AchievementWithProgress[]
  isLoadingStudent: boolean
  onStudentSelect: (studentId: number) => Promise<void>
  onManualAward: (formData: FormData) => Promise<ActionResult<OperationResult>>
  onManualAwardSuccess: () => Promise<void>
  onRevokeAward?: (formData: FormData) => Promise<ActionResult<OperationResult>>
}

export default function ManualAwardInterface({ 
  achievements, 
  students, 
  classes,
  categories = [],
  selectedStudent,
  studentAchievements,
  isLoadingStudent,
  onStudentSelect,
  onManualAward,
  onManualAwardSuccess,
  onRevokeAward
}: StudentAchievementManagementProps) {
  const [selectedClass, setSelectedClass] = useState<number | null>(null)
  const [allAchievements, setAllAchievements] = useState<AchievementForClient[]>([])

  // Show ALL achievements (both manual and automatic) for complete management
  useEffect(() => {
    // Convert all achievements to proper format (no filtering by trigger_type)
    const rawAchievements = achievements.map((a: AchievementForClient) => ({
      ...a,
      created_at: new Date(a.created_at_formatted.split('/').reverse().join('-')),
      updated_at: new Date(a.updated_at_formatted.split('/').reverse().join('-'))
    })) as Achievement[]
    
    // Format to client type first, then sort - maintains type safety
    const formattedAchievements = rawAchievements.map(formatAchievementForClient)
    const sorted = sortAchievementsForClient(formattedAchievements)
    setAllAchievements(sorted)
  }, [achievements])

  const filteredStudents = selectedClass 
    ? students.filter((s: Student) => s.class_id === selectedClass)
    : students

  const handleStudentChange = async (studentId: number) => {
    await onStudentSelect(studentId)
  }

  const handleAwardSuccess = async () => {
    await onManualAwardSuccess()
  }

  return (
    <div className="bg-white shadow rounded-lg p-4 lg:p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
        <Users className="h-5 w-5 mr-2 text-blue-600" />
        Student Achievement Management
      </h3>
      
      {/* Student and Class Selection - Responsive */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Filter by Class (Optional)
          </label>
          <select
            value={selectedClass || ''}
            onChange={(e) => {
              const classId = e.target.value ? parseInt(e.target.value) : null
              setSelectedClass(classId)
              // Reset student selection when class changes
              if (selectedStudent) {
                handleStudentChange(0) // Reset to no student
              }
            }}
            className="w-full border border-gray-300 rounded-md px-3 py-3 lg:py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Classes</option>
            {classes.map((cls: Class) => (
              <option key={cls.id} value={cls.id}>
                {cls.name}
              </option>
            ))}
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select Student
          </label>
          <select
            value={selectedStudent || ''}
            onChange={(e) => {
              const studentId = e.target.value ? parseInt(e.target.value) : null
              if (studentId) {
                handleStudentChange(studentId)
              }
            }}
            className="w-full border border-gray-300 rounded-md px-3 py-3 lg:py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Choose a student...</option>
            {filteredStudents.map((student: Student) => (
              <option key={student.id} value={student.id}>
                {student.name} (Reg: {student.registro})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* All Achievements - Manual Award/Revoke and Automatic Revoke */}
      {selectedStudent && (
        <div>
          <h4 className="text-md font-medium text-gray-900 mb-3 flex items-center">
            <BookOpen className="h-4 w-4 mr-2 text-green-600" />
            All Achievements for {students.find((s: Student) => s.id === selectedStudent)?.name}
            {isLoadingStudent && <span className="ml-2 text-sm text-gray-500">(Loading...)</span>}
          </h4>
          <div className="mb-3 text-sm text-gray-600 bg-blue-50 p-3 rounded-md">
            <strong>How it works:</strong>
            <ul className="mt-1 space-y-1">
              <li>• <strong>Manual achievements:</strong> Can be granted or revoked freely</li>
              <li>• <strong>Automatic achievements:</strong> Can be revoked, but will be re-granted automatically if conditions are met during reprocessing</li>
              <li>• Use &ldquo;Process Achievements&rdquo; to recheck all automatic achievement conditions</li>
            </ul>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {allAchievements.map((achievement: AchievementForClient) => {
              const isGranted = studentAchievements.some((sa: AchievementWithProgress) => sa.id === achievement.id && sa.unlocked)
              return (
                <AwardForm
                  key={achievement.id}
                  achievement={achievement}
                  categories={categories}
                  studentId={selectedStudent}
                  isGranted={isGranted}
                  onSuccess={handleAwardSuccess}
                  onAward={onManualAward}
                  onRevoke={onRevokeAward}
                />
              )
            })}
          </div>
          
          {allAchievements.length === 0 && (
            <p className="text-gray-500 text-center py-8">
              No achievements available
            </p>
          )}
        </div>
      )}
      
      {!selectedStudent && (
        <p className="text-gray-500 text-center py-8">
          Select a student to view and award manual achievements
        </p>
      )}
    </div>
  )
}
