import { redirect } from 'next/navigation';
import { SecureStudentSessionService } from '@/services/secure-student-session-service';
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

  return (
    <div className="min-h-screen bg-gray-50">
      <StudentNav session={session} />
      <main className="pt-4">
        {children}
      </main>
    </div>
  );
}
