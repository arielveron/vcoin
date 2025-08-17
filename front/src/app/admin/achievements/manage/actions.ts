'use server'

import { withAdminAuth, validateRequired, parseFormNumber } from '@/utils/server-actions';
import { AdminService } from '@/services/admin-service';
import { CreateAchievementRequest } from '@/types/database';

const adminService = new AdminService();

export const createAchievement = withAdminAuth(async (formData: FormData) => {
  const missing = validateRequired(formData, [
    'name', 'description', 'category', 'rarity', 'icon_name', 'icon_library', 'trigger_type', 'points'
  ]);
  if (missing.length > 0) {
    throw new Error(`Missing required fields: ${missing.join(', ')}`);
  }

  const name = formData.get('name') as string;
  const name_a = formData.get('name_a') as string || undefined;
  const name_o = formData.get('name_o') as string || undefined;
  const description = formData.get('description') as string;
  const category = formData.get('category') as 'academic' | 'consistency' | 'milestone' | 'special';
  const rarity = formData.get('rarity') as 'common' | 'rare' | 'epic' | 'legendary';
  const icon_name = formData.get('icon_name') as string;
  const icon_library = formData.get('icon_library') as 'lucide' | 'heroicons-solid' | 'tabler' | 'heroicons-outline' | 'phosphor';
  const icon_size = parseFormNumber(formData, 'icon_size') || 24;
  const icon_color = formData.get('icon_color') as string || '#10B981';
  const animation_class = formData.get('animation_class') as string;
  const trigger_type = formData.get('trigger_type') as 'automatic' | 'manual';
  const points = parseFormNumber(formData, 'points');
  const sort_order = parseFormNumber(formData, 'sort_order') || 0;
  const is_active = formData.get('is_active') === 'on';

  // Build icon config
  const icon_config = {
    name: icon_name,
    library: icon_library,
    size: icon_size,
    color: icon_color,
    ...(animation_class && { animationClass: animation_class })
  };

  // Build trigger config for automatic achievements
  let trigger_config = null;
  if (trigger_type === 'automatic') {
    const metric = formData.get('metric') as 'investment_count' | 'total_invested' | 'streak_days' | 'category_count';
    const operator = formData.get('operator') as '>' | '>=' | '=' | '<' | '<=';
    const value = formData.get('value') ? parseFormNumber(formData, 'value') : undefined;
    const category_id = formData.get('category_id') ? parseFormNumber(formData, 'category_id') : undefined;

    if (metric && operator && value !== undefined) {
      trigger_config = {
        metric,
        operator,
        value,
        ...(category_id && { category_id })
      };
    }
  }

  const achievementData: CreateAchievementRequest = {
    name,
    name_a,
    name_o,
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
  const missing = validateRequired(formData, ['id']);
  if (missing.length > 0) {
    throw new Error(`Missing required fields: ${missing.join(', ')}`);
  }

  const id = parseFormNumber(formData, 'id');
  const name = formData.get('name') as string;
  const name_a = formData.get('name_a') as string || undefined;
  const name_o = formData.get('name_o') as string || undefined;
  const description = formData.get('description') as string;
  const category = formData.get('category') as 'academic' | 'consistency' | 'milestone' | 'special';
  const rarity = formData.get('rarity') as 'common' | 'rare' | 'epic' | 'legendary';
  const icon_name = formData.get('icon_name') as string;
  const icon_library = formData.get('icon_library') as 'lucide' | 'heroicons-solid' | 'tabler' | 'heroicons-outline' | 'phosphor';
  const icon_size = parseFormNumber(formData, 'icon_size') || 24;
  const icon_color = formData.get('icon_color') as string || '#10B981';
  const animation_class = formData.get('animation_class') as string;
  const trigger_type = formData.get('trigger_type') as 'automatic' | 'manual';
  const points = parseFormNumber(formData, 'points');
  const sort_order = parseFormNumber(formData, 'sort_order') || 0;
  const is_active = formData.get('is_active') === 'on';

  // Build icon config
  const icon_config = {
    name: icon_name,
    library: icon_library,
    size: icon_size,
    color: icon_color,
    ...(animation_class && { animationClass: animation_class })
  };

  // Build trigger config for automatic achievements
  let trigger_config = null;
  if (trigger_type === 'automatic') {
    const metric = formData.get('metric') as 'investment_count' | 'total_invested' | 'streak_days' | 'category_count';
    const operator = formData.get('operator') as '>' | '>=' | '=' | '<' | '<=';
    const value = formData.get('value') ? parseFormNumber(formData, 'value') : undefined;
    const category_id = formData.get('category_id') ? parseFormNumber(formData, 'category_id') : undefined;

    if (metric && operator && value !== undefined) {
      trigger_config = {
        metric,
        operator,
        value,
        ...(category_id && { category_id })
      };
    }
  }

  const updateData: Partial<CreateAchievementRequest> = {
    name,
    name_a,
    name_o,
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

  return await adminService.updateAchievement(id, updateData);
}, 'update achievement');

export const deleteAchievement = withAdminAuth(async (formData: FormData) => {
  const missing = validateRequired(formData, ['id']);
  if (missing.length > 0) {
    throw new Error(`Missing required fields: ${missing.join(', ')}`);
  }

  const id = parseFormNumber(formData, 'id');
  const result = await adminService.deleteAchievement(id);
  
  if (!result) {
    throw new Error('Failed to delete achievement');
  }
  
  return { success: true, message: 'Achievement deleted successfully' };
}, 'delete achievement');
