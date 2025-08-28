'use client'

import Link from "next/link"
import { AdminStats } from '@/services/admin-service'
import { Class, Student, Achievement } from '@/types/database'
import { useAdminFilters } from '@/presentation/features/admin/hooks/useAdminFilters'
import FilterBadges from './filter-badges'
import MobileFilters from '@/components/admin/mobile-filters'
import { AchievementsOverview, AchievementFilters } from '@/presentation/features/admin/achievements'
import { StudentLeaderboard, StudentLeaderboardData } from '@/presentation/features/admin/dashboard'
import { formatAchievementsForClient } from '@/utils/admin-data-types'
import { processAchievements } from '@/app/admin/actions'
import { Users, TrendingUp, Percent, Tags, Trophy, DollarSign, GraduationCap, Target } from 'lucide-react'

interface AdminDashboardClientProps {
  stats: AdminStats
  user: { name?: string } | null
  classes: Class[]
  students: Student[]
  achievements: Achievement[]
  achievementStudentCounts: Map<number, number>
  leaderboardData: StudentLeaderboardData[]
}

export default function AdminDashboardClient({ stats, user, classes, students, achievements, achievementStudentCounts, leaderboardData }: AdminDashboardClientProps) {
  const { getUrlWithFilters, filters, updateFilters } = useAdminFilters()

  // Process achievements handler
  const handleProcessAchievements = async () => {
    const result = await processAchievements()
    if (!result.success) {
      alert('error' in result ? result.error : 'Failed to process achievements')
    } else {
      alert(`Successfully processed ${result.data?.processed || 0} achievements`)
    }
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Panel de Control de Administración</h1>
        <p className="mt-2 text-gray-600">
          Bienvenido de vuelta, {user?.name || 'Usuario'}. Esto es lo que está pasando con VCoin.
        </p>
      </div>

      {/* Stats Grid - Responsive */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-white p-4 lg:p-6 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xs lg:text-sm font-medium text-gray-500">Total de Clases</h3>
              <p className="text-2xl lg:text-3xl font-bold text-indigo-600 mt-1">{stats.totalClasses}</p>
            </div>
            <GraduationCap className="h-8 w-8 text-indigo-600 flex-shrink-0" />
          </div>
        </div>
        <div className="bg-white p-4 lg:p-6 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xs lg:text-sm font-medium text-gray-500">Total de Estudiantes</h3>
              <p className="text-2xl lg:text-3xl font-bold text-green-600 mt-1">{stats.totalStudents}</p>
            </div>
            <Users className="h-8 w-8 text-green-600 flex-shrink-0" />
          </div>
        </div>
        <div className="bg-white p-4 lg:p-6 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xs lg:text-sm font-medium text-gray-500">Total de Inversiones</h3>
              <p className="text-2xl lg:text-3xl font-bold text-blue-600 mt-1">{stats.totalInvestments}</p>
            </div>
            <Target className="h-8 w-8 text-blue-600 flex-shrink-0" />
          </div>
        </div>
        <div className="bg-white p-4 lg:p-6 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xs lg:text-sm font-medium text-gray-500">Monto Total</h3>
              <p className="text-2xl lg:text-3xl font-bold text-purple-600 mt-1">
                {stats.totalInvestmentAmountFormatted}
              </p>
            </div>
            <DollarSign className="h-8 w-8 text-purple-600 flex-shrink-0" />
          </div>
        </div>
      </div>

      {/* Achievement Filters */}
      <div className="space-y-4">
        {/* Filter Badges */}
        <FilterBadges classes={classes} students={students} />
        
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Desktop Filters */}
          <AchievementFilters
            classes={classes}
            filters={filters}
            onFiltersChange={updateFilters}
            className="hidden lg:block"
          />
          
          {/* Mobile Filters */}
          <div className="block lg:hidden">
            <MobileFilters classes={classes} showStudentFilter={false} />
          </div>
        </div>
      </div>

      {/* Achievement Overview */}
      <AchievementsOverview 
        achievements={formatAchievementsForClient(achievements)}
        achievementStudentCounts={achievementStudentCounts}
        onProcess={handleProcessAchievements}
      />

      {/* Student Leaderboard */}
      <StudentLeaderboard 
        leaderboardData={leaderboardData}
        classes={classes}
        currentClassFilter={filters.classId}
        onClassFilterChange={(classId) => updateFilters({ classId })}
      />

      {/* Quick Actions - Responsive */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 lg:px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">Acciones Rápidas</h2>
        </div>
        <div className="p-4 lg:p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            <Link
              href={getUrlWithFilters("/admin/classes")}
              className="p-4 border border-gray-200 rounded-lg hover:border-indigo-300 hover:shadow-md transition-all"
            >
              <div className="flex items-center space-x-3">
                <GraduationCap className="h-8 w-8 text-indigo-600 flex-shrink-0" />
                <div className="min-w-0">
                  <h3 className="font-medium text-gray-900">Gestionar Clases</h3>
                  <p className="text-sm text-gray-500 mt-1 hidden sm:block">Crear, editar y gestionar configuraciones de clases</p>
                </div>
              </div>
            </Link>
            <Link
              href={getUrlWithFilters("/admin/students")}
              className="p-4 border border-gray-200 rounded-lg hover:border-indigo-300 hover:shadow-md transition-all"
            >
              <div className="flex items-center space-x-3">
                <Users className="h-8 w-8 text-green-600 flex-shrink-0" />
                <div className="min-w-0">
                  <h3 className="font-medium text-gray-900">Gestionar Estudiantes</h3>
                  <p className="text-sm text-gray-500 mt-1 hidden sm:block">Agregar, editar y gestionar registros de estudiantes</p>
                </div>
              </div>
            </Link>
            <Link
              href={getUrlWithFilters("/admin/investments")}
              className="p-4 border border-gray-200 rounded-lg hover:border-indigo-300 hover:shadow-md transition-all"
            >
              <div className="flex items-center space-x-3">
                <TrendingUp className="h-8 w-8 text-blue-600 flex-shrink-0" />
                <div className="min-w-0">
                  <h3 className="font-medium text-gray-900">Gestionar Inversiones</h3>
                  <p className="text-sm text-gray-500 mt-1 hidden sm:block">Rastrear y gestionar registros de inversiones</p>
                </div>
              </div>
            </Link>
            <Link
              href={getUrlWithFilters("/admin/interest-rates")}
              className="p-4 border border-gray-200 rounded-lg hover:border-indigo-300 hover:shadow-md transition-all"
            >
              <div className="flex items-center space-x-3">
                <Percent className="h-8 w-8 text-orange-600 flex-shrink-0" />
                <div className="min-w-0">
                  <h3 className="font-medium text-gray-900">Tasas de Interés</h3>
                  <p className="text-sm text-gray-500 mt-1 hidden sm:block">Establecer y gestionar el historial de tasas de interés</p>
                </div>
              </div>
            </Link>
            <Link
              href={getUrlWithFilters("/admin/categories")}
              className="p-4 border border-gray-200 rounded-lg hover:border-indigo-300 hover:shadow-md transition-all"
            >
              <div className="flex items-center space-x-3">
                <Tags className="h-8 w-8 text-pink-600 flex-shrink-0" />
                <div className="min-w-0">
                  <h3 className="font-medium text-gray-900">Categorías</h3>
                  <p className="text-sm text-gray-500 mt-1 hidden sm:block">Gestionar categorías de inversión</p>
                </div>
              </div>
            </Link>
            <Link
              href={getUrlWithFilters("/admin/achievements")}
              className="p-4 border border-gray-200 rounded-lg hover:border-indigo-300 hover:shadow-md transition-all"
            >
              <div className="flex items-center space-x-3">
                <Trophy className="h-8 w-8 text-yellow-600 flex-shrink-0" />
                <div className="min-w-0">
                  <h3 className="font-medium text-gray-900">Gestionar Logros</h3>
                  <p className="text-sm text-gray-500 mt-1 hidden sm:block">Gestionar logros y reconocimientos</p>
                </div>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
