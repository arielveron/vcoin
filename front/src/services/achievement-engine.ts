import { AchievementRepository } from '@/repos/achievement-repo';
import { InvestmentRepository } from '@/repos/investment-repo';
import { Achievement, Investment } from '@/types/database';
import { differenceInDays } from 'date-fns';

export class AchievementEngine {
  private achievementRepo: AchievementRepository;
  private investmentRepo: InvestmentRepository;

  constructor() {
    this.achievementRepo = new AchievementRepository();
    this.investmentRepo = new InvestmentRepository();
  }

  // Main method to check achievements after an investment is created
  async checkAchievementsForStudent(studentId: number, investmentId?: number): Promise<Achievement[]> {
    try {
      // Get all automatic achievements
      const allAchievements = await this.achievementRepo.findAll(true);
      const automaticAchievements = allAchievements.filter(a => a.trigger_type === 'automatic');
      
      const unlockedAchievements: Achievement[] = [];
      
      // Calculate student metrics
      const metrics = await this.calculateStudentMetrics(studentId);
      
      // Check each achievement
      for (const achievement of automaticAchievements) {
        if (!achievement.trigger_config) continue;
        
        const isUnlocked = await this.checkAchievementCondition(
          studentId,
          achievement,
          metrics
        );
        
        if (isUnlocked) {
          // Check if already unlocked
          const existingUnlock = await this.achievementRepo.isAchievementUnlocked(studentId, achievement.id);
          if (!existingUnlock) {
            await this.achievementRepo.unlockAchievement(studentId, achievement.id, {
              triggerValue: metrics[achievement.trigger_config.metric],
              triggeredBy: 'investment',
              investmentId
            });
            unlockedAchievements.push(achievement);
          }
        }
        
        // Update progress for progressive achievements
        if (achievement.trigger_config.metric && metrics[achievement.trigger_config.metric] !== undefined) {
          await this.achievementRepo.updateProgress(
            studentId,
            achievement.id,
            metrics[achievement.trigger_config.metric]
          );
        }
      }
      
      return unlockedAchievements;
    } catch (error) {
      console.error('Error checking achievements:', error);
      return [];
    }
  }

  private async calculateStudentMetrics(studentId: number): Promise<Record<string, number>> {
    const investments = await this.investmentRepo.findByStudentId(studentId);
    
    // Calculate total invested
    const totalInvested = investments.reduce((sum, inv) => sum + inv.monto, 0);
    
    // Calculate investment count
    const investmentCount = investments.length;
    
    // Calculate streak days
    const streakDays = this.calculateStreakDays(investments);
    
    // Calculate category counts by category_id
    const categoryIdCounts: Record<number, number> = {};
    
    for (const inv of investments) {
      if (inv.category_id) {
        categoryIdCounts[inv.category_id] = (categoryIdCounts[inv.category_id] || 0) + 1;
      }
    }
    
    return {
      investment_count: investmentCount,
      total_invested: totalInvested,
      streak_days: streakDays,
      ...Object.fromEntries(
        Object.entries(categoryIdCounts).map(([id, count]) => [`category_${id}_count`, count])
      )
    };
  }

  private calculateStreakDays(investments: Investment[]): number {
    if (investments.length === 0) return 0;
    
    // Sort investments by date (newest first)
    const sortedInvestments = investments
      .sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime());
    
    // Get unique dates
    const uniqueDates = Array.from(
      new Set(sortedInvestments.map(inv => new Date(inv.fecha).toDateString()))
    ).map(dateStr => new Date(dateStr));
    
    // Sort dates (newest first)
    uniqueDates.sort((a, b) => b.getTime() - a.getTime());
    
    if (uniqueDates.length === 0) return 0;
    
    let streakDays = 1;
    const today = new Date();
    
    // Check if the streak is current (latest investment is today or yesterday)
    const latestDate = uniqueDates[0];
    const daysSinceLatest = differenceInDays(today, latestDate);
    
    if (daysSinceLatest > 1) {
      // Streak is broken if more than 1 day gap
      return 0;
    }
    
    // Count consecutive days
    for (let i = 1; i < uniqueDates.length; i++) {
      const currentDate = uniqueDates[i];
      const previousDate = uniqueDates[i - 1];
      const daysDiff = differenceInDays(previousDate, currentDate);
      
      if (daysDiff === 1) {
        streakDays++;
      } else {
        break;
      }
    }
    
    return streakDays;
  }

  private async checkAchievementCondition(
    studentId: number,
    achievement: Achievement,
    metrics: Record<string, number>
  ): Promise<boolean> {
    if (!achievement.trigger_config) return false;
    
    const { metric, operator, value, category_id } = achievement.trigger_config;
    
    let currentValue: number;
    
    // Get the current value based on metric type
    switch (metric) {
      case 'category_count':
        if (category_id) {
          currentValue = metrics[`category_${category_id}_count`] || 0;
        } else {
          return false;
        }
        break;
      default:
        currentValue = metrics[metric] || 0;
        break;
    }
    
    // Check condition based on operator
    switch (operator) {
      case '>=':
        return currentValue >= value;
      case '>':
        return currentValue > value;
      case '=':
        return currentValue === value;
      case '<=':
        return currentValue <= value;
      case '<':
        return currentValue < value;
      default:
        return false;
    }
  }

  // Manual achievement unlocking (for admin use)
  async unlockManualAchievement(
    studentId: number, 
    achievementId: number, 
    adminId?: number
  ): Promise<Achievement | null> {
    try {
      const achievement = await this.achievementRepo.findById(achievementId);
      
      if (!achievement || achievement.trigger_type !== 'manual') {
        return null;
      }
      
      // Check if already unlocked
      const existingUnlock = await this.achievementRepo.isAchievementUnlocked(studentId, achievementId);
      if (existingUnlock) {
        return achievement;
      }
      
      const metadata = {
        triggeredBy: 'manual',
        adminId: adminId || null,
        timestamp: new Date().toISOString()
      };
      
      await this.achievementRepo.unlockAchievement(studentId, achievementId, metadata);
      return achievement;
    } catch (error) {
      console.error('Error unlocking manual achievement:', error);
      return null;
    }
  }

  // Get achievement statistics for leaderboard
  async getClassLeaderboard(): Promise<{
    student_id: number;
    student_name: string;
    total_points: number;
    achievements_count: number;
    rank: number;
  }[]> {
    // This would be implemented with a proper query joining students and achievements
    // For now, returning empty array as it's not in the immediate scope
    return [];
  }
}
