#!/usr/bin/env tsx

/**
 * Achievement Background Processor
 * 
 * This script handles time-sensitive achievements that need to be processed
 * in the background, separate from the main application flow.
 * 
 * Usage:
 *   npm run achievement:check    - Process all achievements for all students (5min cron)
 *   npm run achievement:daily    - Process time-sensitive daily achievements (daily cron)
 *   npm run achievement:weekly   - Process weekly achievements and cleanup (weekly cron)
 */

import { AchievementEngine } from '../src/services/achievement-engine';
import { StudentRepository } from '../src/repos/student-repo';

class BackgroundAchievementProcessor {
  private achievementEngine: AchievementEngine;
  private studentRepo: StudentRepository;

  constructor() {
    this.achievementEngine = new AchievementEngine();
    this.studentRepo = new StudentRepository();
  }

  async processAllStudents() {
    const startTime = Date.now();
    console.log(`🎯 Starting background achievement processing at ${new Date().toISOString()}`);

    try {
      // Get all active students
      const students = await this.studentRepo.findAll();
      console.log(`📊 Processing achievements for ${students.length} students`);

      let processedCount = 0;
      let errorCount = 0;

      // Process each student
      for (const student of students) {
        try {
          await this.achievementEngine.checkAchievementsForStudent(student.id);
          processedCount++;
        } catch (error) {
          console.error(`❌ Error processing student ${student.id}:`, error);
          errorCount++;
        }
      }

      const duration = Date.now() - startTime;
      console.log(`✅ Background processing completed in ${duration}ms`);
      console.log(`📈 Processed: ${processedCount}, Errors: ${errorCount}`);

    } catch (error) {
      console.error('💥 Fatal error in background achievement processing:', error);
      process.exit(1);
    }
  }

  async processTimeBasedAchievements() {
    const startTime = Date.now();
    console.log(`⏰ [${new Date().toISOString()}] Starting time-based achievement processing...`);

    try {
      // Focus on time-sensitive achievements like streaks
      const students = await this.studentRepo.findAll();
      let updatedCount = 0;
      
      for (const student of students) {
        try {
          // Check specifically for streak-based achievements
          const unlockedAchievements = await this.achievementEngine.checkAchievementsForStudent(student.id);
          
          // Log only streak-related updates
          const streakAchievements = unlockedAchievements.filter(a => 
            a.name.toLowerCase().includes('streak') || 
            a.name.toLowerCase().includes('roll') ||
            a.name.toLowerCase().includes('dedicated')
          );
          
          if (streakAchievements.length > 0) {
            console.log(`🔥 Student ${student.name} (${student.id}) achieved streak milestone: ${streakAchievements.map(a => a.name).join(', ')}`);
            updatedCount++;
          }
          
        } catch (error) {
          console.error(`❌ Error processing time-based achievements for student ${student.id}:`, error);
        }
      }
      
      const duration = Date.now() - startTime;
      console.log(`✅ [${new Date().toISOString()}] Time-based processing completed`);
      console.log(`🎯 Updated: ${updatedCount} students with streak achievements, Duration: ${duration}ms`);

    } catch (error) {
      console.error(`❌ [${new Date().toISOString()}] Error in time-based achievement processing:`, error);
      process.exit(1);
    }
  }

  async generateWeeklySummary() {
    const startTime = Date.now();
    console.log(`📊 [${new Date().toISOString()}] Generating weekly achievement summary...`);
    
    try {
      // Get basic statistics
      const students = await this.studentRepo.findAll();
      
      console.log(`📈 Weekly summary: ${students.length} total students processed`);
      console.log(`✅ [${new Date().toISOString()}] Weekly summary completed`);
      
      const duration = Date.now() - startTime;
      console.log(`⏱️  Duration: ${duration}ms`);
      
    } catch (error) {
      console.error(`❌ [${new Date().toISOString()}] Error generating weekly summary:`, error);
      process.exit(1);
    }
  }

  async healthCheck() {
    try {
      console.log(`🏥 [${new Date().toISOString()}] Running achievement system health check...`);
      
      // Test database connections
      const students = await this.studentRepo.findAll();
      console.log(`✅ Health check passed - ${students.length} students accessible`);
      return true;
    } catch (error) {
      console.error(`❌ Health check failed:`, error);
      return false;
    }
  }
}

// Main execution
async function main() {
  const processor = new BackgroundAchievementProcessor();
  const command = process.argv[2] || 'all';
  
  console.log(`🚀 [${new Date().toISOString()}] Achievement processor starting with command: ${command}`);
  
  try {
    switch (command) {
      case 'all':
        await processor.processAllStudents();
        break;
      
      case 'time':
      case 'daily':
        await processor.processTimeBasedAchievements();
        break;
      
      case 'weekly':
        await processor.generateWeeklySummary();
        break;
      
      case 'health':
        const healthy = await processor.healthCheck();
        process.exit(healthy ? 0 : 1);
        break;
      
      default:
        console.error(`❌ Unknown command: ${command}`);
        console.log('Available commands: all, time, daily, weekly, health');
        process.exit(1);
    }
    
    console.log(`🏁 [${new Date().toISOString()}] Achievement processor finished successfully`);
    
  } catch (error) {
    console.error(`💥 [${new Date().toISOString()}] Achievement processor crashed:`, error);
    process.exit(1);
  }
}

// Handle process termination gracefully
process.on('SIGTERM', () => {
  console.log('🛑 Received SIGTERM, shutting down gracefully...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('🛑 Received SIGINT, shutting down gracefully...');
  process.exit(0);
});

// Run the processor
if (require.main === module) {
  main().catch((error) => {
    console.error('💥 Unhandled error in achievement processor:', error);
    process.exit(1);
  });
}

export { BackgroundAchievementProcessor };
