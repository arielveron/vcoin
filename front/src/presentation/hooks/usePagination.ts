/**
 * Reusable hook for URL-based pagination
 * Maintains pagination state in URL parameters for bookmarkable URLs
 * Follows VCoin's "don't reinvent the wheel" motto
 */
'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useCallback } from 'react'

interface UsePaginationOptions {
  defaultItemsPerPage?: number
  pageParam?: string
  pageSizeParam?: string
}

export function usePagination({
  defaultItemsPerPage = 10,
  pageParam = 'page',
  pageSizeParam = 'size'
}: UsePaginationOptions = {}) {
  const router = useRouter()
  const searchParams = useSearchParams()

  // Get current pagination state from URL
  const currentPage = parseInt(searchParams.get(pageParam) || '1', 10)
  const itemsPerPage = parseInt(searchParams.get(pageSizeParam) || defaultItemsPerPage.toString(), 10)

  // Update URL with new pagination parameters
  const updatePaginationParams = useCallback((newPage?: number, newItemsPerPage?: number) => {
    const params = new URLSearchParams(searchParams.toString())
    
    if (newPage !== undefined) {
      if (newPage === 1) {
        params.delete(pageParam) // Remove page param if it's the default (page 1)
      } else {
        params.set(pageParam, newPage.toString())
      }
    }
    
    if (newItemsPerPage !== undefined && newItemsPerPage !== defaultItemsPerPage) {
      params.set(pageSizeParam, newItemsPerPage.toString())
      // Reset to page 1 when changing page size
      params.delete(pageParam)
    }

    const newUrl = params.toString() ? `?${params.toString()}` : ''
    router.push(newUrl, { scroll: false })
  }, [router, searchParams, pageParam, pageSizeParam, defaultItemsPerPage])

  const goToPage = useCallback((page: number) => {
    updatePaginationParams(page, undefined)
  }, [updatePaginationParams])

  const changeItemsPerPage = useCallback((newItemsPerPage: number) => {
    updatePaginationParams(1, newItemsPerPage) // Reset to page 1 when changing page size
  }, [updatePaginationParams])

  const resetPagination = useCallback(() => {
    updatePaginationParams(1, defaultItemsPerPage)
  }, [updatePaginationParams, defaultItemsPerPage])

  return {
    currentPage,
    itemsPerPage,
    goToPage,
    changeItemsPerPage,
    resetPagination
  }
}
