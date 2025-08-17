/**
 * Simple Auto-Refresh Hook
 * Provides basic auto-refresh functionality for admin pages
 * Minimal changes needed to existing components
 */

'use client'

import { useRouter } from 'next/navigation'
import { useTransition } from 'react'
import type { ActionResult } from '@/utils/server-actions'

interface UseAutoRefreshOptions {
  /** Whether to show alerts on success/error */
  showAlerts?: boolean
  /** Custom success message */
  successMessage?: string
}

export function useAutoRefresh(options: UseAutoRefreshOptions = {}) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const { showAlerts = true, successMessage } = options

  const refreshAfterAction = async <T>(
    action: () => Promise<ActionResult<T>>,
    customSuccessMessage?: string
  ): Promise<ActionResult<T>> => {
    const result = await action()
    
    if (result.success) {
      // Refresh the page to get updated data
      startTransition(() => {
        router.refresh()
      })
      
      if (showAlerts && (customSuccessMessage || successMessage)) {
        alert(customSuccessMessage || successMessage || 'Operation completed successfully')
      }
    } else {
      if (showAlerts && !result.success) {
        alert(result.error)
      }
    }
    
    return result
  }

  const refreshAfterFormAction = async <T>(
    serverAction: (formData: FormData) => Promise<ActionResult<T>>,
    formData: FormData,
    customSuccessMessage?: string
  ): Promise<ActionResult<T>> => {
    return refreshAfterAction(() => serverAction(formData), customSuccessMessage)
  }

  const manualRefresh = () => {
    startTransition(() => {
      router.refresh()
    })
  }

  return {
    refreshAfterAction,
    refreshAfterFormAction,
    manualRefresh,
    isPending
  }
}
