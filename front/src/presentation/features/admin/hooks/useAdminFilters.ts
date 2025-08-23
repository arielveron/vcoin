'use client'

import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { useCallback } from 'react'

export interface AdminFilters {
  classId: number | null
  studentId: number | null
  categoryId: number | null
  date: string | null
  searchText: string | null
  // Specific search filters for different contexts
  studentSearchText: string | null  // For student name/registro search
  investmentSearchText: string | null  // For investment concept search
  // Achievement filters
  achievementCategory: string | null
  achievementRarity: string | null
  achievementId: number | null // Add specific achievement filter
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
    searchText: searchParams.get('qt') || null, // Keep for backward compatibility
    studentSearchText: searchParams.get('qstext') || null,
    investmentSearchText: searchParams.get('qitext') || null,
    achievementCategory: searchParams.get('qacategory') || null,
    achievementRarity: searchParams.get('qararity') || null,
    achievementId: searchParams.get('qachievement') ? parseInt(searchParams.get('qachievement')!) : null
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

    // Update student search text filter
    if (newFilters.studentSearchText !== undefined) {
      if (newFilters.studentSearchText === null || newFilters.studentSearchText === '') {
        params.delete('qstext')
      } else {
        params.set('qstext', newFilters.studentSearchText)
      }
    }

    // Update investment search text filter
    if (newFilters.investmentSearchText !== undefined) {
      if (newFilters.investmentSearchText === null || newFilters.investmentSearchText === '') {
        params.delete('qitext')
      } else {
        params.set('qitext', newFilters.investmentSearchText)
      }
    }

    // Update achievement category filter
    if (newFilters.achievementCategory !== undefined) {
      if (newFilters.achievementCategory === null || newFilters.achievementCategory === '') {
        params.delete('qacategory')
      } else {
        params.set('qacategory', newFilters.achievementCategory)
      }
    }

    // Update achievement rarity filter
    if (newFilters.achievementRarity !== undefined) {
      if (newFilters.achievementRarity === null || newFilters.achievementRarity === '') {
        params.delete('qararity')
      } else {
        params.set('qararity', newFilters.achievementRarity)
      }
    }

    // Update achievement ID filter
    if (newFilters.achievementId !== undefined) {
      if (newFilters.achievementId === null) {
        params.delete('qachievement')
      } else {
        params.set('qachievement', newFilters.achievementId.toString())
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
