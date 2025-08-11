import { redirect } from 'next/navigation';
import { auth } from '@/auth';
import { AdminService } from '@/services/admin-service';
import { AchievementsPage } from '@/presentation/features/admin/achievements';
import { 
  createAchievement, 
  updateAchievement, 
  deleteAchievement, 
  unlockManualAchievement,
  processAchievements,
  getStudentAchievements
} from './actions';

export default async function AchievementsAdminPage() {
  const session = await auth();
  
  if (!session) {
    redirect('/admin/auth/signin');
  }

  const adminService = new AdminService();
  
  // Fetch all required data
  const [achievements, classes, categories] = await Promise.all([
    adminService.getAllAchievements(),
    adminService.getAllClasses(),
    adminService.getAllCategories()
  ]);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Achievement Management</h1>
        <p className="text-gray-600">Manage achievements, award manual achievements, and view student progress</p>
      </div>
      
      <AchievementsPage 
        initialAchievements={achievements}
        classes={classes}
        categories={categories}
        createAchievement={createAchievement}
        updateAchievement={updateAchievement}
        deleteAchievement={deleteAchievement}
        processAchievements={processAchievements}
        manualAward={unlockManualAchievement}
        getStudentAchievements={getStudentAchievements}
      />
    </div>
  );
}
