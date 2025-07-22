'use client'

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { StudentSession } from '@/types/database';
import { studentLogout } from '@/actions/student-actions';
import { Menu, X, User, Home, LogOut } from 'lucide-react';

interface StudentNavProps {
  session: StudentSession;
}

export default function StudentNav({ session }: StudentNavProps) {
  const router = useRouter();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await studentLogout();
      // studentLogout will redirect to /login
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  const navigateTo = (path: string) => {
    router.push(path);
    closeMobileMenu();
  };

  return (
    <>
      <nav className="bg-white shadow-sm border-b border-gray-200 relative z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo y información del usuario - Desktop */}
            <div className="flex items-center space-x-4">
              <div className="text-2xl font-bold text-indigo-600">VCOIN</div>
              <div className="hidden sm:block text-gray-600">
                <span className="font-medium">{session.name}</span>
                <span className="text-sm ml-2">({session.class_name} - #{session.registro})</span>
              </div>
            </div>
            
            {/* Navegación Desktop */}
            <div className="hidden md:flex items-center space-x-4">
              <button
                onClick={() => router.push('/student')}
                className="text-gray-700 hover:text-indigo-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
              >
                Dashboard
              </button>
              <button
                onClick={() => router.push('/student/profile')}
                className="text-gray-700 hover:text-indigo-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
              >
                Profile
              </button>
              <form action={handleLogout}>
                <button
                  type="submit"
                  className="bg-indigo-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-indigo-700 transition-colors"
                >
                  Logout
                </button>
              </form>
            </div>

            {/* Información del usuario - Mobile */}
            <div className="flex items-center sm:hidden">
              <div className="text-gray-600 text-sm mr-4">
                <span className="font-medium">{session.name}</span>
              </div>
            </div>

            {/* Hamburger Menu Button - Mobile */}
            <div className="md:hidden">
              <button
                onClick={toggleMobileMenu}
                className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500 transition-colors"
                aria-expanded="false"
              >
                <span className="sr-only">Open main menu</span>
                {isMobileMenuOpen ? (
                  <X className="block h-6 w-6" aria-hidden="true" />
                ) : (
                  <Menu className="block h-6 w-6" aria-hidden="true" />
                )}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Drawer Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={closeMobileMenu}
        />
      )}

      {/* Mobile Drawer */}
      <div className={`fixed top-0 right-0 h-full w-80 bg-white shadow-xl transform transition-transform duration-300 ease-in-out z-50 md:hidden ${
        isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'
      }`}>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <div className="text-xl font-bold text-indigo-600">VCOIN</div>
            <button
              onClick={closeMobileMenu}
              className="p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* User Info */}
          <div className="p-4 border-b border-gray-200 bg-gray-50">
            <div className="flex items-center space-x-3">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
                  <User className="w-6 h-6 text-indigo-600" />
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {session.name}
                </p>
                <p className="text-xs text-gray-500 truncate">
                  {session.class_name} - Registry #{session.registro}
                </p>
                <p className="text-xs text-gray-500 truncate">
                  {session.email}
                </p>
              </div>
            </div>
          </div>

          {/* Navigation Links */}
          <div className="flex-1 py-4">
            <nav className="space-y-1 px-4">
              <button
                onClick={() => navigateTo('/student')}
                className="w-full flex items-center px-3 py-3 text-sm font-medium text-gray-700 rounded-md hover:bg-gray-100 hover:text-indigo-600 transition-colors"
              >
                <Home className="w-5 h-5 mr-3" />
                Dashboard
              </button>
              <button
                onClick={() => navigateTo('/student/profile')}
                className="w-full flex items-center px-3 py-3 text-sm font-medium text-gray-700 rounded-md hover:bg-gray-100 hover:text-indigo-600 transition-colors"
              >
                <User className="w-5 h-5 mr-3" />
                Profile
              </button>
            </nav>
          </div>

          {/* Logout Button */}
          <div className="border-t border-gray-200 p-4">
            <form action={handleLogout} className="w-full">
              <button
                type="submit"
                className="w-full flex items-center justify-center px-4 py-3 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 transition-colors"
              >
                <LogOut className="w-5 h-5 mr-2" />
                Logout
              </button>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}