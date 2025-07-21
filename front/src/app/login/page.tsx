import { redirect } from 'next/navigation';
import { StudentSessionService } from '@/services/student-session-service';
import StudentLoginForm from './student-login-form';

export default async function StudentLoginPage() {
  // Check if student is already logged in
  const hasSession = await StudentSessionService.hasActiveSession();
  if (hasSession) {
    redirect('/student');
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <div className="flex justify-center">
            <div className="text-4xl font-bold text-indigo-600">VCOIN</div>
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Student Login
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Enter your class ID, registry number, and password to access your account
          </p>
        </div>
        <StudentLoginForm />
      </div>
    </div>
  );
}
