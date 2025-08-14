'use client'

import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { useCallback } from 'react'

export interface AdminFilters {
  classId: number | null
  studentId: number | null
  categoryId: number | null
  date: string | null
  searchText: string | null
}

export function useAdminFilters() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const filters: AdminFilters = {
    classId: searchParams.get('qc') ? parseInt(searchParams.get('qc')!) : null,
    studentId: searchParams.get('qs') ? parseInt(searchParams.get('qs')!) : null,
    categoryId: searchParams.get('qcat') ? parseInt(searchParams.get('qcat')!) : null,
    date: searchParams.get('qd') || null,
    searchText: searchParams.get('qt') || null
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

    // Update category filter
    if (newFilters.categoryId !== undefined) {
      if (newFilters.categoryId === null) {
        params.delete('qcat')
      } else {
        params.set('qcat', newFilters.categoryId.toString())
      }
    }

    // Update date filter
    if (newFilters.date !== undefined) {
      if (newFilters.date === null) {
        params.delete('qd')
      } else {
        params.set('qd', newFilters.date)
      }
    }

    // Update search text filter
    if (newFilters.searchText !== undefined) {
      if (newFilters.searchText === null || newFilters.searchText === '') {
        params.delete('qt')
      } else {
        params.set('qt', newFilters.searchText)
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
