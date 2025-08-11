/**
 * Manual Award Interface Component
 * Provides interface for manually awarding achievements to students
 * Extracted from achievements-admin-client.tsx
 */
'use client'

import { useState, useEffect } from 'react'
import { Users, BookOpen } from 'lucide-react'
import { sortAchievementsForClient } from '@/utils/achievement-sorting'
import { getStudentAchievements } from '@/app/admin/achievements/actions'
import AchievementAwardForm from '@/app/admin/achievements/achievement-award-form'
import type { Achievement, Student, Class, AchievementWithProgress } from '@/types/database'
import { formatAchievementForClient } from '@/utils/admin-data-types'
import type { AchievementForClient } from '@/utils/admin-data-types'
import type { ActionResult } from '@/utils/server-actions'

interface ManualAwardInterfaceProps {
  achievements: AchievementForClient[]
  students: Student[]
  classes: Class[]
  onManualAward: (formData: FormData) => Promise<ActionResult<null>>
}

export default function ManualAwardInterface({ 
  achievements, 
  students, 
  classes,
  onManualAward
}: ManualAwardInterfaceProps) {
  const [selectedStudent, setSelectedStudent] = useState<number | null>(null)
  const [selectedClass, setSelectedClass] = useState<number | null>(null)
  const [manualAchievements, setManualAchievements] = useState<AchievementForClient[]>([])
  const [studentAchievements, setStudentAchievements] = useState<AchievementWithProgress[]>([])

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

  useEffect(() => {
    const fetchStudentAchievements = async () => {
      if (selectedStudent) {
        try {
          const result = await getStudentAchievements(selectedStudent)
          if (result.success && result.data) {
            setStudentAchievements(result.data)
          } else {
            console.error('Failed to fetch student achievements')
            setStudentAchievements([])
          }
        } catch (error) {
          console.error('Failed to fetch student achievements:', error)
          setStudentAchievements([])
        }
      } else {
        setStudentAchievements([])
      }
    }

    fetchStudentAchievements()
  }, [selectedStudent])

  const filteredStudents = selectedClass 
    ? students.filter(s => s.class_id === selectedClass)
    : students

  const handleAwardSuccess = async () => {
    // Refresh student achievements after award/revoke
    if (selectedStudent) {
      try {
        const result = await getStudentAchievements(selectedStudent)
        if (result.success && result.data) {
          setStudentAchievements(result.data)
        }
      } catch (error) {
        console.error('Failed to refresh student achievements:', error)
      }
    }
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
              setSelectedStudent(null) // Reset student selection
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
            onChange={(e) => setSelectedStudent(e.target.value ? parseInt(e.target.value) : null)}
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
          </h4>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {manualAchievements.map((achievement) => {
              const isGranted = studentAchievements.some(sa => sa.id === achievement.id && sa.unlocked)
              return (
                <AchievementAwardForm
                  key={achievement.id}
                  achievement={achievement}
                  studentId={selectedStudent}
                  isGranted={isGranted}
                  onSuccess={handleAwardSuccess}
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
