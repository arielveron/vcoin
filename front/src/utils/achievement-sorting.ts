import { Achievement } from '@/types/database';
import { AchievementForClient } from '@/utils/admin-data-types';

/**
 * Generic achievement sorting logic that works with both raw and formatted types
 */
function sortAchievementsByLogic<T extends { category: string; points: number }>(achievements: T[]): T[] {
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

/**
 * Sort achievements by category priority and then by points
 * Category priority: special > milestone > academic > consistency
 */
export function sortAchievements(achievements: Achievement[]): Achievement[] {
  return sortAchievementsByLogic(achievements);
}

/**
 * Sort formatted achievements (AchievementForClient) using the same logic
 * This maintains type safety and avoids casting
 */
export function sortAchievementsForClient(achievements: AchievementForClient[]): AchievementForClient[] {
  return sortAchievementsByLogic(achievements);
}
