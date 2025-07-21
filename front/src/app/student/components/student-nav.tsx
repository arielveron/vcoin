'use client'

import { useRouter } from 'next/navigation';
import { StudentSession } from '@/types/database';
import { studentLogout } from '@/actions/student-actions';

interface StudentNavProps {
  session: StudentSession;
}

export default function StudentNav({ session }: StudentNavProps) {
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await studentLogout();
      // studentLogout will redirect to /login
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-4">
            <div className="text-2xl font-bold text-indigo-600">VCOIN</div>
            <div className="text-gray-600">
              <span className="font-medium">{session.name}</span>
              <span className="text-sm ml-2">({session.class_name} - #{session.registro})</span>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <button
              onClick={() => router.push('/student/profile')}
              className="text-gray-700 hover:text-indigo-600 px-3 py-2 rounded-md text-sm font-medium"
            >
              Profile
            </button>
            <button
              onClick={() => router.push('/student')}
              className="text-gray-700 hover:text-indigo-600 px-3 py-2 rounded-md text-sm font-medium"
            >
              Dashboard
            </button>
            <form action={handleLogout}>
              <button
                type="submit"
                className="bg-indigo-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-indigo-700"
              >
                Logout
              </button>
            </form>
          </div>
        </div>
      </div>
    </nav>
  );
}
