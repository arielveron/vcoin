'use client'

import { signOut } from "next-auth/react"
import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { useEffect, useState } from "react"
import { useAdminFilters } from '@/hooks/useAdminFilters'
import { t } from '@/config/translations'

const navigation = [
  { name: t('nav.dashboard'), href: '/admin' },
  { name: t('nav.classes'), href: '/admin/classes' },
  { name: t('nav.students'), href: '/admin/students' },
  { name: t('nav.investments'), href: '/admin/investments' },
  { name: t('nav.categories'), href: '/admin/categories' },
  { name: t('nav.interestRates'), href: '/admin/interest-rates' },
  { name: t('achievements.manageAchievements'), href: '/admin/achievements' },
  { name: t('achievements.achievementManagement'), href: '/admin/achievements/manage' },
  { name: 'Debug Achievements', href: '/admin/achievements/debug' },
]

export default function AdminNav() {
  const [user, setUser] = useState<{ name?: string; email?: string; image?: string } | null>(null)
  const pathname = usePathname()
  const { getUrlWithFilters } = useAdminFilters()

  useEffect(() => {
    // Get session client-side for the navigation
    fetch('/api/auth/session')
      .then(res => res.json())
      .then(session => {
        if (session?.user) {
          setUser(session.user)
        }
      })
      .catch(console.error)
  }, [])

  if (!user) return null

  return (
    <nav className="bg-white shadow">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <h1 className="text-xl font-bold text-gray-900">VCoin Admin</h1>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={getUrlWithFilters(item.href)}
                  className={`${
                    pathname === item.href
                      ? 'border-indigo-500 text-gray-900'
                      : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                  } inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium`}
                >
                  {item.name}
                </Link>
              ))}
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-3">
              <Image
                className="h-8 w-8 rounded-full"
                src={user?.image || '/default-avatar.png'}
                alt=""
                width={32}
                height={32}
              />
              <div className="hidden sm:block">
                <p className="text-sm font-medium text-gray-700">
                  {user?.name}
                </p>
                <p className="text-xs text-gray-500">
                  {user?.email}
                </p>
              </div>
            </div>
            <button
              onClick={() => signOut({ callbackUrl: '/' })}
              className="bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded-md text-sm font-medium"
            >
              {t('nav.signOut')}
            </button>
          </div>
        </div>
      </div>
    </nav>
  )
}
