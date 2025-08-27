import { redirect } from 'next/navigation';
import { auth } from '@/auth';
import { AdminService } from '@/services/admin-service';
import { AchievementManagePage } from '@/presentation/features/admin/achievements/manage';
import { createAchievement, updateAchievement, deleteAchievement } from './actions';

export default async function AchievementManagePageServer() {
  const session = await auth();
  
  if (!session) {
    redirect('/admin/auth/signin');
  }

  const adminService = new AdminService();
  
  // Fetch all required data
  const achievements = await adminService.getAllAchievements();
  const categories = await adminService.getAllCategories(true); // Only active categories

  return (
    <AchievementManagePage 
      achievements={achievements}
      categories={categories}
      createAchievement={createAchievement}
      updateAchievement={updateAchievement}
      deleteAchievement={deleteAchievement}
    />
  );
}
