# Phase 1: Investment Category Infrastructure

## Quick Context

**What:** Add categorization system for investments with levels (bronze/silver/gold/platinum)  
**Why:** Foundation for visual gamification - categories will define styles and icons  
**Dependencies:** None - this is the base layer

## Current State Checkpoint

```yaml
prerequisites_completed: []
files_modified: []
tests_passing: true
can_continue: true
```

## Implementation Steps

### Step 1: Database Schema (30 mins)

**Files to modify:**
- `/src/scripts/init-database.sql`
- `/src/scripts/setup-db.ts`

Add to init-database.sql after line 95 (after investments table):

```sql
-- Investment Categories table
-- Each category defines styling and icon configuration for investments
CREATE TABLE investment_categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    level VARCHAR(20) NOT NULL CHECK (level IN ('bronze', 'silver', 'gold', 'platinum')),
    text_style JSONB NOT NULL DEFAULT '{}',
    icon_config JSONB,
    is_active BOOLEAN DEFAULT true,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add category reference to investments
ALTER TABLE investments 
ADD COLUMN category_id INTEGER REFERENCES investment_categories(id) ON DELETE SET NULL;

-- Create index for performance
CREATE INDEX idx_investments_category_id ON investments(category_id);
CREATE INDEX idx_investment_categories_active ON investment_categories(is_active);
CREATE INDEX idx_investment_categories_sort ON investment_categories(sort_order);

-- Add trigger for updated_at
CREATE TRIGGER update_investment_categories_updated_at 
BEFORE UPDATE ON investment_categories 
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert default category
INSERT INTO investment_categories (name, level, text_style, sort_order) 
VALUES ('Standard', 'bronze', '{"fontSize": "text-sm", "fontWeight": "font-normal"}', 0);

-- Migrate existing investments to default category
UPDATE investments 
SET category_id = (SELECT id FROM investment_categories WHERE name = 'Standard')
WHERE category_id IS NULL;
```

**Verification:**
```bash
npm run setup
# Expected: "Database setup completed successfully!"
# Check: "Investment categories created: 1"
```

**STOP POINT 1 ✋**

- ✅ Database migrated successfully
- ✅ Default category created
- ✅ Existing investments linked to default category

### Step 2: TypeScript Types (20 mins)

**File:** `/src/types/database.ts`

Add after line 52 (after InterestRateChange interface):

```typescript
// Investment Category types
export interface InvestmentCategory {
  id: number;
  name: string;
  level: 'bronze' | 'silver' | 'gold' | 'platinum';
  text_style: {
    fontSize?: string;      // Tailwind classes: 'text-sm', 'text-lg', etc
    fontWeight?: string;    // 'font-normal', 'font-semibold', 'font-bold'
    fontStyle?: string;     // 'italic', 'not-italic'
    textColor?: string;     // 'text-red-600' or hex '#FF0000'
    effectClass?: string;   // Premium CSS class name
  };
  icon_config?: {
    name: string;           // Icon component name
    library: 'lucide' | 'heroicons' | 'tabler' | 'phosphor' | 'iconoir';
    size?: number;          // Size in pixels
    animationClass?: string; // 'animate-spin', 'animate-pulse', etc
    color?: string;         // Icon color
  } | null;
  is_active: boolean;
  sort_order: number;
  created_at: Date;
  updated_at: Date;
}

export interface CreateInvestmentCategoryRequest {
  name: string;
  level: 'bronze' | 'silver' | 'gold' | 'platinum';
  text_style?: InvestmentCategory['text_style'];
  icon_config?: InvestmentCategory['icon_config'];
  is_active?: boolean;
  sort_order?: number;
}

// Update Investment interface to include category
export interface InvestmentWithCategory extends Investment {
  category?: InvestmentCategory | null;
}
```

Update Investment-related types (around line 89):

```typescript
// Update CreateInvestmentRequest
export interface CreateInvestmentRequest {
  student_id: number;
  fecha: Date;
  monto: number;
  concepto: string;
  category_id?: number; // Add this line
}
```

**Verification:**
```bash
npm run build
# Expected: No TypeScript errors
```

**STOP POINT 2 ✋**

- ✅ Types added without errors
- ✅ Build passes

### Step 3: Repository Layer (30 mins)

**Create new file:** `/src/repos/investment-category-repo.ts`

```typescript
import { pool } from '@/config/database';
import { InvestmentCategory, CreateInvestmentCategoryRequest } from '@/types/database';

export class InvestmentCategoryRepository {
  async findAll(activeOnly = false): Promise<InvestmentCategory[]> {
    const client = await pool.connect();
    try {
      const whereClause = activeOnly ? 'WHERE is_active = true' : '';
      const result = await client.query(`
        SELECT id, name, level, text_style, icon_config, is_active, sort_order, created_at, updated_at
        FROM investment_categories
        ${whereClause}
        ORDER BY sort_order, name
      `);
      return result.rows.map(row => ({
        ...row,
        text_style: row.text_style || {},
        icon_config: row.icon_config || null
      }));
    } finally {
      client.release();
    }
  }

  async findById(id: number): Promise<InvestmentCategory | null> {
    const client = await pool.connect();
    try {
      const result = await client.query(`
        SELECT id, name, level, text_style, icon_config, is_active, sort_order, created_at, updated_at
        FROM investment_categories
        WHERE id = $1
      `, [id]);
      
      if (result.rows.length === 0) return null;
      
      const row = result.rows[0];
      return {
        ...row,
        text_style: row.text_style || {},
        icon_config: row.icon_config || null
      };
    } finally {
      client.release();
    }
  }

  async create(data: CreateInvestmentCategoryRequest): Promise<InvestmentCategory> {
    const client = await pool.connect();
    try {
      const result = await client.query(`
        INSERT INTO investment_categories (name, level, text_style, icon_config, is_active, sort_order)
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING id, name, level, text_style, icon_config, is_active, sort_order, created_at, updated_at
      `, [
        data.name,
        data.level,
        JSON.stringify(data.text_style || {}),
        data.icon_config ? JSON.stringify(data.icon_config) : null,
        data.is_active ?? true,
        data.sort_order ?? 0
      ]);
      
      const row = result.rows[0];
      return {
        ...row,
        text_style: row.text_style || {},
        icon_config: row.icon_config || null
      };
    } finally {
      client.release();
    }
  }

  async update(id: number, data: Partial<CreateInvestmentCategoryRequest>): Promise<InvestmentCategory | null> {
    const client = await pool.connect();
    try {
      const updates: string[] = [];
      const values: unknown[] = [];
      let paramCount = 1;

      if (data.name !== undefined) {
        updates.push(`name = $${paramCount++}`);
        values.push(data.name);
      }

      if (data.level !== undefined) {
        updates.push(`level = $${paramCount++}`);
        values.push(data.level);
      }

      if (data.text_style !== undefined) {
        updates.push(`text_style = $${paramCount++}`);
        values.push(JSON.stringify(data.text_style));
      }

      if (data.icon_config !== undefined) {
        updates.push(`icon_config = $${paramCount++}`);
        values.push(data.icon_config ? JSON.stringify(data.icon_config) : null);
      }

      if (data.is_active !== undefined) {
        updates.push(`is_active = $${paramCount++}`);
        values.push(data.is_active);
      }

      if (data.sort_order !== undefined) {
        updates.push(`sort_order = $${paramCount++}`);
        values.push(data.sort_order);
      }

      if (updates.length === 0) return this.findById(id);

      values.push(id);
      const result = await client.query(`
        UPDATE investment_categories
        SET ${updates.join(', ')}, updated_at = CURRENT_TIMESTAMP
        WHERE id = $${paramCount}
        RETURNING id, name, level, text_style, icon_config, is_active, sort_order, created_at, updated_at
      `, values);

      if (result.rows.length === 0) return null;
      
      const row = result.rows[0];
      return {
        ...row,
        text_style: row.text_style || {},
        icon_config: row.icon_config || null
      };
    } finally {
      client.release();
    }
  }

  async delete(id: number): Promise<boolean> {
    const client = await pool.connect();
    try {
      // Check if category is in use
      const checkResult = await client.query(
        'SELECT COUNT(*) as count FROM investments WHERE category_id = $1',
        [id]
      );
      
      if (parseInt(checkResult.rows[0].count) > 0) {
        throw new Error('Cannot delete category that is in use by investments');
      }

      const result = await client.query(
        'DELETE FROM investment_categories WHERE id = $1',
        [id]
      );
      
      return result.rowCount !== null && result.rowCount > 0;
    } finally {
      client.release();
    }
  }
}
```

**Update** `/src/repos/investment-repo.ts`

Add after line 5 (imports):

```typescript
import { InvestmentCategory } from '@/types/database';
```

Update findWithStudentInfo method (around line 50) to include category:

```typescript
async findWithStudentInfo(): Promise<InvestmentWithStudent[]> {
  const client = await pool.connect();
  try {
    const result = await client.query(`
      SELECT 
        i.id,
        i.student_id,
        i.fecha,
        i.monto,
        i.concepto,
        i.category_id,
        i.created_at,
        i.updated_at,
        s.name as student_name,
        s.email as student_email,
        c.name as class_name,
        cat.id as category_id,
        cat.name as category_name,
        cat.level as category_level,
        cat.text_style as category_text_style,
        cat.icon_config as category_icon_config
      FROM investments i
      JOIN students s ON i.student_id = s.id
      JOIN classes c ON s.class_id = c.id
      LEFT JOIN investment_categories cat ON i.category_id = cat.id
      ORDER BY i.fecha DESC
    `);
    
    return result.rows.map(row => ({
      id: row.id,
      student_id: row.student_id,
      fecha: row.fecha,
      monto: row.monto,
      concepto: row.concepto,
      category_id: row.category_id,
      created_at: row.created_at,
      updated_at: row.updated_at,
      student_name: row.student_name,
      student_email: row.student_email,
      class_name: row.class_name,
      category: row.category_id ? {
        id: row.category_id,
        name: row.category_name,
        level: row.category_level,
        text_style: row.category_text_style || {},
        icon_config: row.category_icon_config || null
      } : null
    }));
  } finally {
    client.release();
  }
}
```

**STOP POINT 3 ✋**

- ✅ Repository created
- ✅ Investment repository updated
- ✅ No import errors

### Step 4: Service Layer (20 mins)

**Update** `/src/services/admin-service.ts`

Add imports at the top:

```typescript
import { InvestmentCategoryRepository } from '../repos/investment-category-repo';
import { InvestmentCategory, CreateInvestmentCategoryRequest } from '../types/database';
```

Add property after line 25:

```typescript
private categoryRepo: InvestmentCategoryRepository;
```

Update constructor (around line 30):

```typescript
constructor() {
  this.classRepo = new ClassRepository();
  this.studentRepo = new StudentRepository();
  this.investmentRepo = new InvestmentRepository();
  this.interestRateRepo = new InterestRateHistoryRepository();
  this.categoryRepo = new InvestmentCategoryRepository(); // Add this
}
```

Add methods at the end of the class:

```typescript
// Investment Category management
async getAllCategories(activeOnly = false): Promise<InvestmentCategory[]> {
  return await this.categoryRepo.findAll(activeOnly);
}

async getCategoryById(id: number): Promise<InvestmentCategory | null> {
  return await this.categoryRepo.findById(id);
}

async createCategory(data: CreateInvestmentCategoryRequest): Promise<InvestmentCategory> {
  return await this.categoryRepo.create(data);
}

async updateCategory(id: number, data: Partial<CreateInvestmentCategoryRequest>): Promise<InvestmentCategory | null> {
  return await this.categoryRepo.update(id, data);
}

async deleteCategory(id: number): Promise<boolean> {
  return await this.categoryRepo.delete(id);
}
```

**STOP POINT 4 ✋**

- ✅ Service methods added
- ✅ Build still passes

### Step 5: Admin UI - Server Component (15 mins)

**Create** `/src/app/admin/categories/page.tsx`

```typescript
import { redirect } from 'next/navigation';
import { auth } from '@/auth';
import { AdminService } from '@/services/admin-service';
import { Suspense } from 'react';
import CategoriesAdminClient from './categories-admin-client';

export default async function CategoriesAdminPage() {
  const session = await auth();
  
  if (!session) {
    redirect('/admin/auth/signin');
  }

  const adminService = new AdminService();
  const categories = await adminService.getAllCategories();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Investment Categories</h1>
        <p className="mt-2 text-gray-600">
          Manage visual categories for student investments with custom styles and icons.
        </p>
      </div>
      
      <Suspense fallback={<div>Loading categories...</div>}>
        <CategoriesAdminClient categories={categories} />
      </Suspense>
    </div>
  );
}
```

### Step 6: Admin UI - Client Component (45 mins)

**Create** `/src/app/admin/categories/categories-admin-client.tsx`

```typescript
'use client';

import { useState } from 'react';
import { InvestmentCategory, CreateInvestmentCategoryRequest } from '@/types/database';
import { createCategory, updateCategory, deleteCategory } from './actions';

interface CategoriesAdminClientProps {
  categories: InvestmentCategory[];
}

export default function CategoriesAdminClient({ categories: initialCategories }: CategoriesAdminClientProps) {
  const [categories, setCategories] = useState(initialCategories);
  const [showForm, setShowForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState<InvestmentCategory | null>(null);
  const [formData, setFormData] = useState<CreateInvestmentCategoryRequest>({
    name: '',
    level: 'bronze',
    text_style: {
      fontSize: 'text-sm',
      fontWeight: 'font-normal',
      textColor: 'text-gray-900'
    },
    is_active: true,
    sort_order: 0
  });

  const handleEdit = (category: InvestmentCategory) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      level: category.level,
      text_style: category.text_style,
      icon_config: category.icon_config,
      is_active: category.is_active,
      sort_order: category.sort_order
    });
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formDataObj = new FormData(e.currentTarget);
    
    try {
      if (editingCategory) {
        const result = await updateCategory(editingCategory.id, formDataObj);
        if (result.success && result.data) {
          setCategories(categories.map(c => 
            c.id === editingCategory.id ? result.data! : c
          ));
        } else {
          alert(result.error || 'Failed to update category');
        }
      } else {
        const result = await createCategory(formDataObj);
        if (result.success && result.data) {
          setCategories([...categories, result.data]);
        } else {
          alert(result.error || 'Failed to create category');
        }
      }
      
      setShowForm(false);
      setEditingCategory(null);
      resetForm();
    } catch {
      alert('An error occurred');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this category?')) return;
    
    try {
      const result = await deleteCategory(id);
      if (result.success) {
        setCategories(categories.filter(c => c.id !== id));
      } else {
        alert(result.error || 'Failed to delete category');
      }
    } catch {
      alert('Failed to delete category');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      level: 'bronze',
      text_style: {
        fontSize: 'text-sm',
        fontWeight: 'font-normal',
        textColor: 'text-gray-900'
      },
      is_active: true,
      sort_order: 0
    });
  };

  const getLevelBadgeColor = (level: string) => {
    switch (level) {
      case 'bronze': return 'bg-orange-100 text-orange-800';
      case 'silver': return 'bg-gray-100 text-gray-800';
      case 'gold': return 'bg-yellow-100 text-yellow-800';
      case 'platinum': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Categories</h2>
          <p className="text-gray-600">Total: {categories.length} categories</p>
        </div>
        <button
          onClick={() => {
            setShowForm(true);
            setEditingCategory(null);
            resetForm();
          }}
          className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
        >
          Add Category
        </button>
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-full max-w-2xl shadow-lg rounded-md bg-white">
            <h3 className="text-lg font-bold text-gray-900 mb-4">
              {editingCategory ? 'Edit Category' : 'Create Category'}
            </h3>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Basic Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                    Category Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    required
                    defaultValue={formData.name}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  />
                </div>
                
                <div>
                  <label htmlFor="level" className="block text-sm font-medium text-gray-700">
                    Level
                  </label>
                  <select
                    id="level"
                    name="level"
                    defaultValue={formData.level}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  >
                    <option value="bronze">Bronze</option>
                    <option value="silver">Silver</option>
                    <option value="gold">Gold</option>
                    <option value="platinum">Platinum</option>
                  </select>
                </div>
              </div>

              {/* Text Styling */}
              <div className="border-t pt-4">
                <h4 className="text-md font-medium text-gray-900 mb-3">Text Styling</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label htmlFor="fontSize" className="block text-sm font-medium text-gray-700">
                      Font Size
                    </label>
                    <select
                      id="fontSize"
                      name="fontSize"
                      defaultValue={formData.text_style?.fontSize || 'text-sm'}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    >
                      <option value="text-xs">Extra Small</option>
                      <option value="text-sm">Small</option>
                      <option value="text-base">Base</option>
                      <option value="text-lg">Large</option>
                      <option value="text-xl">Extra Large</option>
                    </select>
                  </div>
                  
                  <div>
                    <label htmlFor="fontWeight" className="block text-sm font-medium text-gray-700">
                      Font Weight
                    </label>
                    <select
                      id="fontWeight"
                      name="fontWeight"
                      defaultValue={formData.text_style?.fontWeight || 'font-normal'}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    >
                      <option value="font-normal">Normal</option>
                      <option value="font-medium">Medium</option>
                      <option value="font-semibold">Semibold</option>
                      <option value="font-bold">Bold</option>
                    </select>
                  </div>
                  
                  <div>
                    <label htmlFor="textColor" className="block text-sm font-medium text-gray-700">
                      Text Color
                    </label>
                    <select
                      id="textColor"
                      name="textColor"
                      defaultValue={formData.text_style?.textColor || 'text-gray-900'}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    >
                      <option value="text-gray-900">Default</option>
                      <option value="text-red-600">Red</option>
                      <option value="text-green-600">Green</option>
                      <option value="text-blue-600">Blue</option>
                      <option value="text-yellow-600">Yellow</option>
                      <option value="text-purple-600">Purple</option>
                      <option value="text-indigo-600">Indigo</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Additional Options */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="sort_order" className="block text-sm font-medium text-gray-700">
                    Sort Order
                  </label>
                  <input
                    type="number"
                    id="sort_order"
                    name="sort_order"
                    defaultValue={formData.sort_order}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  />
                </div>
                
                <div className="flex items-center mt-6">
                  <input
                    type="checkbox"
                    id="is_active"
                    name="is_active"
                    defaultChecked={formData.is_active}
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                  />
                  <label htmlFor="is_active" className="ml-2 block text-sm text-gray-900">
                    Active
                  </label>
                </div>
              </div>

              {/* Form Actions */}
              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setEditingCategory(null);
                  }}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700"
                >
                  {editingCategory ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Categories Table */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Level
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Style Preview
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {categories
              .sort((a, b) => a.sort_order - b.sort_order)
              .map((category) => (
                <tr key={category.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {category.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getLevelBadgeColor(category.level)}`}>
                      {category.level}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span 
                      className={`
                        ${category.text_style.fontSize || 'text-sm'} 
                        ${category.text_style.fontWeight || 'font-normal'}
                        ${category.text_style.fontStyle || ''}
                        ${category.text_style.textColor || 'text-gray-900'}
                      `}
                    >
                      Sample Text
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      category.is_active 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {category.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => handleEdit(category)}
                      className="text-indigo-600 hover:text-indigo-900 mr-3"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(category.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
        {categories.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No categories found. Create your first category above.
          </div>
        )}
      </div>
    </div>
  );
}
```

### Step 7: Server Actions (20 mins)

**Create** `/src/app/admin/categories/actions.ts`

```typescript
'use server';

import { AdminService } from '@/services/admin-service';
import { CreateInvestmentCategoryRequest } from '@/types/database';
import { withAdminAuth, validateRequired } from '@/utils/server-actions';

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
  const sortOrder = parseInt(formData.get('sort_order') as string) || 0;
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
  const sortOrder = parseInt(formData.get('sort_order') as string) || 0;
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
```

### Step 8: Update Admin Navigation (10 mins)

**Update** `/src/app/admin/components/admin-nav.tsx`

Add to navigation array after line 13:

```typescript
{ name: t('nav.categories'), href: '/admin/categories' },
```

**Update** `/src/config/translations.ts`

Add to nav section:

```typescript
categories: 'Categorías',
```

Add new section after investments:

```typescript
// Categories
categories: {
  title: 'Gestión de Categorías',
  createNew: 'Crear Nueva Categoría',
  categoryName: 'Nombre de la Categoría',
  level: 'Nivel',
  bronze: 'Bronce',
  silver: 'Plata', 
  gold: 'Oro',
  platinum: 'Platino',
  textStyling: 'Estilo de Texto',
  fontSize: 'Tamaño de Fuente',
  fontWeight: 'Peso de Fuente',
  textColor: 'Color de Texto',
  preview: 'Vista Previa',
  sortOrder: 'Orden',
  active: 'Activa',
  inactive: 'Inactiva',
  actions: 'Acciones',
  edit: 'Editar',
  delete: 'Eliminar',
  save: 'Guardar',
  cancel: 'Cancelar',
  noCategories: 'No se encontraron categorías. Crea tu primera categoría arriba.',
  deleteConfirm: '¿Estás seguro de que quieres eliminar esta categoría?',
  create: 'Crear',
  update: 'Actualizar'
},
```

### Step 9: Update Investments to Support Categories (15 mins)

**Update** `/src/app/admin/investments/investments-admin-client.tsx`

Add categories prop to interface (around line 20):

```typescript
interface InvestmentsAdminClientProps {
  investments: InvestmentForClient[]
  students: StudentForClient[]
  classes: ClassForClient[]
  categories: InvestmentCategory[] // Add this
}
```

Update component signature:

```typescript
export default function InvestmentsAdminClient({ 
  investments: initialInvestments, 
  students, 
  classes,
  categories // Add this
}: InvestmentsAdminClientProps) {
```

Add category select to create form (after amount input, around line 180):

```typescript
<div>
  <label htmlFor="category_id" className="block text-sm font-medium text-gray-700">
    Category
  </label>
  <select
    id="category_id"
    name="category_id"
    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
  >
    <option value="">Standard</option>
    {categories
      .filter(cat => cat.is_active)
      .sort((a, b) => a.sort_order - b.sort_order)
      .map((category) => (
        <option key={category.id} value={category.id}>
          {category.name} ({category.level})
        </option>
      ))}
  </select>
</div>
```

**Update** `/src/app/admin/investments/page.tsx`

Import category service:

```typescript
import { InvestmentCategory } from '@/types/database'
```

Fetch categories:

```typescript
const categories = await adminService.getAllCategories(true) // Only active
```

Pass to client component:

```typescript
<InvestmentsAdminClient 
  investments={investmentsForClient} 
  students={studentsForClient} 
  classes={classesForClient}
  categories={categories} // Add this
/>
```

**Update** `/src/app/admin/investments/actions.ts`

Add category_id handling in createInvestment:

```typescript
const category_id = formData.get('category_id') ? parseFormNumber(formData, 'category_id') : undefined

const investmentData: CreateInvestmentRequest = {
  student_id,
  fecha,
  monto,
  concepto,
  category_id // Add this
}
```

**STOP POINT 5 ✋**

- ✅ Admin UI complete
- ✅ Categories CRUD working
- ✅ Investments support categories
- ✅ Navigation updated

### Step 10: Final Verification (10 mins)

Run full test suite:

```bash
# 1. Test database
npm run db:test

# 2. Build application
npm run build

# 3. Start dev server
npm run dev

# 4. Manual testing checklist:
```

**Manual Test Checklist:**

- ✅ Navigate to /admin/categories
- ✅ Create a new category with custom styling
- ✅ Edit the category
- ✅ Create an investment with the new category
- ✅ Verify category appears in investments list
- ✅ Delete unused category (should work)
- ✅ Try to delete used category (should fail)

## Completion Checklist

```yaml
phase_1_completed:
  database:
    - tables_created: true
    - migrations_successful: true
    - existing_data_preserved: true
  
  backend:
    - types_defined: true
    - repository_implemented: true
    - service_layer_complete: true
    
  admin_ui:
    - crud_operations: true
    - navigation_updated: true
    - translations_added: true
    
  integration:
    - investments_support_categories: true
    - no_typescript_errors: true
    - build_passes: true
    
  testing:
    - manual_testing_complete: true
    - edge_cases_handled: true
```

## Notes for Next Phase

The foundation is now in place. Phase 2 will add:

- Premium CSS effects file
- Advanced style builder in admin
- Visual preview system
- Style compilation and caching

**Ready for Phase 2? ✅**