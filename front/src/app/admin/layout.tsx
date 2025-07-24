'use client'

import { Suspense } from "react"
import AdminNav from "./components/admin-nav"

// Force all admin pages to be dynamic for runtime evaluation
export const dynamic = 'force-dynamic'

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-gray-50">
      <Suspense fallback={<div>Loading navigation...</div>}>
        <AdminNav />
      </Suspense>
      <main className="py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {children}
        </div>
      </main>
    </div>
  )
}