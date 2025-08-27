/**
 * Achievement Form Component
 * Form for creating and editing achievements
 * Extracted from achievement-crud-client.tsx following VCoin architectural guidelines
 */

'use client'

import { useState, useEffect } from 'react'
import type { Achievement, InvestmentCategory, AchievementCategory, AchievementRarity, AchievementTriggerType, AchievementMetric, AchievementOperator, IconLibrary } from '@/types/database'
import { ACHIEVEMENT_CATEGORIES, ACHIEVEMENT_RARITIES } from '@/shared/constants'
import IconRenderer from '@/components/icon-renderer'

interface Props {
  achievement?: Achievement
  onSubmit: (formData: FormData) => void
  submitLabel: string
  isSubmitting: boolean
  categories: InvestmentCategory[]
}

interface AchievementFormData {
  name: string
  name_a?: string
  name_o?: string
  description: string
  category: AchievementCategory
  rarity: AchievementRarity
  icon_name: string
  icon_library: IconLibrary
  icon_size: number
  icon_color: string
  animation_class?: string
  trigger_type: AchievementTriggerType
  metric?: AchievementMetric
  operator?: AchievementOperator
  value?: number
  category_id?: number
  points: number
  sort_order: number
  is_active: boolean
}

const initialFormData: AchievementFormData = {
  name: '',
  name_a: '',
  name_o: '',
  description: '',
  category: 'academic',
  rarity: 'common',
  icon_name: 'Trophy',
  icon_library: 'lucide',
  icon_size: 24,
  icon_color: '#10B981',
  animation_class: '',
  trigger_type: 'automatic',
  metric: 'investment_count',
  operator: '>=',
  value: 1,
  points: 10,
  sort_order: 0,
  is_active: true
}

// Icon suggestions by library
const ICON_SUGGESTIONS = {
  lucide: ['Trophy', 'Star', 'Award', 'Crown', 'Medal', 'Target', 'Flame', 'Zap', 'Heart', 'Gem', 'Coins', 'DollarSign', 'GraduationCap'],
  'heroicons-solid': ['Trophy', 'Star', 'AcademicCap', 'Fire', 'Lightning', 'Heart'],
  'heroicons-outline': ['Trophy', 'Star', 'AcademicCap', 'Fire', 'Lightning', 'Heart'],
  tabler: ['Trophy', 'Star', 'Award', 'Crown', 'Medal', 'Target', 'Flame'],
  phosphor: ['Trophy', 'Star', 'Crown', 'Medal', 'Target', 'Fire', 'Lightning']
}

// Color presets
const COLOR_PRESETS = [
  '#10B981', // Emerald
  '#3B82F6', // Blue
  '#8B5CF6', // Purple
  '#EC4899', // Pink
  '#EF4444', // Red
  '#F59E0B', // Amber
  '#06B6D4', // Cyan
  '#84CC16', // Lime
  '#F97316', // Orange
  '#6366F1', // Indigo
  '#14B8A6', // Teal
  '#EAB308'  // Yellow
]

// Animation options
const ANIMATION_OPTIONS = [
  { value: '', label: 'None' },
  { value: 'animate-pulse', label: 'Pulse' },
  { value: 'animate-bounce', label: 'Bounce' },
  { value: 'animate-spin', label: 'Spin' },
  { value: 'animate-ping', label: 'Ping' },
  { value: 'animate-heartbeat', label: 'Heartbeat (Custom)' },
  { value: 'animate-float', label: 'Float (Custom)' }
]

export default function AchievementForm({ achievement, onSubmit, submitLabel, isSubmitting, categories }: Props) {
  const [formData, setFormData] = useState<AchievementFormData>(initialFormData)

  // Initialize form data with existing achievement when editing
  useEffect(() => {
    if (achievement) {
      setFormData({
        name: achievement.name,
        name_a: achievement.name_a || '',
        name_o: achievement.name_o || '',
        description: achievement.description,
        category: achievement.category,
        rarity: achievement.rarity,
        icon_name: achievement.icon_config.name,
        icon_library: achievement.icon_config.library,
        icon_size: achievement.icon_config.size || 24,
        icon_color: achievement.icon_config.color || '#10B981',
        animation_class: achievement.icon_config.animationClass || '',
        trigger_type: achievement.trigger_type,
        metric: achievement.trigger_config?.metric,
        operator: achievement.trigger_config?.operator,
        value: achievement.trigger_config?.value,
        category_id: achievement.trigger_config?.category_id,
        points: achievement.points,
        sort_order: achievement.sort_order,
        is_active: achievement.is_active
      })
    } else {
      setFormData(initialFormData)
    }
  }, [achievement])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const form = e.target as HTMLFormElement
    const formDataObj = new FormData(form)
    onSubmit(formDataObj)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Name *
          </label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        {/* Name Feminine Variant (A) */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Feminine Variant (A)
            <span className="text-xs text-gray-500 ml-1">(Optional)</span>
          </label>
          <input
            type="text"
            name="name_a"
            value={formData.name_a || ''}
            onChange={(e) => setFormData({ ...formData, name_a: e.target.value })}
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="e.g., Inversora"
          />
        </div>

        {/* Name Masculine Variant (O) */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Masculine Variant (O)
            <span className="text-xs text-gray-500 ml-1">(Optional)</span>
          </label>
          <input
            type="text"
            name="name_o"
            value={formData.name_o || ''}
            onChange={(e) => setFormData({ ...formData, name_o: e.target.value })}
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="e.g., Inversor"
          />
        </div>

        {/* Category */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Category *
          </label>
          <select
            name="category"
            value={formData.category}
            onChange={(e) => setFormData({ ...formData, category: e.target.value as AchievementFormData['category'] })}
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          >
            {ACHIEVEMENT_CATEGORIES.map((category) => (
              <option key={category.value} value={category.value}>
                {category.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Description *
        </label>
        <textarea
          name="description"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          rows={3}
          required
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Rarity */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Rarity *
          </label>
          <select
            name="rarity"
            value={formData.rarity}
            onChange={(e) => setFormData({ ...formData, rarity: e.target.value as AchievementFormData['rarity'] })}
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          >
            {ACHIEVEMENT_RARITIES.map((rarity) => (
              <option key={rarity.value} value={rarity.value}>
                {rarity.label}
              </option>
            ))}
          </select>
        </div>

        {/* Points */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Points *
          </label>
          <input
            type="number"
            name="points"
            value={formData.points}
            onChange={(e) => setFormData({ ...formData, points: parseInt(e.target.value) || 0 })}
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            min="0"
            required
          />
        </div>

        {/* Sort Order */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Sort Order
          </label>
          <input
            type="number"
            name="sort_order"
            value={formData.sort_order}
            onChange={(e) => setFormData({ ...formData, sort_order: parseInt(e.target.value) || 0 })}
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            min="0"
          />
        </div>
      </div>

      {/* Icon Configuration */}
      <div className="border-t pt-4">
        <h4 className="text-md font-medium text-gray-900 mb-3">Icon Configuration</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Icon Name *
            </label>
            <input
              type="text"
              name="icon_name"
              value={formData.icon_name}
              onChange={(e) => setFormData({ ...formData, icon_name: e.target.value })}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Trophy"
              required
            />
            
            {/* Icon Suggestions */}
            <div className="mt-2">
              <p className="text-xs text-gray-500 mb-1">Suggestions for {formData.icon_library}:</p>
              <div className="flex flex-wrap gap-1">
                {ICON_SUGGESTIONS[formData.icon_library]?.map((icon) => (
                  <button
                    key={icon}
                    type="button"
                    onClick={() => setFormData({ ...formData, icon_name: icon })}
                    className="text-xs bg-gray-100 hover:bg-gray-200 px-2 py-1 rounded"
                  >
                    {icon}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Icon Library *
            </label>
            <select
              name="icon_library"
              value={formData.icon_library}
              onChange={(e) => setFormData({ ...formData, icon_library: e.target.value as IconLibrary })}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="lucide">Lucide</option>
              <option value="heroicons-solid">Heroicons Solid</option>
              <option value="heroicons-outline">Heroicons Outline</option>
              <option value="tabler">Tabler</option>
              <option value="phosphor">Phosphor</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          {/* Icon Size */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Icon Size
            </label>
            <input
              type="number"
              name="icon_size"
              value={formData.icon_size}
              onChange={(e) => setFormData({ ...formData, icon_size: parseInt(e.target.value) || 24 })}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              min="12"
              max="64"
            />
          </div>

          {/* Icon Color */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Icon Color
            </label>
            <input
              type="color"
              name="icon_color"
              value={formData.icon_color}
              onChange={(e) => setFormData({ ...formData, icon_color: e.target.value })}
              className="w-full h-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <div className="mt-1 flex flex-wrap gap-1">
              {COLOR_PRESETS.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => setFormData({ ...formData, icon_color: color })}
                  className="w-6 h-6 rounded border border-gray-300"
                  style={{ backgroundColor: color }}
                  title={color}
                />
              ))}
            </div>
          </div>

          {/* Animation */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Animation
            </label>
            <select
              name="animation_class"
              value={formData.animation_class || ''}
              onChange={(e) => setFormData({ ...formData, animation_class: e.target.value })}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {ANIMATION_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Icon Preview */}
        <div className="flex items-center space-x-2 p-3 bg-gray-50 rounded">
          <span className="text-sm text-gray-600">Preview:</span>
          <IconRenderer
            name={formData.icon_name}
            library={formData.icon_library}
            size={formData.icon_size}
            color={formData.icon_color}
            animationClass={formData.animation_class}
          />
        </div>
      </div>

      {/* Trigger Configuration */}
      <div className="border-t pt-4">
        <h4 className="text-md font-medium text-gray-900 mb-3">Trigger Configuration</h4>
        
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Trigger Type *
          </label>
          <select
            name="trigger_type"
            value={formData.trigger_type}
            onChange={(e) => setFormData({ ...formData, trigger_type: e.target.value as AchievementTriggerType })}
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          >
            <option value="automatic">Automatic</option>
            <option value="manual">Manual</option>
          </select>
        </div>

        {formData.trigger_type === 'automatic' && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Metric
              </label>
              <select
                name="metric"
                value={formData.metric || ''}
                onChange={(e) => setFormData({ ...formData, metric: e.target.value as AchievementMetric })}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select metric</option>
                <option value="investment_count">Investment Count</option>
                <option value="total_invested">Total Invested</option>
                <option value="streak_days">Streak Days</option>
                <option value="category_count">Category Count</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Operator
              </label>
              <select
                name="operator"
                value={formData.operator || ''}
                onChange={(e) => setFormData({ ...formData, operator: e.target.value as AchievementOperator })}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select operator</option>
                <option value=">">Greater than</option>
                <option value=">=">Greater than or equal</option>
                <option value="=">=Equal</option>
                <option value="<">Less than</option>
                <option value="<=">Less than or equal</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Value
              </label>
              <input
                type="number"
                name="value"
                value={formData.value || ''}
                onChange={(e) => setFormData({ ...formData, value: parseInt(e.target.value) || undefined })}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                min="0"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Category (Optional)
              </label>
              <select
                name="category_id"
                value={formData.category_id || ''}
                onChange={(e) => setFormData({ ...formData, category_id: e.target.value ? parseInt(e.target.value) : undefined })}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Any category</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Status */}
      <div className="flex items-center">
        <input
          type="checkbox"
          name="is_active"
          id="is_active"
          checked={formData.is_active}
          onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
        />
        <label htmlFor="is_active" className="ml-2 block text-sm text-gray-900">
          Active
        </label>
      </div>

      {/* Submit Button */}
      <div className="flex justify-end space-x-3 pt-4 border-t">
        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
        >
          {isSubmitting ? 'Submitting...' : submitLabel}
        </button>
      </div>
    </form>
  )
}
