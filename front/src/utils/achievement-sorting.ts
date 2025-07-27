import { Achievement } from '@/types/database';

/**
 * Sort achievements by category priority and then by points
 * Category priority: special > milestone > academic > consistency
 */
export function sortAchievements(achievements: Achievement[]): Achievement[] {
  return [...achievements].sort((a, b) => {
    // First by category priority: special > milestone > academic > consistency
    const categoryPriority = { special: 4, milestone: 3, academic: 2, consistency: 1 };
    const aPriority = categoryPriority[a.category as keyof typeof categoryPriority] || 0;
    const bPriority = categoryPriority[b.category as keyof typeof categoryPriority] || 0;
    
    if (aPriority !== bPriority) {
      return aPriority - bPriority; // Lower priority first
    }

    // Then by points (lower points first)
    return a.points - b.points;
  });
}
