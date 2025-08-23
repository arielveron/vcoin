/**
 * Enhanced data table hook with URL-based pagination
 * Combines useDataTable and usePagination for a complete table solution
 * Follows VCoin's architectural patterns
 */
'use client'

import { useMemo } from 'react'
import { usePagination } from './usePagination'
import { TableColumn } from './useDataTable'

interface UseDataTableWithPaginationOptions<T> {
  data: T[]
  columns: TableColumn<T>[]
  filterFn?: (item: T) => boolean
  defaultItemsPerPage?: number
  sortColumn?: string
  sortDirection?: 'asc' | 'desc'
}

export function useDataTableWithPagination<T>({
  data,
  columns,
  filterFn,
  defaultItemsPerPage = 10,
  sortColumn: initialSortColumn,
  sortDirection: initialSortDirection = 'asc'
}: UseDataTableWithPaginationOptions<T>) {
  
  const { currentPage, itemsPerPage, goToPage, changeItemsPerPage, resetPagination } = usePagination({
    defaultItemsPerPage
  })

  // Apply filters
  const filteredData = useMemo(() => {
    return filterFn ? data.filter(filterFn) : data
  }, [data, filterFn])

  // Apply sorting (if provided)
  const sortedData = useMemo(() => {
    if (!initialSortColumn) return filteredData

    return [...filteredData].sort((a, b) => {
      const aValue = (a as Record<string, unknown>)[initialSortColumn]
      const bValue = (b as Record<string, unknown>)[initialSortColumn]

      // Handle different types of values
      let comparison = 0
      
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        comparison = aValue.localeCompare(bValue)
      } else if (typeof aValue === 'number' && typeof bValue === 'number') {
        comparison = aValue - bValue
      } else if (aValue instanceof Date && bValue instanceof Date) {
        comparison = aValue.getTime() - bValue.getTime()
      } else {
        // Fallback to string comparison
        const aStr = String(aValue)
        const bStr = String(bValue)
        comparison = aStr.localeCompare(bStr)
      }

      return initialSortDirection === 'asc' ? comparison : -comparison
    })
  }, [filteredData, initialSortColumn, initialSortDirection])

  // Apply pagination
  const totalPages = Math.ceil(sortedData.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const paginatedData = sortedData.slice(startIndex, endIndex)

  return {
    // Data
    data: paginatedData,
    allData: sortedData,
    columns,
    totalItems: sortedData.length,
    totalPages,
    currentPage,
    itemsPerPage,
    
    // Pagination controls
    goToPage,
    changeItemsPerPage,
    resetPagination,
    goToNextPage: () => goToPage(Math.min(currentPage + 1, totalPages)),
    goToPrevPage: () => goToPage(Math.max(currentPage - 1, 1)),
    canGoNext: currentPage < totalPages,
    canGoPrev: currentPage > 1,
    
    // Pagination info
    startIndex: startIndex + 1,
    endIndex: Math.min(endIndex, sortedData.length),
    hasNextPage: currentPage < totalPages,
    hasPrevPage: currentPage > 1,
    
    // Helpers
    isEmpty: paginatedData.length === 0,
    isFiltered: Boolean(filterFn)
  }
}
