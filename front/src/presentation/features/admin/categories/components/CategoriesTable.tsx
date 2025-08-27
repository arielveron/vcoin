/**
 * Categories Table Component
 * Displays categories in a responsive table format
 * Extracted from massive categories-admin-client.tsx
 */
import { Edit, Trash2, Tag, Settings, ToggleLeft, ToggleRight, Eye } from 'lucide-react'
import IconRenderer from '@/components/icon-renderer'
import StylePreview from '@/components/admin/style-preview'
import ResponsiveTable from '@/components/admin/responsive-table'
import type { CategoryForClient } from '@/utils/admin-data-types'
import type { SortDirection } from '@/presentation/hooks/useAdminSorting'

interface CategoriesTableProps {
  categories: CategoryForClient[]
  onEdit: (category: CategoryForClient) => void
  onDelete: (id: number) => void
  sortBy?: string
  sortDirection?: SortDirection
  onSort?: (field: string, direction?: SortDirection) => void
}

export default function CategoriesTable({
  categories,
  onEdit,
  onDelete,
  sortBy,
  sortDirection,
  onSort
}: CategoriesTableProps) {
  const getLevelBadgeColor = (level: string) => {
    switch (level) {
      case "bronze":
        return "bg-orange-100 text-orange-800"
      case "silver":
        return "bg-gray-100 text-gray-800"
      case "gold":
        return "bg-yellow-100 text-yellow-800"
      case "platinum":
        return "bg-purple-100 text-purple-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  // Define columns for ResponsiveTable
  const columns = [
    {
      key: "name",
      header: "Name",
      sortable: true,
      render: (category: CategoryForClient) => (
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
            <Tag className="h-4 w-4 text-purple-600" />
          </div>
          <div>
            <div className="text-sm font-medium text-gray-900">{category.name}</div>
            <div className="text-sm text-gray-500">Order: {category.sort_order}</div>
          </div>
        </div>
      ),
    },
    {
      key: "level",
      header: "Level",
      sortable: true,
      render: (category: CategoryForClient) => (
        <span
          className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getLevelBadgeColor(category.level)}`}
        >
          {category.level}
        </span>
      ),
    },
    {
      key: "icon",
      header: "Icon",
      hideOnMobile: true,
      render: (category: CategoryForClient) => (
        <div className="flex items-center gap-2">
          {category.icon_config ? (
            <IconRenderer
              name={category.icon_config.name}
              library={category.icon_config.library}
              size={category.icon_config.size || 20}
              color={category.icon_config.color}
              backgroundColor={category.icon_config.backgroundColor}
              padding={category.icon_config.padding}
              animationClass={category.icon_config.animationClass}
            />
          ) : (
            <span className="text-xs text-gray-400">No icon</span>
          )}
        </div>
      ),
    },
    {
      key: "preview",
      header: "Style",
      hideOnMobile: true,
      render: (category: CategoryForClient) => (
        <StylePreview category={category} text="Sample" showEffectName={false} />
      ),
    },
    {
      key: "status",
      header: "Status",
      sortable: true,
      sortField: "is_active",
      render: (category: CategoryForClient) => (
        <div className="flex items-center space-x-2">
          {category.is_active ? (
            <ToggleRight className="h-5 w-5 text-green-500" />
          ) : (
            <ToggleLeft className="h-5 w-5 text-gray-400" />
          )}
          <span
            className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
              category.is_active ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
            }`}
          >
            {category.is_active ? "Active" : "Inactive"}
          </span>
        </div>
      ),
    },
    {
      key: "actions",
      header: "Actions",
      render: (category: CategoryForClient) => (
        <div className="flex space-x-2">
          <button
            onClick={() => onEdit(category)}
            className="text-indigo-600 hover:text-indigo-900 p-1"
            aria-label="Edit category"
          >
            <Edit className="h-4 w-4" />
          </button>
          <button
            onClick={() => onDelete(category.id)}
            className="text-red-600 hover:text-red-900 p-1"
            aria-label="Delete category"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      ),
    },
  ]

  // Custom mobile card
  const mobileCard = (category: CategoryForClient) => {
    return (
      <div>
        <div className="flex justify-between items-start mb-3">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
              <Tag className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <h3 className="text-lg font-medium text-gray-900">{category.name}</h3>
              <span
                className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getLevelBadgeColor(
                  category.level
                )}`}
              >
                {category.level}
              </span>
            </div>
          </div>
          <div className="flex space-x-2">
            <button onClick={() => onEdit(category)} className="text-indigo-600 p-1">
              <Edit className="h-5 w-5" />
            </button>
            <button onClick={() => onDelete(category.id)} className="text-red-600 p-1">
              <Trash2 className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="space-y-3 mb-3">
          <div className="flex items-center space-x-2">
            <Settings className="h-4 w-4 text-gray-400" />
            <span className="text-sm text-gray-600">Sort Order: {category.sort_order}</span>
          </div>

          <div className="flex items-center space-x-2">
            {category.is_active ? (
              <ToggleRight className="h-5 w-5 text-green-500" />
            ) : (
              <ToggleLeft className="h-5 w-5 text-gray-400" />
            )}
            <span className="text-sm text-gray-600">{category.is_active ? "Active" : "Inactive"}</span>
          </div>
        </div>

        <div className="space-y-3">
          {category.icon_config && (
            <div className="flex items-center space-x-2">
              <Eye className="h-4 w-4 text-gray-400" />
              <IconRenderer
                name={category.icon_config.name}
                library={category.icon_config.library}
                size={category.icon_config.size || 20}
                color={category.icon_config.color}
                backgroundColor={category.icon_config.backgroundColor}
                padding={category.icon_config.padding}
                animationClass={category.icon_config.animationClass}
                effectClass={category.icon_config.effectClass}
              />
              <span className="text-sm text-gray-600">Icon configured</span>
            </div>
          )}

          <div>
            <div className="flex items-center space-x-2 mb-2">
              <Eye className="h-4 w-4 text-gray-400" />
              <span className="text-sm text-gray-600">Style Preview:</span>
            </div>
            <StylePreview category={category} text="Sample Investment Text" showEffectName={false} />
          </div>
        </div>
      </div>
    )
  }

  // Create sort config for ResponsiveTable
  const sortConfig = sortBy && sortDirection ? { field: sortBy, direction: sortDirection } : undefined
  
  // Wrapper for onSort to match ResponsiveTable's signature
  const handleSort = onSort ? (field: string) => onSort(field) : undefined

  return (
    <ResponsiveTable
      data={categories}
      columns={columns}
      mobileCard={mobileCard}
      emptyMessage="No categories found. Create your first category above."
      sortConfig={sortConfig}
      onSort={handleSort}
      enableSorting={!!onSort}
    />
  )
}
