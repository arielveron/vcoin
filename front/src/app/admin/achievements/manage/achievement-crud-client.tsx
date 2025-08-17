'use client';

import { useState } from 'react';
import { Achievement, InvestmentCategory } from '@/types/database';
import IconRenderer from '@/components/icon-renderer';
import ResponsiveTable from '@/components/admin/responsive-table';
import { createAchievement, updateAchievement, deleteAchievement } from './actions';
import { Trophy, Plus, Edit, Trash2, Star } from 'lucide-react';

interface Props {
  achievements: Achievement[];
  categories: InvestmentCategory[];
}

interface AchievementFormData {
  name: string;
  name_a?: string; // Optional feminine variant name
  name_o?: string; // Optional masculine variant name
  description: string;
  category: 'academic' | 'consistency' | 'milestone' | 'special';
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  icon_name: string;
  icon_library: 'lucide' | 'heroicons-solid' | 'tabler' | 'heroicons-outline' | 'phosphor';
  icon_size: number;
  icon_color: string;
  animation_class?: string;
  trigger_type: 'automatic' | 'manual';
  metric?: 'investment_count' | 'total_invested' | 'streak_days' | 'category_count';
  operator?: '>=' | '>' | '=' | '<' | '<=';
  value?: number;
  category_id?: number; // Changed from category_name to category_id
  points: number;
  sort_order: number;
  is_active: boolean;
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
};

// Icon suggestions by library
const ICON_SUGGESTIONS = {
  lucide: ['Trophy', 'Star', 'Award', 'Crown', 'Medal', 'Target', 'Flame', 'Zap', 'Heart', 'Gem', 'Coins', 'DollarSign', 'GraduationCap'],
  'heroicons-solid': ['Trophy', 'Star', 'AcademicCap', 'Fire', 'Lightning', 'Heart'],
  'heroicons-outline': ['Trophy', 'Star', 'AcademicCap', 'Fire', 'Lightning', 'Heart'],
  tabler: ['Trophy', 'Star', 'Award', 'Crown', 'Medal', 'Target', 'Flame'],
  phosphor: ['Trophy', 'Star', 'Crown', 'Medal', 'Target', 'Fire', 'Lightning']
};

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
];

// Animation options
const ANIMATION_OPTIONS = [
  { value: '', label: 'None' },
  { value: 'animate-pulse', label: 'Pulse' },
  { value: 'animate-bounce', label: 'Bounce' },
  { value: 'animate-spin', label: 'Spin' },
  { value: 'animate-ping', label: 'Ping' },
  { value: 'animate-heartbeat', label: 'Heartbeat (Custom)' },
  { value: 'animate-float', label: 'Float (Custom)' }
];

export default function AchievementCrudClient({ achievements, categories }: Props) {
  const [achievementList, setAchievementList] = useState<Achievement[]>(achievements);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingAchievement, setEditingAchievement] = useState<Achievement | null>(null);
  const [formData, setFormData] = useState<AchievementFormData>(initialFormData);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCreate = async (formData: FormData) => {
    setIsSubmitting(true);
    try {
      const result = await createAchievement(formData);
      if (result.success && result.data) {
        setAchievementList([...achievementList, result.data]);
        setIsCreateModalOpen(false);
        setFormData(initialFormData);
        alert('Achievement created successfully!');
      } else if (!result.success) {
        alert(result.error || 'Error creating achievement');
      }
    } catch (error) {
      console.error('Create achievement error:', error);
      alert('Error creating achievement: ' + (error instanceof Error ? error.message : 'Unknown error'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdate = async (formData: FormData) => {
    if (!editingAchievement) return;
    
    setIsSubmitting(true);
    try {
      formData.append('id', editingAchievement.id.toString());
      const result = await updateAchievement(formData);
      if (result.success && result.data) {
        setAchievementList(achievementList.map(a => 
          a.id === editingAchievement.id ? result.data! : a
        ));
        setEditingAchievement(null);
        setFormData(initialFormData);
        alert('Achievement updated successfully!');
      } else if (!result.success) {
        alert(result.error || 'Error updating achievement');
      }
    } catch (error) {
      console.error('Update achievement error:', error);
      alert('Error updating achievement: ' + (error instanceof Error ? error.message : 'Unknown error'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this achievement?')) return;
    
    try {
      const formData = new FormData();
      formData.append('id', id.toString());
      const result = await deleteAchievement(formData);
      if (result.success) {
        setAchievementList(achievementList.filter(a => a.id !== id));
        alert('Achievement deleted successfully!');
      } else if (!result.success) {
        alert(result.error || 'Error deleting achievement');
      }
    } catch (error) {
      console.error('Delete achievement error:', error);
      alert('Error deleting achievement: ' + (error instanceof Error ? error.message : 'Unknown error'));
    }
  };

  const renderAchievementForm = (onSubmit: (formData: FormData) => void, submitLabel: string) => (
    <form action={onSubmit} className="space-y-4">
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
            <option value="academic">Academic</option>
            <option value="consistency">Consistency</option>
            <option value="milestone">Milestone</option>
            <option value="special">Special</option>
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
            <option value="common">Common</option>
            <option value="rare">Rare</option>
            <option value="epic">Epic</option>
            <option value="legendary">Legendary</option>
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
            
            {/* Icon suggestions for current library */}
            <div className="mt-2">
              <p className="text-xs text-gray-500 mb-1">Popular icons for {formData.icon_library}:</p>
              <div className="flex flex-wrap gap-1">
                {ICON_SUGGESTIONS[formData.icon_library]?.map((iconName) => (
                  <button
                    key={iconName}
                    type="button"
                    onClick={() => setFormData({ ...formData, icon_name: iconName })}
                    className={`px-2 py-1 text-xs rounded border hover:bg-gray-50 ${
                      formData.icon_name === iconName ? 'bg-blue-50 border-blue-300' : 'border-gray-300'
                    }`}
                  >
                    {iconName}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Library *
            </label>
            <select
              name="icon_library"
              value={formData.icon_library}
              onChange={(e) => setFormData({ ...formData, icon_library: e.target.value as AchievementFormData['icon_library'] })}
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
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Size
            </label>
            <input
              type="number"
              name="icon_size"
              value={formData.icon_size}
              onChange={(e) => setFormData({ ...formData, icon_size: parseInt(e.target.value) || 24 })}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              min="16"
              max="64"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Color
            </label>
            <div className="space-y-2">
              <input
                type="color"
                name="icon_color"
                value={formData.icon_color}
                onChange={(e) => setFormData({ ...formData, icon_color: e.target.value })}
                className="w-full h-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              
              {/* Color presets */}
              <div className="flex flex-wrap gap-1">
                {COLOR_PRESETS.map((color) => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => setFormData({ ...formData, icon_color: color })}
                    className={`w-6 h-6 rounded border-2 hover:scale-110 transition-transform ${
                      formData.icon_color === color ? 'border-gray-800' : 'border-gray-300'
                    }`}
                    style={{ backgroundColor: color }}
                    title={color}
                  />
                ))}
              </div>
            </div>
          </div>

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
        <div className="mt-3 flex items-center space-x-2">
          <span className="text-sm text-gray-600">Preview:</span>
          <div className="border rounded p-2 bg-gray-50">
            <IconRenderer
              name={formData.icon_name}
              library={formData.icon_library}
              size={formData.icon_size}
              color={formData.icon_color}
              animationClass={formData.animation_class}
              className={formData.animation_class}
            />
          </div>
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
            onChange={(e) => setFormData({ ...formData, trigger_type: e.target.value as AchievementFormData['trigger_type'] })}
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
                onChange={(e) => setFormData({ ...formData, metric: e.target.value as AchievementFormData['metric'] })}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select metric...</option>
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
                value={formData.operator || '>='}
                onChange={(e) => setFormData({ ...formData, operator: e.target.value as AchievementFormData['operator'] })}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value=">=">&gt;=</option>
                <option value=">">&gt;</option>
                <option value="=">=</option>
                <option value="<">&lt;</option>
                <option value="<=">&lt;=</option>
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
                onChange={(e) => setFormData({ ...formData, value: parseInt(e.target.value) || 0 })}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                min="0"
              />
            </div>

            {formData.metric === 'category_count' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Investment Category
                </label>
                <select
                  name="category_id"
                  value={formData.category_id || ''}
                  onChange={(e) => setFormData({ ...formData, category_id: e.target.value ? parseInt(e.target.value) : undefined })}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select a category...</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name} ({category.level})
                    </option>
                  ))}
                </select>
                <p className="text-xs text-gray-500 mt-1">
                  Choose which investment category to count for this achievement
                </p>
              </div>
            )}
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
          type="button"
          onClick={() => {
            setIsCreateModalOpen(false);
            setEditingAchievement(null);
            setFormData(initialFormData);
          }}
          className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-4 py-2 bg-blue-600 border border-transparent rounded-md text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
        >
          {isSubmitting ? 'Saving...' : submitLabel}
        </button>
      </div>
    </form>
  );

  const getRarityBadgeColor = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'bg-gray-100 text-gray-800';
      case 'rare': return 'bg-blue-100 text-blue-800';
      case 'epic': return 'bg-purple-100 text-purple-800';
      case 'legendary': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getCategoryBadgeColor = (category: string) => {
    switch (category) {
      case 'academic': return 'bg-green-100 text-green-800';
      case 'consistency': return 'bg-blue-100 text-blue-800';
      case 'milestone': return 'bg-purple-100 text-purple-800';
      case 'special': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Define columns for ResponsiveTable
  const columns = [
    {
      key: 'achievement',
      header: 'Achievement',
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
            <div className="text-sm text-gray-500 truncate max-w-xs">{achievement.description}</div>
          </div>
        </div>
      )
    },
    {
      key: 'category',
      header: 'Category',
      hideOnMobile: true,
      render: (achievement: Achievement) => (
        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getCategoryBadgeColor(achievement.category)}`}>
          {achievement.category}
        </span>
      )
    },
    {
      key: 'rarity',
      header: 'Rarity',
      render: (achievement: Achievement) => (
        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRarityBadgeColor(achievement.rarity)}`}>
          {achievement.rarity}
        </span>
      )
    },
    {
      key: 'type',
      header: 'Type',
      hideOnMobile: true,
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
            onClick={() => {
              setEditingAchievement(achievement);
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
                is_active: achievement.is_active,
              });
            }}
            className="text-indigo-600 hover:text-indigo-900 p-1"
            aria-label="Edit achievement"
          >
            <Edit className="h-4 w-4" />
          </button>
          <button
            onClick={() => handleDelete(achievement.id)}
            className="text-red-600 hover:text-red-900 p-1"
            aria-label="Delete achievement"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      )
    }
  ];

  // Custom mobile card
  const mobileCard = (achievement: Achievement) => (
    <div>
      <div className="flex justify-between items-start mb-3">
        <div className="flex items-center space-x-3">
          <div className="flex-shrink-0">
            <IconRenderer
              name={achievement.icon_config.name}
              library={achievement.icon_config.library}
              size={32}
              color={achievement.icon_config.color}
              animationClass={achievement.icon_config.animationClass}
            />
          </div>
          <div>
            <h3 className="text-lg font-medium text-gray-900">{achievement.name}</h3>
            <p className="text-sm text-gray-500">{achievement.description}</p>
          </div>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={() => {
              setEditingAchievement(achievement);
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
                is_active: achievement.is_active,
              });
            }}
            className="text-indigo-600 p-1"
          >
            <Edit className="h-5 w-5" />
          </button>
          <button
            onClick={() => handleDelete(achievement.id)}
            className="text-red-600 p-1"
          >
            <Trash2 className="h-5 w-5" />
          </button>
        </div>
      </div>
      
      <div className="space-y-2 mb-3">
        <div className="flex items-center justify-between">
          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRarityBadgeColor(achievement.rarity)}`}>
            {achievement.rarity}
          </span>
          <div className="flex items-center space-x-1">
            <Star className="h-4 w-4 text-yellow-500" />
            <span className="text-sm font-medium">{achievement.points} pts</span>
          </div>
        </div>
        
        <div className="flex items-center justify-between">
          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getCategoryBadgeColor(achievement.category)}`}>
            {achievement.category}
          </span>
          <span className={`inline-flex px-2 py-1 text-xs rounded ${
            achievement.trigger_type === 'manual' 
              ? 'bg-orange-100 text-orange-700'
              : 'bg-green-100 text-green-700'
          }`}>
            {achievement.trigger_type}
          </span>
        </div>
        
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">Status:</span>
          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
            achievement.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
          }`}>
            {achievement.is_active ? 'Active' : 'Inactive'}
          </span>
        </div>
      </div>
      
      {achievement.trigger_config && (
        <div className="text-sm text-gray-600 bg-gray-50 p-2 rounded">
          <strong>Trigger:</strong> {achievement.trigger_config.metric} {achievement.trigger_config.operator} {achievement.trigger_config.value}
        </div>
      )}
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header - Responsive */}
      <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-4">
        <div>
          <h2 className="text-xl lg:text-2xl font-semibold text-gray-900 flex items-center">
            <Trophy className="h-6 w-6 mr-2 text-yellow-600" />
            Achievement Management ({achievementList.length})
          </h2>
          <p className="text-gray-600">
            Create and manage achievement definitions and triggers
          </p>
        </div>
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[44px]"
        >
          <Plus className="h-4 w-4 mr-2" />
          Create Achievement
        </button>
      </div>

      {/* Achievements Table */}
      <ResponsiveTable
        data={achievementList}
        columns={columns}
        mobileCard={mobileCard}
        emptyMessage="No achievements found"
      />

      {/* Create Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>

            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full lg:max-w-4xl relative z-10">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                  Create New Achievement
                </h3>
                {renderAchievementForm(handleCreate, 'Create Achievement')}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editingAchievement && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>

            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full lg:max-w-4xl relative z-10">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                  Edit Achievement: {editingAchievement.name}
                </h3>
                {renderAchievementForm(handleUpdate, 'Update Achievement')}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
