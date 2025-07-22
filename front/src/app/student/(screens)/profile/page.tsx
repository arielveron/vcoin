import { redirect } from 'next/navigation';
import { SecureStudentSessionService } from '@/services/secure-student-session-service';
import StudentProfileForm from './student-profile-form';

export default async function StudentProfilePage() {
  const session = await SecureStudentSessionService.getSession();
  
  if (!session) {
    redirect('/login');
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="bg-white shadow rounded-lg p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Profile Settings</h1>
          <p className="text-gray-600 mt-2">
            Update your email address and password
          </p>
        </div>

        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <h2 className="text-lg font-semibold text-gray-900 mb-2">Account Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-medium text-gray-700">Name:</span>
              <span className="ml-2 text-gray-900">{session.name}</span>
            </div>
            <div>
              <span className="font-medium text-gray-700">Registry:</span>
              <span className="ml-2 text-gray-900">#{session.registro}</span>
            </div>
            <div>
              <span className="font-medium text-gray-700">Class:</span>
              <span className="ml-2 text-gray-900">{session.class_name}</span>
            </div>
            <div>
              <span className="font-medium text-gray-700">Current Email:</span>
              <span className="ml-2 text-gray-900">{session.email}</span>
            </div>
          </div>
        </div>

        <StudentProfileForm session={session} />
      </div>
    </div>
  );
}
