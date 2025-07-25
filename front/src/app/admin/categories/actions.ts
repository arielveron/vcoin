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
  const sortOrder = parseFormNumber(formData, 'sort_order') || 0;
  const isActive = formData.get('is_active') === 'on';

  const categoryData: CreateInvestmentCategoryRequest = {
    name,
    level,
    text_style: {
      fontSize,
      fontWeight,
      textColor
    },
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
  const sortOrder = parseFormNumber(formData, 'sort_order') || 0;
  const isActive = formData.get('is_active') === 'on';

  const categoryData: Partial<CreateInvestmentCategoryRequest> = {};
  
  if (name) categoryData.name = name;
  if (level) categoryData.level = level;
  if (fontSize || fontWeight || textColor) {
    categoryData.text_style = {
      fontSize,
      fontWeight,
      textColor
    };
  }
  categoryData.is_active = isActive;
  categoryData.sort_order = sortOrder;

  return await adminService.updateCategory(id, categoryData);
}, 'update category');

export const deleteCategory = withAdminAuth(async (id: number) => {
  return await adminService.deleteCategory(id);
}, 'delete category');
