import { auth, hasAuthConfig, hasGoogleConfig, requiresDatabase } from '@/auth'
import { redirect } from 'next/navigation'
import { AuthConfigError } from './auth-config'
import { DatabaseConnectionError, checkDatabaseConnection } from './db-check'

/**
 * Utility function to check authentication for admin pages
 * Returns the session if authenticated, redirects or shows config error if not
 */
export async function checkAdminAuth() {
  // If auth is not configured, return error component
  if (!hasAuthConfig || !hasGoogleConfig) {
    return { error: <AuthConfigError /> }
  }

  // If database is required but not available, check connectivity and show error
  if (requiresDatabase) {
    const dbConnected = await checkDatabaseConnection()
    if (!dbConnected) {
      console.error('Admin panel requires database connectivity but PostgreSQL is not accessible.')
      console.error('Please ensure PostgreSQL is running and properly configured in .env.local')
      console.error('Run "npm run db:test" to verify database connectivity')
      return { error: <DatabaseConnectionError /> }
    }
  }

  // Check authentication on server side
  let session
  try {
    session = await auth()
  } catch (error) {
    console.error('Auth error:', error)
    redirect('/admin/auth/signin')
  }
  
  if (!session) {
    redirect('/admin/auth/signin')
  }

  return { session }
}
