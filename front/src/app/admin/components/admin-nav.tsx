'use client'

import { signOut } from "next-auth/react"
import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { useEffect, useState } from "react"
import { useAdminFilters } from '@/presentation/features/admin/hooks/useAdminFilters'
import { Menu, X, Home, Users, TrendingUp, Percent, Trophy, Award, Tags, LogOut } from 'lucide-react'

// Icon mapping for navigation items
const navIcons: Record<string, React.ElementType> = {
  '/admin': Home,
  '/admin/classes': Users,
  '/admin/students': Users,
  '/admin/groups': Users,
  '/admin/investments': TrendingUp,
  '/admin/categories': Tags,
  '/admin/interest-rates': Percent,
  '/admin/achievements': Trophy,
  '/admin/achievements/manage': Award,
}

const navigation = [
  { name: 'Panel de Control', href: '/admin' },
  { name: 'Clases', href: '/admin/classes' },
  { name: 'Estudiantes', href: '/admin/students' },
  { name: 'Grupos', href: '/admin/groups' },
  { name: 'Inversiones', href: '/admin/investments' },
  { name: 'Categorías', href: '/admin/categories' },
  { name: 'Tasas de Interés', href: '/admin/interest-rates' },
  { name: 'Gestionar Logros', href: '/admin/achievements' },
  { name: 'Administrar Logros', href: '/admin/achievements/manage' },
  // { name: 'Debug Achievements', href: '/admin/achievements/debug' },
]

export default function AdminNav() {
  const [user, setUser] = useState<{ name?: string; email?: string; image?: string } | null>(null)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
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

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen)
  }

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false)
  }

  return (
    <>
      {/* Desktop and Mobile Navigation Bar */}
      <nav className="bg-white shadow relative z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            {/* Logo and Desktop Navigation */}
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <h1 className="text-xl font-bold text-gray-900">VCoin Admin</h1>
              </div>
              <div className="hidden lg:ml-6 lg:flex lg:space-x-8">
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

            {/* Desktop User Info */}
            <div className="hidden lg:flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <Image
                  className="h-8 w-8 rounded-full"
                  src={user?.image || '/default-avatar.png'}
                  alt=""
                  width={32}
                  height={32}
                />
                <div>
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
                Cerrar Sesión
              </button>
            </div>

            {/* Mobile menu button */}
            <div className="flex items-center lg:hidden">
              <span className="text-sm font-medium text-gray-700 mr-3">
                {user?.name?.split(' ')[0]}
              </span>
              <button
                onClick={toggleMobileMenu}
                className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500"
              >
                <span className="sr-only">Open main menu</span>
                {isMobileMenuOpen ? (
                  <X className="block h-6 w-6" />
                ) : (
                  <Menu className="block h-6 w-6" />
                )}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Drawer Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={closeMobileMenu}
        />
      )}

      {/* Mobile Drawer */}
      <div className={`fixed top-0 right-0 h-full w-80 bg-white shadow-xl transform transition-transform duration-300 ease-in-out z-50 lg:hidden ${
        isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'
      }`}>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-900">VCoin Admin</h2>
            <button
              onClick={closeMobileMenu}
              className="p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* User Info */}
          <div className="p-4 border-b border-gray-200 bg-gray-50">
            <div className="flex items-center space-x-3">
              <Image
                className="h-10 w-10 rounded-full"
                src={user?.image || '/default-avatar.png'}
                alt=""
                width={40}
                height={40}
              />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {user?.name}
                </p>
                <p className="text-xs text-gray-500 truncate">
                  {user?.email}
                </p>
              </div>
            </div>
          </div>

          {/* Navigation Links */}
          <div className="flex-1 overflow-y-auto py-4">
            <nav className="space-y-1 px-4">
              {navigation.map((item) => {
                const Icon = navIcons[item.href] || Home
                const isActive = pathname === item.href
                
                return (
                  <Link
                    key={item.name}
                    href={getUrlWithFilters(item.href)}
                    onClick={closeMobileMenu}
                    className={`${
                      isActive
                        ? 'bg-indigo-100 text-indigo-700'
                        : 'text-gray-700 hover:bg-gray-100 hover:text-indigo-600'
                    } group flex items-center px-3 py-3 text-sm font-medium rounded-md transition-colors`}
                  >
                    <Icon className={`${
                      isActive ? 'text-indigo-700' : 'text-gray-400 group-hover:text-indigo-600'
                    } w-5 h-5 mr-3`} />
                    {item.name}
                  </Link>
                )
              })}
            </nav>
          </div>

          {/* Logout Button */}
          <div className="border-t border-gray-200 p-4">
            <button
              onClick={() => signOut({ callbackUrl: '/' })}
              className="w-full flex items-center justify-center px-4 py-3 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 transition-colors"
            >
              <LogOut className="w-5 h-5 mr-2" />
              Cerrar Sesión
            </button>
          </div>
        </div>
      </div>
    </>
  )
}
