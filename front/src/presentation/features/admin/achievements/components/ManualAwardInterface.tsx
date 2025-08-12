/**
 * Manual Award Interface
 * Provides interface for manually awarding achievements to students
 * Extracted from achievements-admin-client.tsx
 */
'use client'

import { useState, useEffect } from 'react'
import { Users, BookOpen } from 'lucide-react'
import { sortAchievementsForClient } from '@/utils/achievement-sorting'
import AwardForm from './AwardForm'
import type { Student, Class, Achievement, AchievementWithProgress } from '@/types/database'
import { formatAchievementForClient } from '@/utils/admin-data-types'
import type { AchievementForClient } from '@/utils/admin-data-types'
import type { ActionResult } from '@/utils/server-actions'

interface ManualAwardInterfaceProps {
  achievements: AchievementForClient[]
  students: Student[]
  classes: Class[]
  selectedStudent: number | null
  studentAchievements: AchievementWithProgress[]
  isLoadingStudent: boolean
  onStudentSelect: (studentId: number) => Promise<void>
  onManualAward: (formData: FormData) => Promise<ActionResult<null>>
  onManualAwardSuccess: () => Promise<void>
  onRevokeAward?: (formData: FormData) => Promise<ActionResult<null>>
}

export default function ManualAwardInterface({ 
  achievements, 
  students, 
  classes,
  selectedStudent,
  studentAchievements,
  isLoadingStudent,
  onStudentSelect,
  onManualAward,
  onManualAwardSuccess,
  onRevokeAward
}: ManualAwardInterfaceProps) {
  const [selectedClass, setSelectedClass] = useState<number | null>(null)
  const [manualAchievements, setManualAchievements] = useState<AchievementForClient[]>([])

  useEffect(() => {
    const manualOnly = achievements.filter(a => a.trigger_type === 'manual')
    // Convert back to raw achievements for sorting, then sort
    const rawAchievements = manualOnly.map(a => ({
      ...a,
      created_at: new Date(a.created_at_formatted.split('/').reverse().join('-')),
      updated_at: new Date(a.updated_at_formatted.split('/').reverse().join('-'))
    })) as Achievement[]
    
    // Format to client type first, then sort - maintains type safety
    const formattedAchievements = rawAchievements.map(formatAchievementForClient)
    const sorted = sortAchievementsForClient(formattedAchievements)
    setManualAchievements(sorted)
  }, [achievements])

  const filteredStudents = selectedClass 
    ? students.filter(s => s.class_id === selectedClass)
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
        Award Manual Achievements
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
            {classes.map((cls) => (
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
            {filteredStudents.map((student) => (
              <option key={student.id} value={student.id}>
                {student.name} (Reg: {student.registro})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Manual Achievements - Responsive */}
      {selectedStudent && (
        <div>
          <h4 className="text-md font-medium text-gray-900 mb-3 flex items-center">
            <BookOpen className="h-4 w-4 mr-2 text-green-600" />
            Manual Achievements for {students.find(s => s.id === selectedStudent)?.name}
            {isLoadingStudent && <span className="ml-2 text-sm text-gray-500">(Loading...)</span>}
          </h4>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {manualAchievements.map((achievement) => {
              const isGranted = studentAchievements.some((sa: AchievementWithProgress) => sa.id === achievement.id && sa.unlocked)
              return (
                <AwardForm
                  key={achievement.id}
                  achievement={achievement}
                  studentId={selectedStudent}
                  isGranted={isGranted}
                  onSuccess={handleAwardSuccess}
                  onAward={onManualAward}
                  onRevoke={onRevokeAward}
                />
              )
            })}
          </div>
          
          {manualAchievements.length === 0 && (
            <p className="text-gray-500 text-center py-8">
              No manual achievements available
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
