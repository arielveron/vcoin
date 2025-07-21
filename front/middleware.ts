import { auth } from "@/auth"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export default auth((req: NextRequest & { auth: any }) => {
  const { pathname } = req.nextUrl

  // Protect admin routes
  if (pathname.startsWith('/admin')) {
    // Allow access to auth pages
    if (pathname.startsWith('/admin/auth/')) {
      return NextResponse.next()
    }

    // Check if user is authenticated
    if (!req.auth) {
      const signInUrl = new URL('/admin/auth/signin', req.url)
      signInUrl.searchParams.set('callbackUrl', pathname)
      return NextResponse.redirect(signInUrl)
    }
  }

  return NextResponse.next()
})

export const config = {
  matcher: ['/admin/:path*']
}
