'use client'

import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { useCallback, useMemo } from 'react'

export type SortDirection = 'asc' | 'desc'

export interface SortConfig {
  field: string | null
  direction: SortDirection
}

export interface AdminSortingOptions {
  defaultSort?: SortConfig
  preserveFilters?: boolean
}

/**
 * Reusable hook for managing sorting in admin views
 * Integrates with existing filter and pagination systems
 * Follows VCoin's "don't reinvent the wheel" motto
 */
export function useAdminSorting(options: AdminSortingOptions = {}) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  
  const { defaultSort = { field: null, direction: 'asc' }, preserveFilters = true } = options

  // Parse current sort from URL parameters
  const currentSort: SortConfig = useMemo(() => {
    const sortField = searchParams.get('sort') || defaultSort.field
    const sortDirection = (searchParams.get('order') as SortDirection) || defaultSort.direction
    
    return {
      field: sortField,
      direction: sortDirection
    }
  }, [searchParams, defaultSort])

  /**
   * Update sort parameters in URL
   * @param field - Field to sort by
   * @param direction - Sort direction (optional, will toggle if field is same)
   */
  const updateSort = useCallback((field: string, direction?: SortDirection) => {
    const params = new URLSearchParams(searchParams.toString())
    
    let newDirection: SortDirection
    
    if (direction) {
      newDirection = direction
    } else {
      // Toggle direction if same field, otherwise use 'asc'
      newDirection = currentSort.field === field && currentSort.direction === 'asc' ? 'desc' : 'asc'
    }
    
    // Update sort parameters
    if (field) {
      params.set('sort', field)
      params.set('order', newDirection)
    } else {
      params.delete('sort')
      params.delete('order')
    }
    
    // Reset to first page when sorting changes (pagination compatibility)
    params.delete('page')
    
    // Preserve or clear filters based on option
    if (!preserveFilters) {
      // Clear all filter parameters
      const filterParams = ['qc', 'qs', 'qcat', 'qd', 'qt', 'qstext', 'qitext', 'qacategory', 'qararity', 'qachievement']
      filterParams.forEach(param => params.delete(param))
    }
    
    const newUrl = params.toString() ? `${pathname}?${params.toString()}` : pathname
    router.push(newUrl)
  }, [router, pathname, searchParams, currentSort, preserveFilters])

  /**
   * Clear sorting (return to default)
   */
  const clearSort = useCallback(() => {
    const params = new URLSearchParams(searchParams.toString())
    params.delete('sort')
    params.delete('order')
    
    const newUrl = params.toString() ? `${pathname}?${params.toString()}` : pathname
    router.push(newUrl)
  }, [router, pathname, searchParams])

  /**
   * Get sort indicator for a specific field
   * @param field - Field to check
   * @returns 'asc' | 'desc' | null
   */
  const getSortDirection = useCallback((field: string): SortDirection | null => {
    return currentSort.field === field ? currentSort.direction : null
  }, [currentSort])

  /**
   * Check if a field is currently being sorted
   * @param field - Field to check
   * @returns boolean
   */
  const isSorted = useCallback((field: string): boolean => {
    return currentSort.field === field
  }, [currentSort])

  /**
   * Generate URL with current sort parameters preserved
   * Useful for maintaining sort state across navigation
   * @param url - Base URL
   * @returns URL with sort parameters
   */
  const getUrlWithSort = useCallback((url: string) => {
    const params = new URLSearchParams()
    
    if (currentSort.field) {
      params.set('sort', currentSort.field)
      params.set('order', currentSort.direction)
    }
    
    // Preserve existing parameters from current URL
    searchParams.forEach((value, key) => {
      if (key !== 'sort' && key !== 'order') {
        params.set(key, value)
      }
    })
    
    return params.toString() ? `${url}?${params.toString()}` : url
  }, [searchParams, currentSort])

  return {
    currentSort,
    updateSort,
    clearSort,
    getSortDirection,
    isSorted,
    getUrlWithSort
  }
}

/**
 * Client-side sorting utility for immediate sorting without server round-trip
 * Useful for small datasets or when server-side sorting is not available
 */
export function sortData<T>(
  data: T[],
  sortConfig: SortConfig,
  fieldAccessor: (item: T, field: string) => unknown = (item, field) => (item as Record<string, unknown>)[field]
): T[] {
  if (!sortConfig.field) return data

  return [...data].sort((a, b) => {
    const aValue = fieldAccessor(a, sortConfig.field!)
    const bValue = fieldAccessor(b, sortConfig.field!)
    
    // Handle null/undefined values
    if (aValue == null && bValue == null) return 0
    if (aValue == null) return 1
    if (bValue == null) return -1
    
    // Handle different data types
    let comparison = 0
    
    if (typeof aValue === 'string' && typeof bValue === 'string') {
      comparison = aValue.localeCompare(bValue, 'es-AR', { numeric: true })
    } else if (typeof aValue === 'number' && typeof bValue === 'number') {
      comparison = aValue - bValue
    } else if (aValue instanceof Date && bValue instanceof Date) {
      comparison = aValue.getTime() - bValue.getTime()
    } else {
      // Fallback to string comparison
      comparison = String(aValue).localeCompare(String(bValue), 'es-AR', { numeric: true })
    }
    
    return sortConfig.direction === 'desc' ? -comparison : comparison
  })
}

/**
 * Type-safe field accessor for common admin entity types
 * Handles nested properties and formatted fields
 */
export function createFieldAccessor<T>(customAccessors: Record<string, (item: T) => unknown> = {}) {
  return (item: T, field: string): unknown => {
    // Use custom accessor if provided
    if (customAccessors[field]) {
      return customAccessors[field](item)
    }
    
    // Handle nested properties (e.g., 'class.name')
    if (field.includes('.')) {
      return field.split('.').reduce((obj: unknown, key: string) => {
        return obj && typeof obj === 'object' && key in obj 
          ? (obj as Record<string, unknown>)[key] 
          : undefined
      }, item)
    }
    
    // Direct property access
    return (item as Record<string, unknown>)[field]
  }
}
