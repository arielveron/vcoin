'use server'

import { AchievementEngine } from '@/services/achievement-engine';
import { InvestmentRepository } from '@/repos/investment-repo';
import { withAdminAuth } from '@/utils/server-actions';

const achievementEngine = new AchievementEngine();
const investmentRepo = new InvestmentRepository();

export const checkStudentAchievements = withAdminAuth(async (studentId: number) => {
  try {
    // Get student investments
    const investments = await investmentRepo.findByStudentId(studentId);
    
    // Calculate metrics manually to see what's happening
    const categoryIdCounts: Record<number, number> = {};
    
    for (const inv of investments) {
      if (inv.category_id) {
        categoryIdCounts[inv.category_id] = (categoryIdCounts[inv.category_id] || 0) + 1;
      }
    }
    
    const metrics = {
      investment_count: investments.length,
      total_invested: investments.reduce((sum, inv) => sum + inv.monto, 0),
      categoryIdCounts,
      // Add the formatted metrics that the engine uses
      ...Object.fromEntries(
        Object.entries(categoryIdCounts).map(([id, count]) => [`category_${id}_count`, count])
      )
    };

    // Check achievements
    const unlockedAchievements = await achievementEngine.checkAchievementsForStudent(studentId);
    
    return {
      success: true,
      data: {
        studentId,
        investments: investments.length,
        metrics,
        unlockedAchievements
      }
    };
  } catch (error) {
    console.error('Debug error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}, 'debug student achievements');
