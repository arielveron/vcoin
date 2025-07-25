'use server';

import { AdminService } from '@/services/admin-service';
import { CreateInvestmentCategoryRequest } from '@/types/database';
import { withAdminAuth, validateRequired, parseFormNumber } from '@/utils/server-actions';

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
  const isActive = formData.get('is_active') === 'on';

  // Handle icon data
  const iconName = formData.get('iconName') as string;
  const iconLibrary = formData.get('iconLibrary') as string;
  const iconSize = formData.get('iconSize') ? parseInt(formData.get('iconSize') as string) : 24;
  const iconColor = formData.get('iconColor') as string;
  const iconAnimation = formData.get('iconAnimation') as string;

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
      animationClass: iconAnimation || undefined
    } : null,
    is_active: isActive,
    sort_order: sortOrder
  };

  return await adminService.createCategory(categoryData);
}, 'create category');

export const updateCategory = withAdminAuth(async (id: number, formData: FormData) => {
  const name = formData.get('name') as string;
  const level = formData.get('level') as 'bronze' | 'silver' | 'gold' | 'platinum';
  const fontSize = formData.get('fontSize') as string;
  const fontWeight = formData.get('fontWeight') as string;
  const textColor = formData.get('textColor') as string;
  const effectClass = formData.get('effectClass') as string;
  const customCSS = formData.get('customCSS') as string;
  const sortOrder = parseFormNumber(formData, 'sort_order') || 0;
  const isActive = formData.get('is_active') === 'on';

  // Handle icon data
  const iconName = formData.get('iconName') as string;
  const iconLibrary = formData.get('iconLibrary') as string;
  const iconSize = formData.get('iconSize') ? parseInt(formData.get('iconSize') as string) : 24;
  const iconColor = formData.get('iconColor') as string;
  const iconAnimation = formData.get('iconAnimation') as string;

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
      animationClass: iconAnimation || undefined
    };
  } else {
    categoryData.icon_config = null;
  }
  
  categoryData.is_active = isActive;
  categoryData.sort_order = sortOrder;

  return await adminService.updateCategory(id, categoryData);
}, 'update category');

export const deleteCategory = withAdminAuth(async (id: number) => {
  return await adminService.deleteCategory(id);
}, 'delete category');
