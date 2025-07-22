'use client'

import { useEffect } from 'react'
import { clearInvalidSession } from '@/actions/student-actions'

interface SessionCleanerProps {
  hasInvalidSession?: boolean
}

/**
 * Client component that can clear invalid sessions
 * Use this when you detect invalid session data on the server side
 */
export default function SessionCleaner({ hasInvalidSession }: SessionCleanerProps) {
  useEffect(() => {
    if (hasInvalidSession) {
      clearInvalidSession().catch(() => {
        // Silently handle errors - invalid sessions will be cleared on next login
      })
    }
  }, [hasInvalidSession])

  // This component renders nothing
  return null
}
