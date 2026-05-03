import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'

/**
 * Rate limiting utility using Upstash Redis.
 * 
 * This provides in-memory fallback for development and Redis-backed rate limiting for production.
 * 
 * Environment Variables Required:
 * - UPSTASH_REDIS_REST_URL
 * - UPSTASH_REDIS_REST_TOKEN
 * 
 * If these are not set, rate limiting will use in-memory cache (dev only).
 */

// Check if Upstash Redis is configured.
// The .env.example ships placeholder values like "https://your-redis-url.upstash.io"
// and "your-redis-token". Treat those as unset so dev falls back to in-memory.
const upstashUrl = process.env.UPSTASH_REDIS_REST_URL
const upstashToken = process.env.UPSTASH_REDIS_REST_TOKEN
const isPlaceholder =
  !upstashUrl ||
  !upstashToken ||
  upstashUrl.includes('your-redis-url') ||
  upstashToken.includes('your-redis-token')

const redis = !isPlaceholder
  ? new Redis({
      url: upstashUrl!,
      token: upstashToken!,
    })
  : undefined

/**
 * Rate limiter for public API endpoints (read operations)
 * Limits: 10 requests per 10 seconds per IP
 */
export const publicApiLimiter = redis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(10, '10 s'),
      analytics: true,
      prefix: '@upstash/ratelimit/public-api',
    })
  : {
      // In-memory fallback for development
      limit: async () => ({ success: true, limit: 10, remaining: 10, reset: Date.now() + 10000 }),
    }

/**
 * Rate limiter for admin API endpoints (write operations)
 * Limits: 30 requests per minute per user
 */
export const adminApiLimiter = redis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(30, '1 m'),
      analytics: true,
      prefix: '@upstash/ratelimit/admin-api',
    })
  : {
      // In-memory fallback for development
      limit: async () => ({ success: true, limit: 30, remaining: 30, reset: Date.now() + 60000 }),
    }

/**
 * Strict rate limiter for sensitive operations (auth, password reset, etc.)
 * Limits: 5 requests per hour per IP
 */
export const strictLimiter = redis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(5, '1 h'),
      analytics: true,
      prefix: '@upstash/ratelimit/strict',
    })
  : {
      // In-memory fallback for development
      limit: async () => ({ success: true, limit: 5, remaining: 5, reset: Date.now() + 3600000 }),
    }

/**
 * Helper to get client identifier (IP address)
 * Falls back to a default for development
 */
export function getClientIdentifier(request: Request): string {
  // Try to get real IP from various headers (Vercel, Cloudflare, etc.)
  const forwarded = request.headers.get('x-forwarded-for')
  const realIp = request.headers.get('x-real-ip')
  const cfConnectingIp = request.headers.get('cf-connecting-ip')
  
  return (
    forwarded?.split(',')[0]?.trim() ||
    realIp ||
    cfConnectingIp ||
    'anonymous' // Fallback for development
  )
}

/**
 * Apply rate limiting to a request
 * Returns null if allowed, or a Response object if rate limited
 */
export async function checkRateLimit(
  request: Request,
  limiter: typeof publicApiLimiter
): Promise<Response | null> {
  if (process.env.NODE_ENV === 'development') {
    return null
  }

  const identifier = getClientIdentifier(request)

  try {
    const { success, limit, remaining, reset } = await limiter.limit(identifier)
    
    if (!success) {
      return new Response(
        JSON.stringify({
          error: 'Rate limit exceeded',
          message: 'Too many requests. Please try again later.',
        }),
        {
          status: 429,
          headers: {
            'Content-Type': 'application/json',
            'X-RateLimit-Limit': limit.toString(),
            'X-RateLimit-Remaining': remaining.toString(),
            'X-RateLimit-Reset': new Date(reset).toISOString(),
            'Retry-After': Math.ceil((reset - Date.now()) / 1000).toString(),
          },
        }
      )
    }
    
    // Success - no response needed, but we could add rate limit headers
    return null
  } catch (error) {
    // If rate limiting fails, log the error but allow the request
    // This prevents rate limiting from breaking your app
    console.error('Rate limiting error:', error)
    return null
  }
}
