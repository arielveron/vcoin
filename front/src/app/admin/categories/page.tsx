import { redirect } from 'next/navigation';
import { auth } from '@/auth';
import { AdminService } from '@/services/admin-service';
import { Suspense } from 'react';
import { CategoriesPage } from '@/presentation/features/admin/categories';
import { createCategory, updateCategory, deleteCategory } from './actions';

export default async function CategoriesAdminPage() {
  const session = await auth();
  
  if (!session) {
    redirect('/admin/auth/signin');
  }

  const adminService = new AdminService();
  const [categories, classes] = await Promise.all([
    adminService.getAllCategories(),
    adminService.getAllClasses()
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Investment Categories</h1>
        <p className="mt-1 text-sm text-gray-600">
          Manage visual categories for investments with custom styling and levels.
        </p>
      </div>

      <Suspense fallback={<div>Loading categories...</div>}>
        <CategoriesPage 
          initialCategories={categories}
          classes={classes}
          createCategory={createCategory}
          updateCategory={updateCategory}
          deleteCategory={deleteCategory}
        />
      </Suspense>
    </div>
  );
}
