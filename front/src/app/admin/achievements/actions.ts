'use server'

import { withAdminAuth, parseFormNumber, validateRequired } from '@/utils/server-actions';
import { AchievementEngine } from '@/services/achievement-engine';
import { AchievementBackgroundProcessor } from '@/services/achievement-background-processor';
import { AdminService } from '@/services/admin-service';
import { CreateAchievementRequest } from '@/types/database';
import type { DeleteResult, OperationResult } from '@/utils/admin-server-action-types';

const adminService = new AdminService();

export const unlockManualAchievement = withAdminAuth(async (formData: FormData): Promise<OperationResult> => {
  const studentId = parseFormNumber(formData, 'studentId');
  const achievementId = parseFormNumber(formData, 'achievementId');
  
  const achievementEngine = new AchievementEngine();
  
  const result = await achievementEngine.unlockManualAchievement(studentId, achievementId);
  
  if (!result) {
    throw new Error('Failed to award achievement');
  }
  
  return {
    success: true,
    message: 'Achievement unlocked successfully'
  };
}, 'unlock manual achievement');

export const revokeManualAchievement = withAdminAuth(async (formData: FormData) => {
  const studentId = parseFormNumber(formData, 'studentId');
  const achievementId = parseFormNumber(formData, 'achievementId');
  
  // Revoke the achievement by removing it from student_achievements
  const result = await adminService.revokeAchievement(studentId, achievementId);
  
  if (!result) {
    throw new Error('Failed to revoke achievement');
  }
  
  return { success: true, message: 'Achievement revoked successfully' };
}, 'revoke manual achievement');

export const createAchievement = withAdminAuth(async (formData: FormData) => {
  const missing = validateRequired(formData, ['name', 'description', 'category', 'rarity', 'trigger_type', 'icon_name', 'icon_library']);
  if (missing.length > 0) {
    throw new Error(`Missing required fields: ${missing.join(', ')}`);
  }

  const name = formData.get('name') as string;
  const description = formData.get('description') as string;
  const category = formData.get('category') as 'academic' | 'consistency' | 'milestone' | 'special';
  const rarity = formData.get('rarity') as 'common' | 'rare' | 'epic' | 'legendary';
  const trigger_type = formData.get('trigger_type') as 'automatic' | 'manual';
  const points = parseFormNumber(formData, 'points') || 0;
  const sort_order = parseFormNumber(formData, 'sort_order') || 0;
  const is_active = formData.get('is_active') === 'on'; // Checkbox input

  // Icon configuration
  const icon_config = {
    name: formData.get('icon_name') as string,
    library: formData.get('icon_library') as 'lucide' | 'heroicons-solid' | 'heroicons-outline' | 'tabler' | 'phosphor',
    size: parseFormNumber(formData, 'icon_size') || 24,
    color: formData.get('icon_color') as string || '#10B981',
    animationClass: formData.get('icon_animation') as string || undefined
  };

  // Trigger configuration (only for automatic achievements)
  let trigger_config = null;
  if (trigger_type === 'automatic') {
    const metric = formData.get('trigger_metric') as 'investment_count' | 'total_invested' | 'streak_days' | 'category_count';
    const operator = formData.get('trigger_operator') as '>' | '>=' | '=' | '<' | '<=';
    const value = parseFormNumber(formData, 'trigger_value');
    
    if (metric && operator && value !== undefined) {
      trigger_config = {
        metric,
        operator,
        value,
        category_name: formData.get('trigger_category_name') as string || undefined
      };
    }
  }

  const achievementData: CreateAchievementRequest = {
    name,
    description,
    category,
    rarity,
    icon_config,
    trigger_type,
    trigger_config,
    points,
    sort_order,
    is_active
  };

  return await adminService.createAchievement(achievementData);
}, 'create achievement');

export const updateAchievement = withAdminAuth(async (formData: FormData) => {
  const id = parseFormNumber(formData, 'id');
  const missing = validateRequired(formData, ['name', 'description', 'category', 'rarity', 'trigger_type']);
  if (missing.length > 0) {
    throw new Error(`Missing required fields: ${missing.join(', ')}`);
  }

  const name = formData.get('name') as string;
  const description = formData.get('description') as string;
  const category = formData.get('category') as 'academic' | 'consistency' | 'milestone' | 'special';
  const rarity = formData.get('rarity') as 'common' | 'rare' | 'epic' | 'legendary';
  const trigger_type = formData.get('trigger_type') as 'automatic' | 'manual';
  const points = parseFormNumber(formData, 'points') || 0;
  const sort_order = parseFormNumber(formData, 'sort_order') || 0;
  const is_active = formData.get('is_active') === 'on'; // Checkbox input

  // Icon configuration
  const icon_config = {
    name: formData.get('icon_name') as string,
    library: formData.get('icon_library') as 'lucide' | 'heroicons-solid' | 'heroicons-outline' | 'tabler' | 'phosphor',
    size: parseFormNumber(formData, 'icon_size') || 24,
    color: formData.get('icon_color') as string || '#10B981',
    animationClass: formData.get('icon_animation') as string || undefined
  };

  // Trigger configuration
  let trigger_config = null;
  if (trigger_type === 'automatic') {
    const metric = formData.get('trigger_metric') as 'investment_count' | 'total_invested' | 'streak_days' | 'category_count';
    const operator = formData.get('trigger_operator') as '>' | '>=' | '=' | '<' | '<=';
    const value = parseFormNumber(formData, 'trigger_value');
    
    if (metric && operator && value !== undefined) {
      trigger_config = {
        metric,
        operator,
        value,
        category_name: formData.get('trigger_category_name') as string || undefined
      };
    }
  }

  const updateData = {
    name,
    description,
    category,
    rarity,
    icon_config,
    trigger_type,
    trigger_config,
    points,
    sort_order,
    is_active
  };

  const result = await adminService.updateAchievement(id, updateData);
  if (!result) {
    throw new Error('Failed to update achievement');
  }
  return result;
}, 'update achievement');

export const deleteAchievement = withAdminAuth(async (formData: FormData): Promise<DeleteResult> => {
  const id = parseFormNumber(formData, 'id');
  const success = await adminService.deleteAchievement(id);
  
  if (!success) {
    throw new Error('Failed to delete achievement');
  }
  
  return {
    success: true,
    message: 'Achievement deleted successfully',
    deletedId: id
  };
}, 'delete achievement');

export const getStudentAchievements = withAdminAuth(async (studentId: number) => {
  return await adminService.getStudentAchievements(studentId);
}, 'get student achievements');

export const processAchievements = withAdminAuth(async () => {
  const processor = new AchievementBackgroundProcessor();
  await processor.processPeriodicAchievements();
  
  // Return data in format expected by interface
  return { processed: 1 }; // This could be enhanced to return actual count
}, 'process achievements');