import { redirect } from 'next/navigation';
import { auth } from '@/auth';
import { AdminService } from '@/services/admin-service';
import DebugClient from './debug-client';

export default async function AchievementDebugPage() {
  const session = await auth();
  
  if (!session) {
    redirect('/admin/auth/signin');
  }

  const adminService = new AdminService();
  
  // Get all data for debugging
  const achievements = await adminService.getAllAchievements();
  const categories = await adminService.getAllCategories();
  const students = await adminService.getAllStudents();
  const investments = await adminService.getAllInvestments();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Achievement System Debug</h1>
        <p className="mt-2 text-gray-600">
          Debug the achievement system to see what&apos;s happening.
        </p>
      </div>
      
      <DebugClient 
        achievements={achievements}
        categories={categories}
        students={students}
        investments={investments}
      />
    </div>
  );
}
