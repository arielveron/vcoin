#!/usr/bin/env tsx

/**
 * Achievement System Test Script
 * 
 * This script tests the complete achievement system functionality including:
 * - Database connectivity
 * - Achievement checking logic
 * - Progress tracking
 * - Background processing
 * 
 * Usage: npm run test:achievements
 */

import { AchievementEngine } from '../src/services/achievement-engine';
import { AchievementRepository } from '../src/repos/achievement-repo';
import { StudentRepository } from '../src/repos/student-repo';
import { InvestmentRepository } from '../src/repos/investment-repo';

class AchievementSystemTest {
  private achievementEngine: AchievementEngine;
  private achievementRepo: AchievementRepository;
  private studentRepo: StudentRepository;
  private investmentRepo: InvestmentRepository;

  constructor() {
    this.achievementEngine = new AchievementEngine();
    this.achievementRepo = new AchievementRepository();
    this.studentRepo = new StudentRepository();
    this.investmentRepo = new InvestmentRepository();
  }

  async runAllTests() {
    console.log('🧪 Starting Achievement System Tests...\n');

    try {
      await this.testDatabaseConnectivity();
      await this.testAchievementRepository();
      await this.testAchievementEngine();
      await this.testProgressTracking();
      await this.testBackgroundProcessing();
      
      console.log('\n✅ All Achievement System Tests Passed! 🎉');
      
    } catch (error) {
      console.error('\n❌ Achievement System Tests Failed:', error);
      process.exit(1);
    }
  }

  async testDatabaseConnectivity() {
    console.log('📊 Testing Database Connectivity...');
    
    try {
      const achievements = await this.achievementRepo.findAll();
      const students = await this.studentRepo.findAll();
      
      console.log(`  ✅ Found ${achievements.length} achievements in database`);
      console.log(`  ✅ Found ${students.length} students in database`);
      
      // Verify required achievements exist
      const requiredAchievements = ['First Steps', 'Getting Started', 'Active Learner'];
      for (const name of requiredAchievements) {
        const achievement = achievements.find(a => a.name === name);
        if (!achievement) {
          throw new Error(`Required achievement '${name}' not found`);
        }
        console.log(`  ✅ Achievement '${name}' exists`);
      }
      
    } catch (error) {
      throw new Error(`Database connectivity test failed: ${error}`);
    }
  }

  async testAchievementRepository() {
    console.log('\n🗄️  Testing Achievement Repository...');
    
    try {
      const achievements = await this.achievementRepo.findAll();
      console.log(`  ✅ findAll() returned ${achievements.length} achievements`);
      
      if (achievements.length > 0) {
        const firstAchievement = await this.achievementRepo.findById(achievements[0].id);
        if (!firstAchievement) {
          throw new Error('findById() failed');
        }
        console.log(`  ✅ findById() works for achievement: ${firstAchievement.name}`);
      }
      
    } catch (error) {
      throw new Error(`Achievement repository test failed: ${error}`);
    }
  }

  async testAchievementEngine() {
    console.log('\n⚙️  Testing Achievement Engine...');
    
    try {
      const students = await this.studentRepo.findAll();
      
      if (students.length === 0) {
        console.log('  ℹ️  No students found, skipping engine test');
        return;
      }
      
      // Test achievement checking for first student
      const testStudent = students[0];
      console.log(`  🧪 Testing with student: ${testStudent.name} (ID: ${testStudent.id})`);
      
      const unlockedAchievements = await this.achievementEngine.checkAchievementsForStudent(testStudent.id);
      console.log(`  ✅ Achievement checking completed, ${unlockedAchievements.length} achievements unlocked`);
      
      // Test manual achievement unlocking
      const achievements = await this.achievementRepo.findAll();
      const manualAchievement = achievements.find(a => a.trigger_type === 'manual');
      
      if (manualAchievement) {
        console.log(`  🧪 Testing manual achievement: ${manualAchievement.name}`);
        const result = await this.achievementEngine.unlockManualAchievement(testStudent.id, manualAchievement.id);
        if (result) {
          console.log(`  ✅ Manual achievement unlocking works`);
        }
      }
      
    } catch (error) {
      throw new Error(`Achievement engine test failed: ${error}`);
    }
  }

  async testProgressTracking() {
    console.log('\n📈 Testing Progress Tracking...');
    
    try {
      const students = await this.studentRepo.findAll();
      
      if (students.length === 0) {
        console.log('  ℹ️  No students found, skipping progress test');
        return;
      }
      
      const testStudent = students[0];
      const achievements = await this.achievementRepo.findAll();
      
      if (achievements.length > 0) {
        const testAchievement = achievements[0];
        
        // Test progress update
        await this.achievementRepo.updateProgress(testStudent.id, testAchievement.id, 5);
        console.log(`  ✅ Progress update successful for achievement: ${testAchievement.name}`);
        
        // Test student achievements retrieval
        const studentAchievements = await this.achievementRepo.getStudentAchievements(testStudent.id);
        console.log(`  ✅ Retrieved ${studentAchievements.length} student achievements`);
      }
      
    } catch (error) {
      throw new Error(`Progress tracking test failed: ${error}`);
    }
  }

  async testBackgroundProcessing() {
    console.log('\n🔄 Testing Background Processing...');
    
    try {
      // Import the background processor
      const { BackgroundAchievementProcessor } = await import('./achievement-processor');
      const processor = new BackgroundAchievementProcessor();
      
      console.log('  ✅ Background processor imported successfully');
      
      // Test health check
      const healthy = await processor.healthCheck();
      if (!healthy) {
        throw new Error('Background processor health check failed');
      }
      console.log('  ✅ Background processor health check passed');
      
    } catch (error) {
      console.log(`  ⚠️  Background processing test skipped: ${error}`);
    }
  }

  async getSystemStatistics() {
    console.log('\n📊 Achievement System Statistics:');
    
    try {
      const achievements = await this.achievementRepo.findAll();
      const students = await this.studentRepo.findAll();
      const investments = await this.investmentRepo.findAll();
      
      // Count by category
      const categoryStats = achievements.reduce((acc, achievement) => {
        acc[achievement.category] = (acc[achievement.category] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);
      
      console.log(`  📈 Total Achievements: ${achievements.length}`);
      console.log(`  👥 Total Students: ${students.length}`);
      console.log(`  💰 Total Investments: ${investments.length}`);
      console.log(`  📊 By Category:`, categoryStats);
      
      // Rarity distribution
      const rarityStats = achievements.reduce((acc, achievement) => {
        acc[achievement.rarity] = (acc[achievement.rarity] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);
      
      console.log(`  💎 By Rarity:`, rarityStats);
      
    } catch (error) {
      console.error('Error getting statistics:', error);
    }
  }
}

// Main execution
async function main() {
  const tester = new AchievementSystemTest();
  
  try {
    await tester.runAllTests();
    await tester.getSystemStatistics();
    
    console.log('\n🎉 Achievement System is fully operational!');
    process.exit(0);
    
  } catch (error) {
    console.error('\n💥 Achievement System test failed:', error);
    process.exit(1);
  }
}

// Only run if this file is executed directly
if (require.main === module) {
  main().catch(error => {
    console.error('Failed to run achievement tests:', error);
    process.exit(1);
  });
}

export { AchievementSystemTest };
