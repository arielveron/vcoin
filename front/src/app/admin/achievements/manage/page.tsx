import { redirect } from 'next/navigation';
import { auth } from '@/auth';
import { AdminService } from '@/services/admin-service';
import AchievementCrudClient from './achievement-crud-client';

export default async function AchievementManagePage() {
  const session = await auth();
  
  if (!session) {
    redirect('/admin/auth/signin');
  }

  const adminService = new AdminService();
  
  // Fetch all required data
  const achievements = await adminService.getAllAchievements();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Achievement Management</h1>
        <p className="mt-2 text-gray-600">
          Create, edit, and manage achievements for your students.
        </p>
      </div>
      
      <AchievementCrudClient 
        achievements={achievements}
      />
    </div>
  );
}
