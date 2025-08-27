/**
 * Investments Table Component
 * Displays investments in a responsive table format
 */
'use client'

import { Calendar, DollarSign, User, Tag, Edit, Trash2 } from 'lucide-react'
import ResponsiveTable from '@/components/admin/responsive-table'
import IconRenderer from '@/components/icon-renderer'
import Pagination from '@/components/admin/pagination'
import PageSizeSelector from '@/components/admin/page-size-selector'
import { usePagination } from '@/presentation/hooks/usePagination'
import type { InvestmentCategory } from '@/types/database'
import type { SortDirection } from '@/presentation/hooks/useAdminSorting'

interface InvestmentWithFormatting {
  id: number
  student_id: number
  student_name: string
  student_registro: string
  fecha_formatted: string
  monto_formatted: string
  concepto: string
  category_id?: number
  category?: InvestmentCategory
  category_name?: string // Add category name for sorting
}

interface InvestmentsTableProps {
  investments: InvestmentWithFormatting[]
  totalInvestments?: number
  totalPages?: number
  currentPage?: number
  pageSize?: number
  onEdit: (investment: InvestmentWithFormatting) => void
  onDelete: (id: number) => void
  sortBy?: string
  sortDirection?: SortDirection
  onSort?: (field: string, direction?: SortDirection) => void
}

export default function InvestmentsTable({
  investments,
  totalInvestments,
  totalPages,
  currentPage,
  pageSize,
  onEdit,
  onDelete,
  sortBy,
  sortDirection,
  onSort
}: InvestmentsTableProps) {
  const { currentPage: urlPage, itemsPerPage: urlPageSize, goToPage, changeItemsPerPage } = usePagination({
    autoRefresh: true  // Enable auto-refresh for server-side pagination
  })
  
  // Use URL state if pagination props are provided, otherwise fall back to props
  const effectivePage = totalPages ? urlPage : (currentPage || 1)
  const effectivePageSize = totalPages ? urlPageSize : (pageSize || 10)
  const effectiveTotal = totalInvestments || 0
  const effectiveTotalPages = totalPages || 1

  // Handle page size change with smart page reset
  const handlePageSizeChange = (newSize: number) => {
    // Calculate if current page would be out of bounds with new page size
    const newTotalPages = Math.ceil(effectiveTotal / newSize)
    const shouldResetPage = effectivePage > newTotalPages

    changeItemsPerPage(newSize)
    
    // Reset to page 1 if current page would be invalid
    if (shouldResetPage) {
      goToPage(1)
    }
  }

  // Handle page change with refresh
  const handlePageChange = (page: number) => {
    goToPage(page)
  }
  const columns = [
    { 
      key: 'student_name', 
      header: 'Student',
      sortable: true,
      render: (item: InvestmentWithFormatting) => (
        <div className="flex items-center space-x-2">
          <User className="h-4 w-4 text-gray-400" />
          <div>
            <div className="font-medium">{item.student_name}</div>
            <div className="text-sm text-gray-500">Registry: {item.student_registro}</div>
          </div>
        </div>
      )
    },
    { 
      key: 'fecha_formatted', 
      header: 'Date',
      sortable: true,
      render: (item: InvestmentWithFormatting) => (
        <div className="flex items-center space-x-2">
          <Calendar className="h-4 w-4 text-gray-400" />
          <span className="text-nowrap">{item.fecha_formatted}</span>
        </div>
      )
    },
    { 
      key: 'monto_formatted', 
      header: 'Amount',
      sortable: true,
      render: (item: InvestmentWithFormatting) => (
        <div className="flex items-center justify-end space-x-2">
          <DollarSign className="h-4 w-4 text-gray-400" />
          <span className="text-right text-nowrap font-bold">{item.monto_formatted}</span>
        </div>
      )
    },
    { 
      key: 'concepto', 
      header: 'Concept',
      sortable: true,
      render: (item: InvestmentWithFormatting) => (
        <span className="max-w-xs truncate block">{item.concepto}</span>
      )
    },
    {
      key: 'category',
      header: 'Category',
      sortable: true,
      sortField: 'category_name', // Add custom sort field for category name
      render: (item: InvestmentWithFormatting) => {
        if (!item.category) {
          return (
            <div className="flex items-center space-x-2">
              <Tag className="h-4 w-4 text-gray-400" />
              <span className="text-gray-400 text-sm">Standard</span>
            </div>
          )
        }
        
        return (
          <div className="flex items-center space-x-2">
            <Tag className="h-4 w-4 text-gray-400" />
            {item.category.icon_config && (
              <IconRenderer 
                name={item.category.icon_config.name}
                library={item.category.icon_config.library}
                size={16}
                color={item.category.icon_config.color}
                backgroundColor={item.category.icon_config.backgroundColor}
                animationClass={item.category.icon_config.animationClass}
                effectClass={item.category.icon_config.effectClass}
              />
            )}
            <div>
              <div className="font-medium text-sm">{item.category.name}</div>
              <div className="text-xs text-gray-500">{item.category.level}</div>
            </div>
          </div>
        )
      }
    },
    {
      key: 'actions',
      header: 'Actions',
      sortable: false, // Remove sorting from actions column
      render: (item: InvestmentWithFormatting) => (
        <div className="flex items-center space-x-2">
          <button
            onClick={() => onEdit(item)}
            className="text-indigo-600 hover:text-indigo-900 p-1"
            title="Edit"
          >
            <Edit className="h-4 w-4" />
          </button>
          <button
            onClick={() => {
              if (confirm('Are you sure you want to delete this investment?')) {
                onDelete(item.id)
              }
            }}
            className="text-red-600 hover:text-red-900 p-1"
            title="Delete"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      )
    }
  ]

  // Create sort config for ResponsiveTable
  const sortConfig = sortBy && sortDirection ? { field: sortBy, direction: sortDirection } : undefined
  
  // Wrapper for onSort to match ResponsiveTable's signature
  const handleSort = onSort ? (field: string) => onSort(field) : undefined

  return (
    <div className="space-y-4">
      <ResponsiveTable
        data={investments}
        columns={columns}
        sortConfig={sortConfig}
        onSort={handleSort}
        enableSorting={!!onSort}
      />
      
      {/* Pagination Controls */}
      {totalInvestments !== undefined && effectiveTotal > 0 && (
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between mt-6">
          <div className="text-sm text-gray-700">
            Showing {((effectivePage - 1) * effectivePageSize) + 1} to{' '}
            {Math.min(effectivePage * effectivePageSize, effectiveTotal)} of{' '}
            {effectiveTotal} investments
          </div>
          
          <div className="flex items-center gap-4">
            <PageSizeSelector
              currentPageSize={effectivePageSize}
              onPageSizeChange={handlePageSizeChange}
              options={[5, 10, 25, 50]}
            />
            
            {effectiveTotalPages > 1 && (
              <Pagination
                currentPage={effectivePage}
                totalPages={effectiveTotalPages}
                onPageChange={handlePageChange}
              />
            )}
          </div>
        </div>
      )}
    </div>
  )
}
