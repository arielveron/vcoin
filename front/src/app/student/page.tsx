import { redirect } from 'next/navigation';
import { SecureStudentSessionService } from '@/services/secure-student-session-service';
import StudentMainScreen from './components/student-main-screen';

export default async function StudentPage() {
  const session = await SecureStudentSessionService.getSession();
  
  if (!session) {
    redirect('/login');
  }

  return (
    <div className="grid grid-rows-[1fr_20px] items-center justify-items-center min-h-[calc(100vh-4rem)] p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <main className="flex flex-col gap-[32px] row-start-1 items-center sm:items-start">
        <StudentMainScreen studentId={session.student_id} />
      </main>
      <footer className="row-start-2 flex gap-6 flex-wrap items-center justify-center">
        <div className="text-sm text-gray-500">
          VCOIN - Virtual Investment Platform
        </div>
      </footer>
    </div>
  );
}
