/**
 * Categories Page Component
 * Main orchestrator component for the categories admin
 * Refactored from massive 1018-line categories-admin-client.tsx
 */
'use client'

import { useState } from 'react'
import { Plus } from 'lucide-react'
import { useAdminFilters } from '../hooks/useAdminFilters'
import { useAdminSorting, sortData, createFieldAccessor } from '@/presentation/hooks/useAdminSorting'
import FilterBadges from '@/app/admin/components/filter-badges'
import MobileFilters from '@/components/admin/mobile-filters'
import {
  CategoriesTable,
  CategoryForm,
  CategoryFilters
} from './components'
import type { InvestmentCategory } from '@/types/database'
import { 
  CategoriesPageProps
} from '@/utils/admin-server-action-types'
import { 
  CategoryForClient,
  formatCategoryForClient
} from '@/utils/admin-data-types'

export default function CategoriesPage({
  initialCategories,
  classes,
  createCategory,
  updateCategory,
  deleteCategory
}: CategoriesPageProps) {
  const [categories, setCategories] = useState<CategoryForClient[]>(
    initialCategories.map(formatCategoryForClient)
  )
  const [showForm, setShowForm] = useState(false)
  const [editingCategory, setEditingCategory] = useState<CategoryForClient | null>(null)
  const { filters, updateFilters } = useAdminFilters()

  // Sorting functionality
  const { currentSort, updateSort } = useAdminSorting({ 
    defaultSort: { field: 'name', direction: 'asc' }
  })

  // Create field accessor for custom sorting
  const fieldAccessor = createFieldAccessor<CategoryForClient>({
    // Custom accessors for complex fields can be added here if needed
  })

  // Apply client-side sorting
  const sortedCategories = sortData(categories, currentSort, fieldAccessor)

  // Handlers
  const handleCreateCategory = () => {
    setEditingCategory(null)
    setShowForm(true)
  }

  const handleEditCategory = (category: CategoryForClient) => {
    setEditingCategory(category)
    setShowForm(true)
  }

  const handleDeleteCategory = async (id: number) => {
    const formData = new FormData()
    formData.append('id', id.toString())
    
    const result = await deleteCategory(formData)
    if (!result.success) {
      alert('error' in result ? result.error : 'Failed to delete category')
    } else {
      // Update local state
      setCategories(prev => prev.filter(cat => cat.id !== id))
    }
  }

  const handleFormSuccess = (rawCategory: InvestmentCategory) => {
    const category = formatCategoryForClient(rawCategory)
    
    if (editingCategory) {
      // Update existing
      setCategories(prev => prev.map(cat => 
        cat.id === category.id ? category : cat
      ))
    } else {
      // Add new
      setCategories(prev => [...prev, category])
    }
    setShowForm(false)
    setEditingCategory(null)
  }

  const handleFormCancel = () => {
    setShowForm(false)
    setEditingCategory(null)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Investment Categories</h1>
          <p className="text-sm text-gray-600 mt-1">
            Manage category styles, icons, and premium effects for investments
          </p>
        </div>
        
        <button
          onClick={handleCreateCategory}
          className="w-full sm:w-auto inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
        >
          <Plus size={20} />
          <span>Add Category</span>
        </button>
      </div>

      {/* Admin Filters */}
      <div className="space-y-4">
        <FilterBadges classes={classes} />
        
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Desktop Filters */}
          <CategoryFilters
            classes={classes}
            filters={filters}
            onFiltersChange={updateFilters}
            className="hidden lg:block"
          />
          
          {/* Mobile Filters */}
          <div className="block lg:hidden">
            <MobileFilters classes={classes} />
          </div>
        </div>
      </div>

      {/* Category Form Modal */}
      {showForm && (
        <CategoryForm
          editingCategory={editingCategory}
          onSubmit={editingCategory ? updateCategory : createCategory}
          onSuccess={handleFormSuccess}
          onCancel={handleFormCancel}
        />
      )}

      {/* Categories Table */}
      <CategoriesTable
        categories={sortedCategories}
        onEdit={handleEditCategory}
        onDelete={handleDeleteCategory}
        sortBy={currentSort.field || undefined}
        sortDirection={currentSort.direction}
        onSort={updateSort}
      />
    </div>
  )
}
