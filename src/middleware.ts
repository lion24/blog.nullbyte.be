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
  
  // Skip middleware for static files and Next.js internals
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/_static') ||
    pathname.startsWith('/_vercel') ||
    pathname.includes('.')
  ) {
    return NextResponse.next()
  }
  
  // Handle API routes with security measures
  if (pathname.startsWith('/api')) {
    // 1. Origin validation for state-changing requests
    // Skip origin validation for routes that use bearer token authentication
    // (service accounts), have their own session-based auth checks, or are NextAuth routes
    const skipOriginValidation = 
      pathname.startsWith('/api/auth') || // NextAuth routes handle their own security
      pathname.startsWith('/api/admin') || // Admin routes use NextAuth session
      pathname.startsWith('/api/posts') && request.headers.get('authorization') // Bearer token auth
    
    if (!skipOriginValidation) {
      // Set to `true` to also enforce origin validation for GET requests
      const enforceForGetRequests = false // Change to true if you want to restrict GET too
      const originError = validateOrigin(request, enforceForGetRequests)
      if (originError) {
        return originError
      }
    }
    
    // 2. Rate limiting
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
