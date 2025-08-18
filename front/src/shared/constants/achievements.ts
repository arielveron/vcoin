/**
 * Achievement Constants
 * Centralized constants for achievement categories, rarities, and labels
 */

export const ACHIEVEMENT_CATEGORIES = [
  { value: 'academic', label: 'Academic', labelEs: 'Académicos', icon: '📚' },
  { value: 'consistency', label: 'Consistency', labelEs: 'Constancia', icon: '🎯' },
  { value: 'milestone', label: 'Milestone', labelEs: 'Hitos', icon: '🚀' },
  { value: 'special', label: 'Special', labelEs: 'Especiales', icon: '⭐' }
] as const

export const ACHIEVEMENT_RARITIES = [
  { value: 'common', label: 'Common', labelEs: 'Común', color: 'green' },
  { value: 'rare', label: 'Rare', labelEs: 'Raro', color: 'blue' },
  { value: 'epic', label: 'Epic', labelEs: 'Épico', color: 'purple' },
  { value: 'legendary', label: 'Legendary', labelEs: 'Legendario', color: 'orange' }
] as const

export const CATEGORY_LABELS = {
  academic: 'Academic',
  consistency: 'Consistency', 
  milestone: 'Milestone',
  special: 'Special'
} as const

export const CATEGORY_LABELS_ES = {
  academic: 'Académicos',
  consistency: 'Constancia',
  milestone: 'Hitos', 
  special: 'Especiales'
} as const

export const RARITY_LABELS = {
  common: 'Common',
  rare: 'Rare',
  epic: 'Epic',
  legendary: 'Legendary'
} as const

export const RARITY_LABELS_ES = {
  common: 'Común',
  rare: 'Raro',
  epic: 'Épico',
  legendary: 'Legendario'
} as const

// Utility types for TypeScript
export type AchievementCategory = typeof ACHIEVEMENT_CATEGORIES[number]['value']
export type AchievementRarity = typeof ACHIEVEMENT_RARITIES[number]['value']

// For backwards compatibility with existing CATEGORY_FILTERS in student dashboard
export const CATEGORY_FILTERS = [
  { key: 'all' as const, label: 'Todos', icon: '🏆' },
  ...ACHIEVEMENT_CATEGORIES.map(cat => ({ 
    key: cat.value, 
    label: cat.labelEs, 
    icon: cat.icon 
  }))
] as const

export type CategoryKey = typeof CATEGORY_FILTERS[number]['key']
