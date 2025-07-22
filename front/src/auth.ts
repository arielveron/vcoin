import NextAuth from "next-auth"
import Google from "next-auth/providers/google"
import PostgresAdapter from "@auth/pg-adapter"
import { pool } from '@/config/database'

// Check if required auth environment variables are present
const hasAuthConfig = !!(
  process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET
)

const hasGoogleConfig = !!(
  process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
)

// Check if database is available
const hasDatabaseConfig = !!(
  process.env.DB_HOST && process.env.DB_NAME && process.env.DB_USER
)

// For admin authentication, we always require database connectivity for session storage
const requiresDatabase = hasAuthConfig && hasGoogleConfig && hasDatabaseConfig && process.env.USE_DATABASE !== 'false'

export const { handlers, signIn, signOut, auth } = NextAuth({
  secret: process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET,
  adapter: requiresDatabase ? PostgresAdapter(pool) : undefined,
  providers: hasGoogleConfig ? [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    })
  ] : [],
  callbacks: hasAuthConfig && hasGoogleConfig ? {
    async signIn({ user }) {
      // Only allow specific admin emails or domains
      const adminEmails = process.env.ADMIN_EMAILS?.split(',') || []
      const adminDomains = process.env.ADMIN_DOMAINS?.split(',') || []
      
      if (!user.email) return false
      
      // Check if email is in admin list
      if (adminEmails.includes(user.email)) return true
      
      // Check if email domain is allowed
      const emailDomain = user.email.split('@')[1]
      if (adminDomains.includes(emailDomain)) return true
      
      // For development, allow any email
      if (process.env.NODE_ENV === 'development') return true
      
      return false
    },
    async session({ session, user }) {
      // Add user ID to session if using database sessions
      if (session.user && user) {
        (session.user as { id?: string }).id = user.id
      }
      return session
    }
  } : {},
  pages: hasAuthConfig && hasGoogleConfig ? {
    signIn: '/admin/auth/signin',
    error: '/admin/auth/error',
  } : {},
  session: requiresDatabase ? {
    strategy: "database" as const,
  } : {
    strategy: "jwt" as const,
  },
})

// Export configuration flags for other components to check
export { hasAuthConfig, hasGoogleConfig, hasDatabaseConfig, requiresDatabase }
