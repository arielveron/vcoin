import { redirect } from 'next/navigation';
import { SecureStudentSessionService } from '@/services/secure-student-session-service';
import StudentLoginForm from './student-login-form';
import SessionCleaner from '@/components/auth/session-cleaner';

export default async function StudentLoginPage() {
  // Check if student is already logged in
  try {
    const hasSession = await SecureStudentSessionService.hasActiveSession();
    if (hasSession) {
      redirect('/student');
    }
  } catch (error) {
    // Handle redirects and other errors gracefully
    if (error instanceof Error && error.message.includes('NEXT_REDIRECT')) {
      throw error;
    }
    // Silently handle other session validation errors
  }

  // Check if there's an invalid session that needs clearing
  const hasInvalidSession = await SecureStudentSessionService.hasInvalidSession();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      {/* Clear invalid sessions automatically */}
      <SessionCleaner hasInvalidSession={hasInvalidSession} />
      
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
