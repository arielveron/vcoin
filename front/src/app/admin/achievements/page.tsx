import { redirect } from 'next/navigation';
import { auth } from '@/auth';
import { AdminService } from '@/services/admin-service';
import { AchievementsPage } from '@/presentation/features/admin/achievements';
import { 
  createAchievement, 
  updateAchievement, 
  deleteAchievement, 
  unlockManualAchievement,
  revokeManualAchievement,
  processAchievements,
  getStudentAchievements
} from './actions';

// Force dynamic rendering to ensure searchParams changes trigger re-rendering
export const dynamic = 'force-dynamic'
export const revalidate = 0

interface AchievementsPageProps {
  searchParams: Promise<{ qc?: string }>
}

export default async function AchievementsAdminPage({ searchParams }: AchievementsPageProps) {
  const session = await auth();
  
  if (!session) {
    redirect('/admin/auth/signin');
  }

  const adminService = new AdminService();
  const params = await searchParams
  const classId = params.qc ? parseInt(params.qc) : null
  
  // Get students based on class filter (for counting students with achievements)
  const students = classId 
    ? await adminService.getStudentsByClass(classId)
    : await adminService.getAllStudents()
  
  // Fetch all required data
  const [achievements, classes, categories] = await Promise.all([
    adminService.getAllAchievements(),
    adminService.getAllClasses(),
    adminService.getAllCategories()
  ]);

  // Get achievement counts for students (restricted by class filter)
  const studentIds = students.map(student => student.id)
  const achievementCounts = await adminService.getAchievementCountsByStudents(studentIds)
  
  // Calculate how many students have at least one achievement
  const studentsWithAchievements = Array.from(achievementCounts.values()).filter(count => count > 0).length

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Achievement Management</h1>
        <p className="text-gray-600">
          Manage achievements, award manual achievements, and view student progress • {studentsWithAchievements} of {students.length} students have achievements
          {classId && ` (filtered by class)`}
        </p>
      </div>
      
      <AchievementsPage 
        initialAchievements={achievements}
        classes={classes}
        categories={categories}
        students={students}
        createAchievement={createAchievement}
        updateAchievement={updateAchievement}
        deleteAchievement={deleteAchievement}
        processAchievements={processAchievements}
        manualAward={unlockManualAchievement}
        manualRevoke={revokeManualAchievement}
        getStudentAchievements={getStudentAchievements}
      />
    </div>
  );
}
