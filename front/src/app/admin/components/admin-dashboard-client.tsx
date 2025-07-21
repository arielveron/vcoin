'use client'

import Link from "next/link"
import { AdminStats } from '@/services/admin-service'
import { Class, Student } from '@/types/database'
import { useAdminFilters } from '@/hooks/useAdminFilters'
import FilterBadges from './filter-badges'
import { t } from '@/config/translations'

interface AdminDashboardClientProps {
  stats: AdminStats
  user: any
  classes: Class[]
  students: Student[]
}

export default function AdminDashboardClient({ stats, user, classes, students }: AdminDashboardClientProps) {
  const { getUrlWithFilters } = useAdminFilters()

  return (
    <div>
      {/* Filter Badges */}
      <FilterBadges classes={classes} students={students} />

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">{t('dashboard.title')}</h1>
        <p className="mt-2 text-gray-600">
          {t('dashboard.welcome', { name: user?.name })}
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500">{t('dashboard.totalClasses')}</h3>
          <p className="text-3xl font-bold text-indigo-600">{stats.totalClasses}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500">{t('dashboard.totalStudents')}</h3>
          <p className="text-3xl font-bold text-green-600">{stats.totalStudents}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500">{t('dashboard.totalInvestments')}</h3>
          <p className="text-3xl font-bold text-blue-600">{stats.totalInvestments}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500">{t('dashboard.totalAmount')}</h3>
          <p className="text-3xl font-bold text-purple-600">
            {stats.totalInvestmentAmountFormatted}
          </p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">{t('dashboard.quickActions')}</h2>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Link
              href={getUrlWithFilters("/admin/classes")}
              className="p-4 border border-gray-200 rounded-lg hover:border-indigo-300 hover:shadow-md transition-all"
            >
              <h3 className="font-medium text-gray-900">{t('dashboard.manageClasses')}</h3>
              <p className="text-sm text-gray-500 mt-1">{t('dashboard.manageClassesDesc')}</p>
            </Link>
            <Link
              href={getUrlWithFilters("/admin/students")}
              className="p-4 border border-gray-200 rounded-lg hover:border-indigo-300 hover:shadow-md transition-all"
            >
              <h3 className="font-medium text-gray-900">{t('dashboard.manageStudents')}</h3>
              <p className="text-sm text-gray-500 mt-1">{t('dashboard.manageStudentsDesc')}</p>
            </Link>
            <Link
              href={getUrlWithFilters("/admin/investments")}
              className="p-4 border border-gray-200 rounded-lg hover:border-indigo-300 hover:shadow-md transition-all"
            >
              <h3 className="font-medium text-gray-900">{t('dashboard.manageInvestments')}</h3>
              <p className="text-sm text-gray-500 mt-1">{t('dashboard.manageInvestmentsDesc')}</p>
            </Link>
            <Link
              href={getUrlWithFilters("/admin/interest-rates")}
              className="p-4 border border-gray-200 rounded-lg hover:border-indigo-300 hover:shadow-md transition-all"
            >
              <h3 className="font-medium text-gray-900">{t('dashboard.manageInterestRates')}</h3>
              <p className="text-sm text-gray-500 mt-1">{t('dashboard.manageInterestRatesDesc')}</p>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
