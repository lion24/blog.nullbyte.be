import createIntlMiddleware from 'next-intl/middleware'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { routing } from './i18n/routing'
import { checkRateLimit, publicApiLimiter, adminApiLimiter } from './lib/rate-limit'
import { validateOrigin } from './lib/security'

// Create the i18n middleware
const intlMiddleware = createIntlMiddleware(routing)

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  
  // Skip middleware for static files, Next.js internals, and metadata routes
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/_static') ||
    pathname.startsWith('/_vercel') ||
    pathname === '/icon' ||
    pathname === '/apple-icon' ||
    pathname === '/robots.txt' ||
    pathname === '/sitemap.xml' ||
    pathname.includes('.')
  ) {
    return NextResponse.next()
  }
  
  // Handle API routes with security measures
  if (pathname.startsWith('/api')) {
    // API routes are protected by their own authentication mechanisms:
    // - NextAuth session checks for admin routes
    // - Bearer token authentication for service accounts
    // - Route-specific authorization logic
    // Therefore, we skip origin validation for all API routes
    
    // Rate limiting
    // Admin API routes need stricter rate limiting
    const isAdminRoute = pathname.startsWith('/api/admin')
    const limiter = isAdminRoute ? adminApiLimiter : publicApiLimiter
    
    const rateLimitError = await checkRateLimit(request, limiter)
    if (rateLimitError) {
      return rateLimitError
    }
    
    // API route is allowed - continue
    return NextResponse.next()
  }
  
  // Handle all other routes with i18n middleware
  return intlMiddleware(request)
}

export const config = {
  // Match all pathnames except for Next.js internals and static files
  matcher: ['/((?!_next|_static|_vercel|.*\\..*).*)'],
}
