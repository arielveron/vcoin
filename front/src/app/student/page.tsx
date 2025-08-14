import { redirect } from 'next/navigation';
import { SecureStudentSessionService } from '@/services/secure-student-session-service';
import StudentMainScreen from './components/student-main-screen';

export default async function StudentPage() {
  const session = await SecureStudentSessionService.getSession();
  
  if (!session) {
    redirect('/login');
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-br from-gray-50 via-white to-gray-50">
      <main className="py-6 sm:py-8 lg:py-12">
        <StudentMainScreen studentId={session.student_id} />
      </main>
      
      <footer className="py-8 text-center">
        <div className="text-sm text-gray-500">
          VCOIN - Simulador Educativo de Inversiones Virtuales
        </div>
        <div className="text-xs text-gray-400 mt-1">
          © 2025 veron.com.ar
        </div>
      </footer>
    </div>
  );
}