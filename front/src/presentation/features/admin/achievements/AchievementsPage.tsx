/**
 * Achievements Page Component
 * Main orchestrator component for the achievements admin
 * Refactored from 343-line achievements-admin-client.tsx
 */
'use client'

import FilterBadges from '@/app/admin/components/filter-badges'
import MobileFilters from '@/components/admin/mobile-filters'
import BackgroundJobsStatus from './components/BackgroundJobsStatus'
import AchievementsOverview from './components/AchievementsOverview'
import ManualAwardInterface from './components/ManualAwardInterface'
import type { Student } from '@/types/database'
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
  processAchievements,
  manualAward
}: AchievementsPageProps) {
  const achievements: AchievementForClient[] = initialAchievements.map(formatAchievementForClient)
  
  // Mock data for now - in real implementation these would come from props or be fetched
  const students: Student[] = []
  const backgroundJobStatus: BackgroundJobStatus | undefined = undefined

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
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1">
          <FilterBadges classes={classes} />
        </div>
        <div className="md:hidden">
          <MobileFilters classes={classes} showStudentFilter={true} />
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

      {/* Manual Award Interface */}
      <ManualAwardInterface
        achievements={achievements}
        students={students}
        classes={classes}
        onManualAward={manualAward}
      />
    </div>
  )
}
