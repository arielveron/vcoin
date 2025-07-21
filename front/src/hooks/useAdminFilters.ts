'use client'

import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { useCallback } from 'react'

export interface AdminFilters {
  classId: number | null
  studentId: number | null
}

export function useAdminFilters() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const filters: AdminFilters = {
    classId: searchParams.get('qc') ? parseInt(searchParams.get('qc')!) : null,
    studentId: searchParams.get('qs') ? parseInt(searchParams.get('qs')!) : null
  }

  const updateFilters = useCallback((newFilters: Partial<AdminFilters>) => {
    const params = new URLSearchParams(searchParams.toString())
    
    // Update class filter
    if (newFilters.classId !== undefined) {
      if (newFilters.classId === null) {
        params.delete('qc')
        // Clear student filter when class filter is removed
        params.delete('qs')
      } else {
        params.set('qc', newFilters.classId.toString())
        // Clear student filter when class changes
        params.delete('qs')
      }
    }
    
    // Update student filter
    if (newFilters.studentId !== undefined) {
      if (newFilters.studentId === null) {
        params.delete('qs')
      } else {
        params.set('qs', newFilters.studentId.toString())
      }
    }

    const newUrl = params.toString() ? `${pathname}?${params.toString()}` : pathname
    router.push(newUrl)
  }, [router, pathname, searchParams])

  const clearFilters = useCallback(() => {
    router.push(pathname)
  }, [router, pathname])

  const getUrlWithFilters = useCallback((url: string) => {
    const params = searchParams.toString()
    return params ? `${url}?${params}` : url
  }, [searchParams])

  return {
    filters,
    updateFilters,
    clearFilters,
    getUrlWithFilters
  }
}
