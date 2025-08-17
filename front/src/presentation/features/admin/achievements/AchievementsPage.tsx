/**
 * Achievements Page Component
 * Main orchestrator component for the achievements admin
 * Refactored from 343-line achievements-admin-client.tsx
 */
'use client'

import { useState } from 'react'
import { useAdminFilters } from '../hooks/useAdminFilters'
import FilterBadges from '@/app/admin/components/filter-badges'
import MobileFilters from '@/components/admin/mobile-filters'
import {
  BackgroundJobsStatus,
  AchievementsOverview,
  ManualAwardInterface,
  AchievementFilters
} from './components'
import type { Student, AchievementWithProgress } from '@/types/database'
import {
  AchievementsPageProps
} from '@/utils/admin-server-action-types'
import {
  AchievementForClient,
  formatAchievementForClient
} from '@/utils/admin-data-types'

interface BackgroundJobStatus {
  daily: { 
    status: string; 
    lastRun: string | null; 
    lastRunFormatted: string;
    error?: string; 
    lastMessage?: string; 
  };
  weekly: { 
    status: string; 
    lastRun: string | null; 
    lastRunFormatted: string;
    error?: string; 
    lastMessage?: string; 
  };
  check: { 
    status: string; 
    lastRun: string | null; 
    lastRunFormatted: string;
    error?: string; 
    lastMessage?: string; 
  };
  lastUpdated: string;
  lastUpdatedFormatted: string;
}

export default function AchievementsPage({
  initialAchievements,
  classes,
  categories, // eslint-disable-line @typescript-eslint/no-unused-vars
  students,
  processAchievements,
  manualAward,
  manualRevoke,
  getStudentAchievements
}: AchievementsPageProps) {
  const achievements: AchievementForClient[] = initialAchievements.map(formatAchievementForClient)
  const { filters, updateFilters } = useAdminFilters()
  
  // State for manual award interface
  const [selectedStudent, setSelectedStudent] = useState<number | null>(null)
  const [studentAchievements, setStudentAchievements] = useState<AchievementWithProgress[]>([])
  const [isLoadingStudent, setIsLoadingStudent] = useState(false)
  
  // Mock data for now - in real implementation these would come from props or be fetched
  const backgroundJobStatus: BackgroundJobStatus | undefined = undefined

  // Ensure TypeScript recognizes Student type usage
  const studentsData: Student[] = students

  // Server actions - no need for useServerAction wrapper for simple cases
  
  // Handle manual award with success callback
  const handleManualAward = async (formData: FormData) => {
    const result = await manualAward(formData)
    if (result.success) {
      await handleManualAwardSuccess()
    }
    return result
  }

  // Handle manual revoke with success callback
  const handleManualRevoke = async (formData: FormData) => {
    if (!manualRevoke) {
      return { success: false, error: 'Revoke functionality not available' }
    }
    const result = await manualRevoke(formData)
    if (result.success) {
      await handleManualAwardSuccess() // Refresh the student achievements list
    }
    return result
  }

  // Handle student selection and fetch their achievements
  const handleStudentSelect = async (studentId: number) => {
    setSelectedStudent(studentId)
    setIsLoadingStudent(true)
    
    try {
      const result = await getStudentAchievements(studentId)
      if (result.success) {
        setStudentAchievements(result.data || [])
      } else {
        console.error('Failed to fetch student achievements:', result.error)
        setStudentAchievements([])
      }
    } catch (error) {
      console.error('Error fetching student achievements:', error)
      setStudentAchievements([])
    } finally {
      setIsLoadingStudent(false)
    }
  }

  // Handle manual award success and refresh student achievements
  const handleManualAwardSuccess = async () => {
    if (selectedStudent) {
      const result = await getStudentAchievements(selectedStudent)
      if (result.success) {
        setStudentAchievements(result.data || [])
      }
    }
  }

  // Process achievements handler
  const handleProcessAchievements = async () => {
    const result = await processAchievements()
    if (!result.success) {
      alert('error' in result ? result.error : 'Failed to process achievements')
    } else {
      alert(`Successfully processed ${result.data?.processed || 0} achievements`)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-4">
        <div>
          <h2 className="text-xl lg:text-2xl font-semibold text-gray-900">Achievement Management</h2>
          <p className="text-gray-600">
            {achievements.length} achievements • Monitor student progress and background jobs
          </p>
        </div>
      </div>

      {/* Admin Filters */}
      <div className="space-y-4">
        <FilterBadges classes={classes} />
        
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Desktop Filters */}
          <AchievementFilters
            classes={classes}
            filters={filters}
            onFiltersChange={updateFilters}
            className="hidden lg:block"
          />
          
          {/* Mobile Filters */}
          <div className="block lg:hidden">
            <MobileFilters classes={classes} showStudentFilter={true} />
          </div>
        </div>
      </div>

      {/* Background Jobs Status */}
      {backgroundJobStatus && (
        <BackgroundJobsStatus status={backgroundJobStatus} />
      )}

      {/* Achievements Overview */}
      <AchievementsOverview 
        achievements={achievements}
        onProcess={handleProcessAchievements}
      />

      {/* Student Achievement Management Interface */}
      <ManualAwardInterface
        achievements={achievements}
        students={studentsData}
        classes={classes}
        selectedStudent={selectedStudent}
        studentAchievements={studentAchievements}
        isLoadingStudent={isLoadingStudent}
        onStudentSelect={handleStudentSelect}
        onManualAward={handleManualAward}
        onManualAwardSuccess={handleManualAwardSuccess}
        onRevokeAward={handleManualRevoke}
      />
    </div>
  )
}
