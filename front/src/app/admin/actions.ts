'use server'

import { withAdminAuth } from '@/utils/server-actions';
import { AchievementBackgroundProcessor } from '@/services/achievement-background-processor';

export const processAchievements = withAdminAuth(async () => {
  const processor = new AchievementBackgroundProcessor();
  await processor.processPeriodicAchievements();
  
  // Return data in format expected by interface
  return { processed: 1 }; // This could be enhanced to return actual count
}, 'process achievements');
