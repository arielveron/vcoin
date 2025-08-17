'use client';

import { useState, useEffect } from 'react';
import AchievementCelebration from '@/components/achievement-celebration';
import { Achievement } from '@/types/database';
import { sortAchievements } from '@/utils/achievement-sorting';
import { markAchievementSeen } from '@/actions/student-actions';

interface DashboardAchievementCelebrationsProps {
  unseenAchievements: Achievement[]; // Already personalized achievements
}

export default function DashboardAchievementCelebrations({ 
  unseenAchievements
}: DashboardAchievementCelebrationsProps) {
  const [currentCelebration, setCurrentCelebration] = useState<Achievement | null>(null);
  const [celebrationQueue, setCelebrationQueue] = useState<Achievement[]>([]);

  // Initialize and update celebration queue with already personalized achievements
  useEffect(() => {
    if (unseenAchievements.length > 0) {
      setCelebrationQueue(unseenAchievements);
    }
  }, [unseenAchievements]);

  // Show celebrations for unseen achievements
  useEffect(() => {
    if (celebrationQueue.length > 0 && !currentCelebration) {
      // Sort celebrations by category and then by points (highest first)
      const sortedQueue = sortAchievements(celebrationQueue);

      const nextAchievement = sortedQueue[0];
      setCurrentCelebration(nextAchievement);
      setCelebrationQueue(sortedQueue.slice(1));
    }
  }, [celebrationQueue, currentCelebration]);

  const handleCelebrationClose = async () => {
    if (currentCelebration) {
      // Mark achievement as seen
      try {
        await markAchievementSeen(currentCelebration.id);
      } catch (error) {
        console.error("Failed to mark achievement as seen:", error);
      }

      setCurrentCelebration(null);
    }
  };

  return (
    <>
      {/* Achievement Celebration Modal */}
      {currentCelebration && (
        <AchievementCelebration
          achievement={currentCelebration}
          onClose={handleCelebrationClose}
          autoCloseDelay={0} // Disable auto-close, require manual interaction
        />
      )}
    </>
  );
}
