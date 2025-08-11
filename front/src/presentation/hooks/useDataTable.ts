/**
 * Reusable hook for managing data tables
 * Provides filtering, sorting, and pagination logic
 */

import { useState, useMemo } from 'react';

export interface TableColumn<T> {
  key: string;
  header: string;
  hideOnMobile?: boolean;
  render: (item: T) => React.ReactNode;
}

interface UseDataTableOptions<T> {
  data: T[];
  columns: TableColumn<T>[];
  filterFn?: (item: T) => boolean;
  itemsPerPage?: number;
}

export function useDataTable<T>({
  data,
  columns,
  filterFn,
  itemsPerPage = 10
}: UseDataTableOptions<T>) {
  const [currentPage, setCurrentPage] = useState(1);
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  // Apply filters
  const filteredData = useMemo(() => {
    return filterFn ? data.filter(filterFn) : data;
  }, [data, filterFn]);

  // Apply sorting
  const sortedData = useMemo(() => {
    if (!sortColumn) return filteredData;

    return [...filteredData].sort((a, b) => {
      const aValue = (a as Record<string, unknown>)[sortColumn];
      const bValue = (b as Record<string, unknown>)[sortColumn];

      // Handle unknown types by converting to string for comparison
      const aStr = String(aValue);
      const bStr = String(bValue);

      if (aStr < bStr) return sortDirection === 'asc' ? -1 : 1;
      if (aStr > bStr) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  }, [filteredData, sortColumn, sortDirection]);

  // Apply pagination
  const totalPages = Math.ceil(sortedData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedData = sortedData.slice(startIndex, endIndex);

  const handleSort = (column: string) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
    setCurrentPage(1); // Reset to first page when sorting
  };

  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  return {
    // Data
    data: paginatedData,
    columns,
    totalItems: filteredData.length,
    totalPages,
    currentPage,
    itemsPerPage,
    
    // Sorting
    sortColumn,
    sortDirection,
    handleSort,
    
    // Pagination
    goToPage,
    goToNextPage: () => goToPage(currentPage + 1),
    goToPrevPage: () => goToPage(currentPage - 1),
    canGoNext: currentPage < totalPages,
    canGoPrev: currentPage > 1,
  };
}
