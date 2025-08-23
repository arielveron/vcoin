/**
 * Reusable hook for URL-based pagination
 * Maintains pagination state in URL parameters for bookmarkable URLs
 * Follows VCoin's "don't reinvent the wheel" motto
 */
'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useCallback, useTransition } from 'react'

interface UsePaginationOptions {
  defaultItemsPerPage?: number
  pageParam?: string
  pageSizeParam?: string
  autoRefresh?: boolean
}

export function usePagination({
  defaultItemsPerPage = 10,
  pageParam = 'page',
  pageSizeParam = 'size',
  autoRefresh = false
}: UsePaginationOptions = {}) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()

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
    
    if (newItemsPerPage !== undefined) {
      // Always set the parameter when explicitly changing page size
      // This ensures the server component gets the correct value
      params.set(pageSizeParam, newItemsPerPage.toString())
      // Reset to page 1 when changing page size
      params.delete(pageParam)
    }

    const newUrl = params.toString() ? `?${params.toString()}` : ''
    
    if (autoRefresh) {
      // Use startTransition + router.refresh() for smooth updates like in useAutoRefresh
      startTransition(() => {
        router.replace(newUrl, { scroll: false })
        router.refresh()
      })
    } else {
      router.replace(newUrl, { scroll: false })
    }
  }, [router, searchParams, pageParam, pageSizeParam, startTransition, autoRefresh])

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
    resetPagination,
    isPending
  }
}
