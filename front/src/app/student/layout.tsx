import { redirect } from 'next/navigation';
import { SecureStudentSessionService } from '@/services/secure-student-session-service';
import { ServerDataService } from '@/services/server-data-service';
import StudentNav from '@/app/student/components/student-nav';

export default async function StudentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await SecureStudentSessionService.getSession();
  
  if (!session) {
    redirect('/login');
  }

  // Fetch achievement data for navigation with personalization
  const achievementStats = await ServerDataService.getStudentAchievementStats(session.student_id);
  const unseenAchievements = await ServerDataService.getPersonalizedUnseenAchievements(
    session.student_id, 
    session.personalizacion || null
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <StudentNav 
        session={session} 
        achievementStats={achievementStats}
        unseenAchievementsCount={unseenAchievements.length}
      />
      <main className="pt-4">
        {children}
      </main>
    </div>
  );
}
