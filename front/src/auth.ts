import NextAuth from "next-auth"
import Google from "next-auth/providers/google"
import PostgresAdapter from "@auth/pg-adapter"
import { pool } from '@/config/database'

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: PostgresAdapter(pool),
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    })
  ],
  callbacks: {
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
      // Add user ID to session
      if (session.user) {
        (session.user as { id?: string }).id = user.id
      }
      return session
    }
  },
  pages: {
    signIn: '/admin/auth/signin',
    error: '/admin/auth/error',
  },
  session: {
    strategy: "database",
  },
})
