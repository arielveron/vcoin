import { redirect } from 'next/navigation';
import { StudentSessionService } from '@/services/student-session-service';
import StudentNav from './components/student-nav';

export default async function StudentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await StudentSessionService.getSession();
  
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
