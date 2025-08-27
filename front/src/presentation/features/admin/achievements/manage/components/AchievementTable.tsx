/**
 * Achievement Table Component
 * Displays achievements in a responsive table with actions
 * Extracted from achievement-crud-client.tsx following VCoin architectural guidelines
 */

'use client'

import { Star, Edit, Trash2 } from 'lucide-react'
import type { Achievement } from '@/types/database'
import IconRenderer from '@/components/icon-renderer'
import ResponsiveTable from '@/components/admin/responsive-table'
import { useAdminSorting, sortData, createFieldAccessor } from '@/presentation/hooks/useAdminSorting'
import { ACHIEVEMENT_CATEGORIES, ACHIEVEMENT_RARITIES } from '@/shared/constants'

interface Props {
  achievements: Achievement[]
  onEdit: (achievement: Achievement) => void
  onDelete: (id: number) => void
}

export default function AchievementTable({ achievements, onEdit, onDelete }: Props) {
  // Sorting functionality
  const { currentSort, updateSort } = useAdminSorting({ 
    defaultSort: { field: 'name', direction: 'asc' }
  })

  // Create field accessor for custom sorting
  const fieldAccessor = createFieldAccessor<Achievement>({
    // Custom accessors for complex fields can be added here if needed
  })

  // Apply client-side sorting
  const sortedAchievements = sortData(achievements, currentSort, fieldAccessor)

  const getRarityBadgeColor = (rarity: string) => {
    const rarityConfig = ACHIEVEMENT_RARITIES.find(r => r.value === rarity)
    if (!rarityConfig) return 'bg-gray-100 text-gray-800'
    
    switch (rarityConfig.color) {
      case 'green': return 'bg-green-100 text-green-800'
      case 'blue': return 'bg-blue-100 text-blue-800'
      case 'purple': return 'bg-purple-100 text-purple-800'
      case 'orange': return 'bg-orange-100 text-orange-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getCategoryBadgeColor = (category: string) => {
    const categoryConfig = ACHIEVEMENT_CATEGORIES.find(c => c.value === category)
    if (!categoryConfig) return 'bg-gray-100 text-gray-800'
    
    // Map categories to colors
    switch (categoryConfig.value) {
      case 'academic': return 'bg-blue-100 text-blue-800'
      case 'consistency': return 'bg-green-100 text-green-800'
      case 'milestone': return 'bg-purple-100 text-purple-800'
      case 'special': return 'bg-yellow-100 text-yellow-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  // Define columns for ResponsiveTable
  const columns = [
    {
      key: 'achievement',
      header: 'Achievement',
      sortable: true,
      sortField: 'name',
      render: (achievement: Achievement) => (
        <div className="flex items-center space-x-3">
          <div className="flex-shrink-0">
            <IconRenderer
              name={achievement.icon_config.name}
              library={achievement.icon_config.library}
              size={achievement.icon_config.size || 24}
              color={achievement.icon_config.color}
              animationClass={achievement.icon_config.animationClass}
            />
          </div>
          <div>
            <div className="text-sm font-medium text-gray-900">{achievement.name}</div>
            <div className="text-sm text-gray-500">{achievement.description}</div>
          </div>
        </div>
      )
    },
    {
      key: 'category',
      header: 'Category',
      hideOnMobile: true,
      sortable: true,
      render: (achievement: Achievement) => (
        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getCategoryBadgeColor(achievement.category)}`}>
          {achievement.category}
        </span>
      )
    },
    {
      key: 'rarity',
      header: 'Rarity',
      sortable: true,
      render: (achievement: Achievement) => (
        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRarityBadgeColor(achievement.rarity)}`}>
          {achievement.rarity}
        </span>
      )
    },
    {
      key: 'trigger_type',
      header: 'Type',
      hideOnMobile: true,
      sortable: true,
      render: (achievement: Achievement) => (
        <span className={`inline-flex px-2 py-1 text-xs rounded ${
          achievement.trigger_type === 'manual' 
            ? 'bg-orange-100 text-orange-700'
            : 'bg-green-100 text-green-700'
        }`}>
          {achievement.trigger_type}
        </span>
      )
    },
    {
      key: 'points',
      header: 'Points',
      sortable: true,
      render: (achievement: Achievement) => (
        <div className="flex items-center space-x-1">
          <Star className="h-4 w-4 text-yellow-500" />
          <span className="text-sm font-medium">{achievement.points}</span>
        </div>
      )
    },
    {
      key: 'status',
      header: 'Status',
      hideOnMobile: true,
      sortable: true,
      sortField: 'is_active',
      render: (achievement: Achievement) => (
        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
          achievement.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
        }`}>
          {achievement.is_active ? 'Active' : 'Inactive'}
        </span>
      )
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (achievement: Achievement) => (
        <div className="flex space-x-2">
          <button
            onClick={() => onEdit(achievement)}
            className="text-indigo-600 hover:text-indigo-900 p-1"
            aria-label="Edit achievement"
          >
            <Edit className="h-4 w-4" />
          </button>
          <button
            onClick={() => onDelete(achievement.id)}
            className="text-red-600 hover:text-red-900 p-1"
            aria-label="Delete achievement"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      )
    }
  ]

  // Custom mobile card
  const mobileCard = (achievement: Achievement) => (
    <div>
      <div className="flex justify-between items-start mb-3">
        <div className="flex items-center space-x-3">
          <IconRenderer
            name={achievement.icon_config.name}
            library={achievement.icon_config.library}
            size={achievement.icon_config.size || 24}
            color={achievement.icon_config.color}
            animationClass={achievement.icon_config.animationClass}
          />
          <div>
            <div className="text-sm font-medium text-gray-900">{achievement.name}</div>
            <div className="text-xs text-gray-500">{achievement.description}</div>
          </div>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={() => onEdit(achievement)}
            className="text-indigo-600 hover:text-indigo-900 p-1"
            aria-label="Edit achievement"
          >
            <Edit className="h-4 w-4" />
          </button>
          <button
            onClick={() => onDelete(achievement.id)}
            className="text-red-600 hover:text-red-900 p-1"
            aria-label="Delete achievement"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>
      
      <div className="space-y-2 mb-3">
        <div className="flex items-center space-x-2">
          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getCategoryBadgeColor(achievement.category)}`}>
            {achievement.category}
          </span>
          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRarityBadgeColor(achievement.rarity)}`}>
            {achievement.rarity}
          </span>
        </div>
        
        <div className="flex items-center justify-between">
          <span className={`inline-flex px-2 py-1 text-xs rounded ${
            achievement.trigger_type === 'manual' 
              ? 'bg-orange-100 text-orange-700'
              : 'bg-green-100 text-green-700'
          }`}>
            {achievement.trigger_type}
          </span>
          <div className="flex items-center space-x-1">
            <Star className="h-4 w-4 text-yellow-500" />
            <span className="text-sm font-medium">{achievement.points}</span>
          </div>
        </div>
        
        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
          achievement.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
        }`}>
          {achievement.is_active ? 'Active' : 'Inactive'}
        </span>
      </div>
      
      {achievement.trigger_config && (
        <div className="text-sm text-gray-600 bg-gray-50 p-2 rounded">
          Trigger: {achievement.trigger_config.metric} {achievement.trigger_config.operator} {achievement.trigger_config.value}
        </div>
      )}
    </div>
  )

  return (
    <ResponsiveTable
      data={sortedAchievements}
      columns={columns}
      mobileCard={mobileCard}
      emptyMessage="No achievements found"
      sortConfig={currentSort.field && currentSort.direction ? { field: currentSort.field, direction: currentSort.direction } : undefined}
      onSort={updateSort}
      enableSorting={true}
    />
  )
}
