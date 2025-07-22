import Link from "next/link"

// Force dynamic rendering to avoid static generation issues
export const dynamic = 'force-dynamic'

export default function AuthError() {
  // Simple static error page to avoid build issues
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Authentication Error
          </h2>
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-md">
            <p className="text-sm text-red-800">
              An error occurred during authentication. Please try again.
            </p>
          </div>
        </div>
        <div className="flex space-x-4">
          <Link
            href="/admin/auth/signin"
            className="flex-1 text-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Try Again
          </Link>
          <Link
            href="/"
            className="flex-1 text-center py-2 px-4 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Go Home
          </Link>
        </div>
      </div>
    </div>
  )
}
