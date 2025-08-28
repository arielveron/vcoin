import { redirect } from 'next/navigation';
import { SecureStudentSessionService } from '@/services/secure-student-session-service';
import { ServerDataService } from '@/services/server-data-service';
import { AchievementEngine } from '@/services/achievement-engine';
import AchievementSection from '@/app/student/components/achievement-section';

export default async function AchievementsPage() {
  const session = await SecureStudentSessionService.getSession();
  
  if (!session) {
    redirect('/login');
  }

  // Process achievements to ensure progress is up to date
  try {
    const achievementEngine = new AchievementEngine();
    await achievementEngine.checkAchievementsForStudent(session.student_id);
  } catch (error) {
    console.error('Error processing achievements on achievements page:', error);
  }

  // Fetch achievement data for the authenticated student with personalization
  const achievements = await ServerDataService.getPersonalizedStudentAchievements(
    session.student_id, 
    session.personalizacion || null
  );
  const achievementStats = await ServerDataService.getStudentAchievementStats(session.student_id);
  // Note: We don't fetch unseenAchievements here because celebrations happen on dashboard

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6 px-4 sm:px-6 lg:px-8 mb-8">
      {/* Page Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 px-6 py-4">
        <div className="flex items-center space-x-3">
          <div className="text-3xl">🏆</div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Eventos y Logros</h1>
            <p className="text-gray-600">
              Sigue tu progreso y descubre todos los logros y eventos disponibles
            </p>
          </div>
        </div>
      </div>

      {/* Achievement Dashboard - Always Expanded */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <AchievementSection
          achievements={achievements}
          studentStats={achievementStats}
          unseenAchievements={[]} // Empty array since celebrations happen on dashboard
          forceExpanded={true}
          hideHeader={true}
        />
      </div>
    </div>
  );
}
