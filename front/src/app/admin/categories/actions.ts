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
  const sortOrder = parseFormNumber(formData, 'sort_order') || 0;
  const isActive = formData.get('is_active') === 'true';

  // Parse JSON data for complex objects
  const textStyleJson = formData.get('text_style') as string;
  const iconConfigJson = formData.get('icon_config') as string;

  let textStyle = {
    fontSize: "text-sm",
    fontWeight: "font-normal", 
    textColor: "text-gray-900"
  };
  let iconConfig = null;

  try {
    if (textStyleJson) {
      textStyle = JSON.parse(textStyleJson);
    }
  } catch (error) {
    console.error('Error parsing text_style JSON:', error);
  }

  try {
    if (iconConfigJson) {
      const parsedIconConfig = JSON.parse(iconConfigJson);
      // Only set icon config if it has valid data
      if (parsedIconConfig.name && parsedIconConfig.library) {
        iconConfig = parsedIconConfig;
      }
    }
  } catch (error) {
    console.error('Error parsing icon_config JSON:', error);
  }

  const categoryData: CreateInvestmentCategoryRequest = {
    name,
    level,
    text_style: textStyle,
    icon_config: iconConfig,
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
  const sortOrder = parseFormNumber(formData, 'sort_order') || 0;
  const isActive = formData.get('is_active') === 'true';

  // Parse JSON data for complex objects
  const textStyleJson = formData.get('text_style') as string;
  const iconConfigJson = formData.get('icon_config') as string;

  let textStyle = null;
  let iconConfig = null;

  try {
    if (textStyleJson) {
      textStyle = JSON.parse(textStyleJson);
    }
  } catch (error) {
    console.error('Error parsing text_style JSON:', error);
  }

  try {
    if (iconConfigJson) {
      const parsedIconConfig = JSON.parse(iconConfigJson);
      // Only set icon config if it has valid data
      if (parsedIconConfig.name && parsedIconConfig.library) {
        iconConfig = parsedIconConfig;
      }
    }
  } catch (error) {
    console.error('Error parsing icon_config JSON:', error);
  }

  const categoryData: Partial<CreateInvestmentCategoryRequest> = {
    name,
    level,
    text_style: textStyle,
    icon_config: iconConfig,
    is_active: isActive,
    sort_order: sortOrder
  };

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
