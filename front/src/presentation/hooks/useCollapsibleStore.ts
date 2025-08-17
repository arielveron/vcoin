/**
 * Collapsible Store Hook
 * Simple hook for managing collapsible UI state
 */
'use client'

import { useState } from 'react'

export function useCollapsibleStore(initialState: boolean = false) {
  const [isExpanded, setIsExpanded] = useState(initialState)

  const toggle = () => setIsExpanded(!isExpanded)
  const expand = () => setIsExpanded(true)
  const collapse = () => setIsExpanded(false)

  return {
    isExpanded,
    toggle,
    expand,
    collapse
  }
}
