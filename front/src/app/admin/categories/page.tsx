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
        <h1 className="text-2xl font-bold text-gray-900">Investment Categories</h1>
        <p className="mt-1 text-sm text-gray-600">
          Manage visual categories for investments with custom styling and levels.
        </p>
      </div>

      <Suspense fallback={<div>Loading categories...</div>}>
        <CategoriesAdminClient categories={categories} />
      </Suspense>
    </div>
  );
}
