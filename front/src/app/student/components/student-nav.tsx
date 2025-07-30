'use client'

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { StudentSession } from '@/types/database';
import { studentLogout } from '@/actions/student-actions';
import { Menu, X, User, Home, LogOut, Trophy, ChevronDown } from 'lucide-react';
import AchievementSummary from './achievement-summary';

interface StudentNavProps {
  session: StudentSession;
  achievementStats?: {
    total_points: number;
    achievements_unlocked: number;
    achievements_total: number;
    rank?: number;
  };
  unseenAchievementsCount?: number;
}

export default function StudentNav({ session, achievementStats, unseenAchievementsCount = 0 }: StudentNavProps) {
  const router = useRouter();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isAchievementDropdownOpen, setIsAchievementDropdownOpen] = useState(false);

  // Server action for logout - use directly in form actions

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  const closeAchievementDropdown = () => {
    setIsAchievementDropdownOpen(false);
  };

  const navigateTo = (path: string) => {
    router.push(path);
    closeMobileMenu();
    closeAchievementDropdown();
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      const dropdown = document.querySelector('[data-dropdown="achievements"]');
      const button = document.querySelector('[data-dropdown-button="achievements"]');
      
      if (isAchievementDropdownOpen && dropdown && button) {
        if (!dropdown.contains(target) && !button.contains(target)) {
          setIsAchievementDropdownOpen(false);
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isAchievementDropdownOpen]);

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
              {/* Achievements Dropdown */}
              <div className="relative">
                <button
                  data-dropdown-button="achievements"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsAchievementDropdownOpen(!isAchievementDropdownOpen);
                  }}
                  className="flex items-center space-x-2 text-gray-700 hover:text-indigo-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  {achievementStats && (
                    <AchievementSummary 
                      stats={achievementStats}
                      unseenCount={unseenAchievementsCount}
                    />
                  )}
                  <ChevronDown className={`w-4 h-4 transition-transform ${isAchievementDropdownOpen ? 'rotate-180' : ''}`} />
                </button>
                
                {/* Dropdown Menu */}
                {isAchievementDropdownOpen && (
                  <div 
                    data-dropdown="achievements"
                    className="absolute right-0 mt-2 w-96 bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 z-50"
                  >
                    <div className="py-1">
                      {achievementStats && (
                        <div className="px-4 py-3 border-b border-gray-100">
                          <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-3">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-3">
                                <div className="text-xl">🏆</div>
                                <div>
                                  <h3 className="font-semibold text-gray-900">Logros</h3>
                                  <p className="text-sm text-gray-600">
                                    {achievementStats.achievements_unlocked}/{achievementStats.achievements_total} completados
                                  </p>
                                </div>
                              </div>
                              <div className="flex items-center space-x-4">
                                <div className="text-center">
                                  <div className="text-lg font-bold text-blue-600">{achievementStats.total_points}</div>
                                  <div className="text-xs text-gray-600">Puntos</div>
                                </div>
                                <div className="text-center">
                                  <div className="text-lg font-bold text-purple-600">
                                    {Math.round((achievementStats.achievements_unlocked / achievementStats.achievements_total) * 100)}%
                                  </div>
                                  <div className="text-xs text-gray-600">Completado</div>
                                </div>
                              </div>
                            </div>
                            {/* Progress Bar */}
                            <div className="mt-3">
                              <div className="w-full bg-gray-200 rounded-full h-2">
                                <div
                                  className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all duration-300"
                                  style={{ width: `${Math.round((achievementStats.achievements_unlocked / achievementStats.achievements_total) * 100)}%` }}
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setIsAchievementDropdownOpen(false);
                          router.push('/student/achievements');
                        }}
                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-indigo-600 transition-colors"
                      >
                        <div className="flex items-center space-x-2">
                          <Trophy className="w-4 h-4" />
                          <span>Ver Todos los Logros</span>
                          {unseenAchievementsCount > 0 && (
                            <span className="bg-red-500 text-white text-xs rounded-full px-2 py-0.5">
                              {unseenAchievementsCount}
                            </span>
                          )}
                        </div>
                      </button>
                    </div>
                  </div>
                )}
              </div>
              
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
              <form action={studentLogout}>
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
              {/* Achievements Section */}
              <div className="border-b border-gray-200 pb-3 mb-3">
                {achievementStats && (
                  <div className="mb-3">
                    <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <div className="text-lg">🏆</div>
                          <div>
                            <div className="text-sm font-medium text-gray-900">Logros</div>
                            <div className="text-xs text-gray-600">
                              {achievementStats.achievements_unlocked}/{achievementStats.achievements_total} completados
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-3">
                          <div className="text-center">
                            <div className="text-sm font-bold text-blue-600">{achievementStats.total_points}</div>
                            <div className="text-xs text-gray-600">Puntos</div>
                          </div>
                          <div className="text-center">
                            <div className="text-sm font-bold text-purple-600">
                              {Math.round((achievementStats.achievements_unlocked / achievementStats.achievements_total) * 100)}%
                            </div>
                            <div className="text-xs text-gray-600">Completado</div>
                          </div>
                        </div>
                      </div>
                      <div className="mt-2">
                        <div className="w-full bg-gray-200 rounded-full h-1.5">
                          <div
                            className="bg-gradient-to-r from-blue-500 to-purple-600 h-1.5 rounded-full transition-all duration-300"
                            style={{ 
                              width: `${Math.round((achievementStats.achievements_unlocked / achievementStats.achievements_total) * 100)}%` 
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                <button
                  onClick={() => navigateTo('/student/achievements')}
                  className="w-full flex items-center px-3 py-2 text-sm font-medium text-gray-700 rounded-md hover:bg-gray-100 hover:text-indigo-600 transition-colors"
                >
                  <Trophy className="w-5 h-5 mr-3" />
                  <span className="flex-1 text-left">Ver Todos los Logros</span>
                  {unseenAchievementsCount > 0 && (
                    <span className="bg-red-500 text-white text-xs rounded-full px-2 py-0.5 ml-2">
                      {unseenAchievementsCount}
                    </span>
                  )}
                </button>
              </div>
              
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
            <form action={studentLogout} className="w-full">
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