'use server';

import { AdminService } from '@/services/admin-service';
import { CreateInvestmentCategoryRequest } from '@/types/database';
import { withAdminAuth, validateRequired, parseFormNumber } from '@/utils/server-actions';
import type { DeleteResult } from '@/utils/admin-server-action-types';

const adminService = new AdminService();

export const createCategory = withAdminAuth(async (formData: FormData) => {
  const missing = validateRequired(formData, ['name', 'level']);
  if (missing.length > 0) {
    throw new Error(`Missing required fields: ${missing.join(', ')}`);
  }

  const name = formData.get('name') as string;
  const level = formData.get('level') as 'bronze' | 'silver' | 'gold' | 'platinum';
  const fontSize = formData.get('fontSize') as string;
  const fontWeight = formData.get('fontWeight') as string;
  const textColor = formData.get('textColor') as string;
  const effectClass = formData.get('effectClass') as string;
  const customCSS = formData.get('customCSS') as string;
  const sortOrder = parseFormNumber(formData, 'sort_order') || 0;
  const isActive = formData.get('is_active') === 'true'; // Read from select (true/false strings)

  // Handle icon data
  const iconName = formData.get('iconName') as string;
  const iconLibrary = formData.get('iconLibrary') as string;
  const iconSize = formData.get('iconSize') ? parseInt(formData.get('iconSize') as string) : 24;
  const iconColor = formData.get('iconColor') as string;
  const iconBackgroundColor = formData.get('iconBackgroundColor') as string;
  const iconPadding = formData.get('iconPadding') ? parseInt(formData.get('iconPadding') as string) : 4;
  const iconAnimation = formData.get('iconAnimation') as string;
  const iconEffectClass = formData.get('iconEffectClass') as string;

  const categoryData: CreateInvestmentCategoryRequest = {
    name,
    level,
    text_style: {
      fontSize,
      fontWeight,
      textColor,
      effectClass: effectClass || undefined,
      customCSS: customCSS || undefined
    },
    icon_config: iconName && iconLibrary ? {
      name: iconName,
      library: iconLibrary as 'lucide' | 'heroicons-solid' | 'heroicons-outline' | 'tabler' | 'phosphor',
      size: iconSize,
      color: iconColor || undefined,
      backgroundColor: iconBackgroundColor || undefined,
      padding: iconPadding,
      animationClass: iconAnimation || undefined,
      effectClass: iconEffectClass || undefined
    } : null,
    is_active: isActive,
    sort_order: sortOrder
  };

  return await adminService.createCategory(categoryData);
}, 'create category');

export const updateCategory = withAdminAuth(async (formData: FormData) => {
  const missing = validateRequired(formData, ['id', 'name', 'level']);
  if (missing.length > 0) {
    throw new Error(`Missing required fields: ${missing.join(', ')}`);
  }

  const id = parseFormNumber(formData, 'id');
  if (!id) {
    throw new Error('Invalid category ID');
  }

  const name = formData.get('name') as string;
  const level = formData.get('level') as 'bronze' | 'silver' | 'gold' | 'platinum';
  const fontSize = formData.get('fontSize') as string;
  const fontWeight = formData.get('fontWeight') as string;
  const textColor = formData.get('textColor') as string;
  const effectClass = formData.get('effectClass') as string;
  const customCSS = formData.get('customCSS') as string;
  const sortOrder = parseFormNumber(formData, 'sort_order') || 0;
  const isActive = formData.get('is_active') === 'true'; // Read from select (true/false strings)

  // Handle icon data
  const iconName = formData.get('iconName') as string;
  const iconLibrary = formData.get('iconLibrary') as string;
  const iconSize = formData.get('iconSize') ? parseInt(formData.get('iconSize') as string) : 24;
  const iconColor = formData.get('iconColor') as string;
  const iconBackgroundColor = formData.get('iconBackgroundColor') as string;
  const iconPadding = formData.get('iconPadding') ? parseInt(formData.get('iconPadding') as string) : 4;
  const iconAnimation = formData.get('iconAnimation') as string;
  const iconEffectClass = formData.get('iconEffectClass') as string;

  const categoryData: Partial<CreateInvestmentCategoryRequest> = {};
  
  if (name) categoryData.name = name;
  if (level) categoryData.level = level;
  if (fontSize || fontWeight || textColor || effectClass || customCSS) {
    categoryData.text_style = {
      fontSize,
      fontWeight,
      textColor,
      effectClass: effectClass || undefined,
      customCSS: customCSS || undefined
    };
  }
  
  // Handle icon config
  if (iconName && iconLibrary) {
    categoryData.icon_config = {
      name: iconName,
      library: iconLibrary as 'lucide' | 'heroicons-solid' | 'heroicons-outline' | 'tabler' | 'phosphor',
      size: iconSize,
      color: iconColor || undefined,
      backgroundColor: iconBackgroundColor || undefined,
      padding: iconPadding,
      animationClass: iconAnimation || undefined,
      effectClass: iconEffectClass || undefined
    };
  } else {
    categoryData.icon_config = null;
  }
  
  categoryData.is_active = isActive;
  categoryData.sort_order = sortOrder;

  const result = await adminService.updateCategory(id, categoryData);
  if (!result) {
    throw new Error('Failed to update category');
  }
  return result;
}, 'update category');

export const deleteCategory = withAdminAuth(async (formData: FormData): Promise<DeleteResult> => {
  const missing = validateRequired(formData, ['id']);
  if (missing.length > 0) {
    throw new Error(`Missing required fields: ${missing.join(', ')}`);
  }

  const id = parseFormNumber(formData, 'id');
  if (!id) {
    throw new Error('Invalid category ID');
  }

  const success = await adminService.deleteCategory(id);
  
  if (!success) {
    throw new Error('Failed to delete category');
  }

  return {
    success: true,
    message: 'Category deleted successfully',
    deletedId: id
  };
}, 'delete category');
