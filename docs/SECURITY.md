# Security Architecture

This document outlines the comprehensive security measures implemented in the NullByte Tech Blog to protect APIs, prevent abuse, and ensure data integrity.

## Defense-in-Depth Strategy

We implement multiple layers of security that work together:

1. **Origin Validation**: Verify requests come from trusted sources
2. **Rate Limiting**: Prevent abuse and DoS attacks
3. **CSRF Protection**: Secure state-changing operations
4. **Authentication & Authorization**: Role-based access control
5. **Middleware Security**: Centralized security enforcement

## 1. Origin Validation

### Purpose
Prevent unauthorized domains from accessing your APIs, protecting against scraping and CSRF attacks.

### Implementation
Located in `src/lib/security.ts`, the `validateOrigin()` function checks the request origin against allowed domains:

```typescript
const allowedOrigins = getAllowedOrigins()
const origin = request.headers.get('origin')
const referer = request.headers.get('referer')

if (!isOriginAllowed(origin) && !isOriginAllowed(referer)) {
  return createOriginErrorResponse()
}
```

### Allowed Origins
- **Production**: Your `NEXTAUTH_URL` domain
- **Vercel Deployments**: All `*.vercel.app` URLs when `VERCEL_PROJECT_PRODUCTION_URL` is set
- **Development**: Any `localhost` or `127.0.0.1` URL (any port)

### Behavior
- **Development**: Origin validation is permissive to allow easier testing
  - Allows any localhost port
  - Allows requests without origin/referer headers
- **Production**: Strict validation
  - Requires exact domain match or Vercel deployment URL
  - Requires at least origin OR referer header for state-changing requests
  - Rejects unauthorized domains with 403 error

### Configuration
Set `NEXTAUTH_URL` in your `.env`:
```bash
NEXTAUTH_URL="https://yourdomain.com"
```

Origin validation runs automatically in middleware for all `/api` routes with state-changing methods (POST, PUT, DELETE, PATCH).

## 2. Rate Limiting

### Purpose
Protect against brute force attacks, API abuse, and excessive resource consumption.

### Implementation
Located in `src/lib/rate-limit.ts`, using Upstash Redis for distributed rate limiting with in-memory fallback.

### Rate Limiting Tiers

#### Public API Limiter (Default)
```typescript
publicApiLimiter: 10 requests per 10 seconds
```
- **Use Case**: General API endpoints
- **Example**: Blog posts, tags, public content
- **Response**: 429 status with retry-after header

#### Admin API Limiter
```typescript
adminApiLimiter: 30 requests per 60 seconds
```
- **Use Case**: Authenticated admin operations
- **Example**: Creating posts, managing users
- **Higher Limit**: Trusted users need more flexibility

#### Strict Limiter
```typescript
strictLimiter: 5 requests per 3600 seconds (1 hour)
```
- **Use Case**: Sensitive operations
- **Example**: Password reset, account creation
- **Very Restrictive**: Prevents brute force attacks

### Usage Example

```typescript
import { checkRateLimit, publicApiLimiter } from '@/lib/rate-limit'

export async function GET(request: NextRequest) {
  const rateLimitResult = await checkRateLimit(request, publicApiLimiter)
  
  if (!rateLimitResult.success) {
    return rateLimitResult.response // 429 Too Many Requests
  }

  // Process request...
}
```

### Redis Configuration

#### Production (Recommended)
Use Upstash Redis for distributed rate limiting across multiple instances:

1. Create free account at [upstash.com](https://upstash.com)
2. Create a Redis database
3. Copy REST URL and token to `.env`:

```bash
UPSTASH_REDIS_REST_URL="https://your-redis-url.upstash.io"
UPSTASH_REDIS_REST_TOKEN="your-redis-token"
```

#### Development (Fallback)
If Redis credentials are not configured, rate limiting uses in-memory storage:
- ⚠️ **Warning**: In-memory limits are **per-instance** only
- Not suitable for production with multiple servers
- Fine for local development and testing

### Client Identification

Rate limits are applied per client using this priority order:
1. `x-forwarded-for` header (for proxied requests)
2. Request IP address
3. User ID from session (if authenticated)
4. Fallback to "anonymous"

## 3. CSRF Protection

### Purpose
Prevent Cross-Site Request Forgery attacks on state-changing operations.

### Implementation
Located in `src/lib/security.ts`:

```typescript
// Generate token
const token = await generateCsrfToken(userId)

// Validate token
const isValid = await validateCsrfToken(token, userId)
```

### Token Structure
```typescript
{
  token: string,      // Unique identifier
  userId: string,     // Associated user
  expiresAt: Date    // Expiration time (1 hour)
}
```

### Usage Pattern

#### Server-Side (Generate Token)
```typescript
import { generateCsrfToken } from '@/lib/security'

export async function GET() {
  const session = await getServerSession(authOptions)
  const token = await generateCsrfToken(session.user.id)
  
  return NextResponse.json({ csrfToken: token })
}
```

#### Client-Side (Include Token)
```typescript
const response = await fetch('/api/posts', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'X-CSRF-Token': csrfToken
  },
  body: JSON.stringify(data)
})
```

#### Server-Side (Validate Token)
```typescript
import { validateCsrfToken } from '@/lib/security'

export async function POST(request: NextRequest) {
  const token = request.headers.get('x-csrf-token')
  const session = await getServerSession(authOptions)
  
  if (!await validateCsrfToken(token, session.user.id)) {
    return createCsrfErrorResponse()
  }

  // Process request...
}
```

### Token Expiration
- **Lifetime**: 1 hour from generation
- **Storage**: In-memory Map (consider Redis for production)
- **Cleanup**: Automatic on validation check

## 4. Middleware Security

### Centralized Enforcement
Located in `src/middleware.ts`, security runs before route handlers:

```typescript
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // 1. Origin validation for all API routes
  if (pathname.startsWith('/api')) {
    const originValidation = validateOrigin(request)
    if (originValidation) return originValidation
  }

  // 2. Rate limiting for all API routes
  if (pathname.startsWith('/api')) {
    const rateLimitResult = await checkRateLimit(request, publicApiLimiter)
    if (!rateLimitResult.success) {
      return rateLimitResult.response
    }
  }

  // 3. Internationalization
  return handleI18nRouting(request)
}
```

### Security Flow
1. **Origin Check**: Reject unauthorized domains
2. **Rate Limit**: Enforce request quotas
3. **Route Handler**: Process authenticated request
4. **Authorization**: Check user roles (in route handler)

### Excluded Routes
Some routes bypass rate limiting:
- `/api/auth/*` - NextAuth.js handles its own security
- Add to `config.matcher` exclusions if needed

## 5. Authentication & Authorization

### NextAuth.js Integration
Authentication is handled by NextAuth.js with GitHub OAuth.

### Role-Based Access Control

#### User Roles
```typescript
enum Role {
  USER    // Standard user (read-only)
  EDITOR  // Can create/edit posts
  ADMIN   // Full access
}
```

#### Helper Functions
Located in `src/lib/auth.ts`:

```typescript
// Require authentication
const session = await requireAuth()

// Require admin role
const session = await requireAdmin()

// Require specific role
const session = await requireRole(Role.EDITOR)
```

#### Usage in API Routes
```typescript
import { requireAdmin } from '@/lib/auth'

export async function POST(request: NextRequest) {
  // Throws if not authenticated or not admin
  await requireAdmin()

  // Admin-only operation...
}
```

### Session Security
- **Storage**: JWT tokens (stateless)
- **Expiration**: Configurable in `authOptions`
- **Refresh**: Only on sign-in (roles cached in session)

## 6. Server Actions vs API Routes

### Preferred: Server Actions
For internal operations, prefer Server Actions over API routes:

**Advantages:**
- No API endpoint exposure
- Automatic CSRF protection
- Type-safe between client and server
- Better performance (no extra network hop)

**Example:**
```typescript
'use server'

import { requireAuth } from '@/lib/auth'

export async function createPost(data: PostInput) {
  await requireAuth()
  
  // Direct database operation
  return await prisma.post.create({ data })
}
```

### When to Use API Routes
Keep API routes for:
- External integrations (webhooks, n8n, Zapier)
- Public APIs (RSS feeds, JSON feeds)
- Third-party service callbacks (OAuth, payments)

## 7. Security Best Practices

### Input Validation
```typescript
// Always validate input
const schema = z.object({
  title: z.string().min(1).max(200),
  content: z.string().min(1)
})

const validated = schema.parse(data)
```

### Error Handling
```typescript
// Never expose internal errors
try {
  await riskyOperation()
} catch (error) {
  console.error('Internal error:', error)
  return NextResponse.json(
    { error: 'Something went wrong' },
    { status: 500 }
  )
}
```

### Database Security
```typescript
// Use Prisma's parameterized queries (automatic)
await prisma.post.findMany({
  where: { authorId: userId }
})

// Never use raw SQL without parameterization
```

### Environment Variables
```typescript
// Use server-only package
import 'server-only'

// Never expose secrets to client
const secret = process.env.SECRET_KEY
```

## 8. Security Checklist

### Deployment
- [ ] Set `NEXTAUTH_URL` to production domain
- [ ] Configure Upstash Redis for rate limiting
- [ ] Enable HTTPS only (force SSL)
- [ ] Set secure cookie flags in `authOptions`
- [ ] Configure CORS properly
- [ ] Set up CSP headers
- [ ] Enable rate limiting on all API routes
- [ ] Review and test origin validation

### Development
- [ ] Never commit `.env` files
- [ ] Use `.env.example` for documentation
- [ ] Test rate limits locally
- [ ] Verify CSRF protection on mutations
- [ ] Test authentication flows
- [ ] Review role permissions

### Monitoring
- [ ] Log authentication failures
- [ ] Monitor rate limit hits
- [ ] Track origin validation failures
- [ ] Set up alerts for suspicious activity
- [ ] Review security logs regularly

## 9. Testing Security

### Manual Testing

#### Test Origin Validation
```bash
# Should be rejected
curl -H "Origin: https://evil.com" https://yourdomain.com/api/posts

# Should be allowed
curl -H "Origin: https://yourdomain.com" https://yourdomain.com/api/posts
```

#### Test Rate Limiting
```bash
# Send 11 requests quickly (should get 429 on 11th)
for i in {1..11}; do
  curl https://yourdomain.com/api/posts
done
```

#### Test CSRF Protection
```bash
# Without token (should fail)
curl -X POST https://yourdomain.com/api/posts \
  -H "Content-Type: application/json" \
  -d '{"title":"Test"}'

# With token (should succeed if authenticated)
curl -X POST https://yourdomain.com/api/posts \
  -H "Content-Type: application/json" \
  -H "X-CSRF-Token: your-token" \
  -d '{"title":"Test"}'
```

### Automated Testing
Consider adding security tests in your test suite:

```typescript
describe('API Security', () => {
  it('should reject requests from unauthorized origins', async () => {
    const response = await fetch('/api/posts', {
      headers: { origin: 'https://evil.com' }
    })
    expect(response.status).toBe(403)
  })

  it('should enforce rate limits', async () => {
    // Make 11 requests
    const responses = await Promise.all(
      Array(11).fill(null).map(() => fetch('/api/posts'))
    )
    
    const lastResponse = responses[responses.length - 1]
    expect(lastResponse.status).toBe(429)
  })
})
```

## 10. Incident Response

### If Rate Limit is Hit
1. Check if legitimate traffic spike
2. Review rate limit configuration
3. Consider adjusting limits for specific endpoints
4. Investigate potential DDoS attack

### If Origin Validation Fails
1. Verify allowed origins configuration
2. Check if legitimate domain is blocked
3. Review logs for attack patterns
4. Update allowed origins if needed

### If CSRF Attack Detected
1. Invalidate all CSRF tokens
2. Force user re-authentication
3. Review recent suspicious activities
4. Update CSRF implementation if needed

## Resources

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Next.js Security](https://nextjs.org/docs/app/building-your-application/security)
- [Upstash Rate Limiting](https://upstash.com/docs/redis/features/ratelimiting)
- [NextAuth.js Security](https://next-auth.js.org/configuration/options#security)

## Support

For security concerns or questions:
1. Review this documentation
2. Check `CLAUDE.md` for implementation details
3. Consult Next.js and NextAuth.js documentation
4. Open a GitHub issue for clarification
