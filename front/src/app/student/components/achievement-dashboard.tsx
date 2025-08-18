'use client';

import { useState, useMemo } from 'react';
import { AchievementWithProgress, Achievement } from '@/types/database';
import AchievementBadge from '@/components/achievement-badge';
import { cn } from '@/lib/utils';
import { sortAchievements } from '@/utils/achievement-sorting';
import { CATEGORY_FILTERS, CategoryKey } from '@/shared/constants'

interface AchievementDashboardProps {
  achievements: AchievementWithProgress[];
  studentStats: {
    total_points: number;
    achievements_unlocked: number;
    achievements_total: number;
    rank?: number;
  };
  onAchievementClick?: (achievement: Achievement) => void;
}

export function AchievementDashboard({ 
  achievements, 
  studentStats, 
  onAchievementClick 
}: AchievementDashboardProps) {
  const [selectedCategory, setSelectedCategory] = useState<CategoryKey>('all');

  // Filter achievements by category
  const filteredAchievements = useMemo(() => {
    if (selectedCategory === 'all') {
      return achievements;
    }
    return achievements.filter(achievement => achievement.category === selectedCategory);
  }, [achievements, selectedCategory]);

  // Group achievements by unlock status
  const { unlockedAchievements, lockedAchievements } = useMemo(() => {
    const unlocked = filteredAchievements.filter(a => a.unlocked);
    const locked = filteredAchievements.filter(a => !a.unlocked);
    
    // Sort both groups by category priority and points (consistent ordering)
    const sortedUnlocked = sortAchievements(unlocked);
    const sortedLocked = sortAchievements(locked);
    
    return { unlockedAchievements: sortedUnlocked, lockedAchievements: sortedLocked };
  }, [filteredAchievements]);

  // Completion rate calculation for potential future use
  // const completionRate = Math.round(
  //   (studentStats.achievements_unlocked / studentStats.achievements_total) * 100
  // );

  return (
    <div className="space-y-6">
      {/* Compact Achievement Summary - Same format as navigation */}
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="text-2xl">🏆</div>
              <div>
                <h3 className="font-semibold text-gray-900">Logros</h3>
                <p className="text-sm text-gray-600">
                  {studentStats.achievements_unlocked}/{studentStats.achievements_total} completados
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-center">
                <div className="text-lg font-bold text-blue-600">{studentStats.total_points}</div>
                <div className="text-xs text-gray-600">Puntos</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-purple-600">
                  {Math.round((studentStats.achievements_unlocked / studentStats.achievements_total) * 100)}%
                </div>
                <div className="text-xs text-gray-600">Completado</div>
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mt-3">
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${Math.round((studentStats.achievements_unlocked / studentStats.achievements_total) * 100)}%` }}
              />
            </div>
          </div>
        </div>
      

      {/* Category Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-blue-200 p-4">
        <div className="flex flex-wrap gap-2">
          {CATEGORY_FILTERS.map((category) => (
            <button
              key={category.key}
              onClick={() => setSelectedCategory(category.key)}
              className={cn(
                "flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-200",
                "border text-sm font-medium",
                selectedCategory === category.key
                  ? "bg-blue-500 text-white border-blue-500 shadow-md"
                  : "bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100"
              )}
            >
              <span className="text-lg">{category.icon}</span>
              <span>{category.label}</span>
              <span className="text-xs opacity-75">
                ({achievements.filter(a => 
                  category.key === 'all' || a.category === category.key
                ).length})
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Achievements Grid */}
      <div className="space-y-6">
        {/* Unlocked Achievements */}
        {unlockedAchievements.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm border border-blue-200 p-6">
            <div className="flex items-center space-x-2 mb-4">
              <div className="text-xl">🏆</div>
              <h3 className="text-lg font-semibold text-gray-900">
                Logros Desbloqueados ({unlockedAchievements.length})
              </h3>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
              {unlockedAchievements.map((achievement) => (
                <AchievementBadge
                  key={achievement.id}
                  achievement={achievement}
                  showProgress={false}
                  onClick={onAchievementClick ? () => onAchievementClick(achievement) : undefined}
                />
              ))}
            </div>
          </div>
        )}

        {/* Locked Achievements */}
        {lockedAchievements.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm border border-blue-200 p-6">
            <div className="flex items-center space-x-2 mb-4">
              <div className="text-xl">🔒</div>
              <h3 className="text-lg font-semibold text-gray-900">
                Próximos Logros ({lockedAchievements.length})
              </h3>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6 items-start">
              {lockedAchievements.map((achievement) => (
                <AchievementBadge
                  key={achievement.id}
                  achievement={achievement}
                  showProgress={true}
                  expandable={true}
                />
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {filteredAchievements.length === 0 && (
          <div className="bg-white rounded-lg shadow-sm border p-12 text-center">
            <div className="text-6xl mb-4">🎯</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No hay logros en esta categoría
            </h3>
            <p className="text-gray-600">
              Selecciona otra categoría para ver más logros disponibles.
            </p>
          </div>
        )}
      </div>

      {/* Motivational Footer */}
      {studentStats.achievements_unlocked < studentStats.achievements_total && (
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-200 p-6">
          <div className="flex items-center space-x-3">
            <div className="text-2xl">💪</div>
            <div>
              <h4 className="font-semibold text-gray-900">¡Sigue así!</h4>
              <p className="text-gray-600">
                Te faltan {studentStats.achievements_total - studentStats.achievements_unlocked} logros 
                para completar tu colección. ¡Cada evento te acerca más a tus objetivos!
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
