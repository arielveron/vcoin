'use client';

import { useState, useEffect } from 'react';
import { AchievementWithProgress, Achievement } from '@/types/database';
import { AchievementDashboard } from './achievement-dashboard';
import AchievementCelebration from '@/components/achievement-celebration';

interface AchievementSectionProps {
  achievements: AchievementWithProgress[];
  studentStats: {
    total_points: number;
    achievements_unlocked: number;
    achievements_total: number;
    rank?: number;
  };
  unseenAchievements: Achievement[];
}

export default function AchievementSection({ 
  achievements, 
  studentStats, 
  unseenAchievements
}: AchievementSectionProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [currentCelebration, setCurrentCelebration] = useState<Achievement | null>(null);
  const [celebrationQueue, setCelebrationQueue] = useState<Achievement[]>(unseenAchievements);

  // Show celebrations for unseen achievements
  useEffect(() => {
    if (celebrationQueue.length > 0 && !currentCelebration) {
      const nextAchievement = celebrationQueue[0];
      setCurrentCelebration(nextAchievement);
      setCelebrationQueue(prev => prev.slice(1));
    }
  }, [celebrationQueue, currentCelebration]);

  const handleCelebrationClose = async () => {
    if (currentCelebration) {
      // Mark achievement as seen (we'll create this action later)
      try {
        // For now, just close the celebration
        // await markAchievementSeen(studentId, currentCelebration.id);
      } catch (error) {
        console.error('Failed to mark achievement as seen:', error);
      }
      
      setCurrentCelebration(null);
    }
  };

  const completionRate = Math.round(
    (studentStats.achievements_unlocked / studentStats.achievements_total) * 100
  );

  return (
    <div className="w-full">
      {/* Achievement Summary Card */}
      <div 
        className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-4 cursor-pointer hover:shadow-md transition-all duration-200"
        onClick={() => setIsExpanded(!isExpanded)}
      >
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
              <div className="text-lg font-bold text-purple-600">{completionRate}%</div>
              <div className="text-xs text-gray-600">Completado</div>
            </div>
            <div className="ml-2">
              {isExpanded ? (
                <svg className="w-5 h-5 text-gray-500 transform transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                </svg>
              ) : (
                <svg className="w-5 h-5 text-gray-500 transform transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              )}
            </div>
          </div>
        </div>
        
        {/* Progress Bar */}
        <div className="mt-3">
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${completionRate}%` }}
            />
          </div>
        </div>
      </div>

      {/* Expanded Achievement Dashboard */}
      {isExpanded && (
        <div className="mt-4 transition-all duration-300 ease-in-out">
          <AchievementDashboard 
            achievements={achievements}
            studentStats={studentStats}
          />
        </div>
      )}

      {/* Achievement Celebration Modal */}
      {currentCelebration && (
        <AchievementCelebration
          achievement={currentCelebration}
          onClose={handleCelebrationClose}
          autoCloseDelay={5000}
        />
      )}
    </div>
  );
}
