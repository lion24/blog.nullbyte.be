/**
 * Origin validation utility to prevent CSRF and unauthorized cross-origin requests.
 * 
 * This checks the Origin and Referer headers to ensure requests come from allowed domains.
 */

/**
 * Get allowed origins based on environment
 */
export function getAllowedOrigins(): string[] {
  const origins: string[] = []
  
  // Add production URL
  if (process.env.NEXTAUTH_URL) {
    origins.push(process.env.NEXTAUTH_URL)
  }
  
  // Add Vercel preview URLs
  if (process.env.VERCEL_URL) {
    origins.push(`https://${process.env.VERCEL_URL}`)
  }
  
  // Add localhost for development
  if (process.env.NODE_ENV === 'development') {
    origins.push('http://localhost:3000', 'http://127.0.0.1:3000')
  }
  
  return origins
}

/**
 * Check if origin is allowed
 */
export function isOriginAllowed(origin: string | null): boolean {
  if (!origin) {
    return false
  }
  
  const allowedOrigins = getAllowedOrigins()
  
  // Check exact match
  if (allowedOrigins.includes(origin)) {
    return true
  }
  
  // Check if it's a localhost URL (any port)
  if (process.env.NODE_ENV === 'development') {
    try {
      const url = new URL(origin)
      if (url.hostname === 'localhost' || url.hostname === '127.0.0.1') {
        return true
      }
    } catch {
      // Invalid URL
    }
  }
  
  // Check if it's a Vercel preview URL (deployment previews)
  if (origin.includes('.vercel.app') && process.env.VERCEL_PROJECT_PRODUCTION_URL) {
    return true
  }
  
  return false
}

/**
 * Validate request origin for all API requests
 * Returns null if valid, or a Response object if invalid
 * 
 * @param enforceForGetRequests - If true, also validates GET/HEAD/OPTIONS (default: false)
 */
export function validateOrigin(request: Request, enforceForGetRequests = false): Response | null {
  const method = request.method
  
  // By default, only check origin for state-changing methods
  // GET, HEAD, OPTIONS are typically safe and don't require origin validation
  if (!enforceForGetRequests && !['POST', 'PUT', 'DELETE', 'PATCH'].includes(method)) {
    return null // GET, HEAD, OPTIONS are safe from CSRF
  }
  
  const origin = request.headers.get('origin')
  const referer = request.headers.get('referer')
  
  // If neither origin nor referer is present, it could be:
  // 1. Same-origin request (browser may omit origin)
  // 2. Direct API call (no browser)
  // 3. Malicious request trying to bypass checks
  // 
  // For now, we'll allow requests without origin/referer in development
  // and require at least one in production
  if (!origin && !referer) {
    if (process.env.NODE_ENV === 'development') {
      return null // Allow in development
    }
    
    // In production, require at least one
    return new Response(
      JSON.stringify({
        error: 'Invalid origin',
        message: 'Request origin is not allowed.',
      }),
      {
        status: 403,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    )
  }
  
  // Check origin first
  if (origin && isOriginAllowed(origin)) {
    return null // Valid origin
  }
  
  // Fallback to referer check
  if (referer) {
    try {
      const refererUrl = new URL(referer)
      const refererOrigin = `${refererUrl.protocol}//${refererUrl.host}`
      
      if (isOriginAllowed(refererOrigin)) {
        return null // Valid referer
      }
    } catch {
      // Invalid referer URL
    }
  }
  
  // Neither origin nor referer is valid
  return new Response(
    JSON.stringify({
      error: 'Invalid origin',
      message: 'Request origin is not allowed.',
    }),
    {
      status: 403,
      headers: {
        'Content-Type': 'application/json',
      },
    }
  )
}

/**
 * Simple CSRF token generation and validation
 * Uses a secret-based approach without external dependencies
 */

const CSRF_HEADER_NAME = 'x-csrf-token'
const CSRF_COOKIE_NAME = 'csrf-token'

/**
 * Generate a CSRF token
 * This should be called when rendering forms or pages that will make state-changing requests
 */
export async function generateCsrfToken(): Promise<string> {
  // In production, you might want to use a more sophisticated approach
  // For now, we'll use a combination of timestamp and random data
  const timestamp = Date.now().toString(36)
  const random = Math.random().toString(36).substring(2, 15)
  
  // Create a simple token
  const token = `${timestamp}-${random}`
  
  // In a real implementation, you might want to sign this token
  // using a secret key to prevent tampering
  return token
}

/**
 * Validate CSRF token from request
 * Checks both header and cookie
 */
export function validateCsrfToken(request: Request): boolean {
  const method = request.method
  
  // Only check CSRF for state-changing methods
  if (!['POST', 'PUT', 'DELETE', 'PATCH'].includes(method)) {
    return true // GET, HEAD, OPTIONS don't need CSRF protection
  }
  
  // Get token from header
  const headerToken = request.headers.get(CSRF_HEADER_NAME)
  
  // Get token from cookie
  const cookieHeader = request.headers.get('cookie')
  let cookieToken: string | null = null
  
  if (cookieHeader) {
    const cookies = cookieHeader.split(';').map((c) => c.trim())
    const csrfCookie = cookies.find((c) => c.startsWith(`${CSRF_COOKIE_NAME}=`))
    
    if (csrfCookie) {
      cookieToken = csrfCookie.split('=')[1]
    }
  }
  
  // Both must exist and match
  if (!headerToken || !cookieToken) {
    return false
  }
  
  return headerToken === cookieToken
}

/**
 * Create CSRF validation response
 */
export function createCsrfErrorResponse(): Response {
  return new Response(
    JSON.stringify({
      error: 'Invalid CSRF token',
      message: 'CSRF token validation failed. Please refresh the page and try again.',
    }),
    {
      status: 403,
      headers: {
        'Content-Type': 'application/json',
      },
    }
  )
}
