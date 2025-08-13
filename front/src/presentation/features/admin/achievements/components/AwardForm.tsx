/**
 * Award Form Component
 * Handles awarding and revoking achievements for individual students
 * Extracted from achievement-award-form.tsx for Phase 3 compliance
 */
'use client'

import type { Achievement } from '@/types/database'
import IconRenderer from '@/components/icon-renderer'
import type { ActionResult } from '@/utils/server-actions'
import type { OperationResult } from '@/utils/admin-server-action-types'

interface AwardFormProps {
  achievement: Achievement
  studentId: number
  isGranted?: boolean
  onSuccess?: () => void
  onAward: (formData: FormData) => Promise<ActionResult<OperationResult>>
  onRevoke?: (formData: FormData) => Promise<ActionResult<OperationResult>>
}

export default function AwardForm({ 
  achievement, 
  studentId, 
  isGranted = false,
  onSuccess,
  onAward,
  onRevoke
}: AwardFormProps) {
  const handleAwardAchievement = async (formData: FormData) => {
    try {
      const result = await onAward(formData)
      if (result.success) {
        alert('Achievement awarded successfully!')
        onSuccess?.()
      } else {
        alert(result.error || 'Failed to award achievement')
      }
    } catch (error) {
      console.error('Award achievement error:', error)
      alert('Error awarding achievement: ' + (error instanceof Error ? error.message : 'Unknown error'))
    }
  }

  const handleRevokeAchievement = async (formData: FormData) => {
    if (!onRevoke) {
      alert('Revoke action not available')
      return
    }
    
    try {
      const result = await onRevoke(formData)
      if (result.success) {
        alert('Achievement revoked successfully!')
        onSuccess?.()
      } else {
        alert(result.error || 'Failed to revoke achievement')
      }
    } catch (error) {
      console.error('Revoke achievement error:', error)
      alert('Error revoking achievement: ' + (error instanceof Error ? error.message : 'Unknown error'))
    }
  }

  return (
    <div className="border rounded-lg p-4 flex items-center justify-between">
      <div className="flex items-center space-x-3">
        <IconRenderer 
          name={achievement.icon_config.name}
          library={achievement.icon_config.library}
          size={achievement.icon_config.size}
          color={achievement.icon_config.color}
          animationClass={achievement.icon_config.animationClass}
          className="w-6 h-6"
        />
        <div>
          <h4 className="text-sm font-medium text-gray-900">
            {achievement.name}
          </h4>
          <p className="text-xs text-gray-500">
            {achievement.description}
          </p>
        </div>
      </div>
      
      {isGranted ? (
        <form action={handleRevokeAchievement}>
          <input type="hidden" name="studentId" value={studentId} />
          <input type="hidden" name="achievementId" value={achievement.id} />
          <button
            type="submit"
            className="px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Revoke
          </button>
        </form>
      ) : (
        <form action={handleAwardAchievement}>
          <input type="hidden" name="studentId" value={studentId} />
          <input type="hidden" name="achievementId" value={achievement.id} />
          <button
            type="submit"
            className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Award
          </button>
        </form>
      )}
    </div>
  )
}
