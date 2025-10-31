# Blog Architecture: Server-Side Rendering with Private Admin API

## Overview

This blog uses a **two-tier architecture**:

1. **Public content**: Rendered server-side (no public API)
2. **Admin management**: Private API for authenticated users and external tools

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│ PUBLIC USERS                                                 │
└─────────────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────────┐
│ PUBLIC PAGES (Server Components)                             │
│ • /posts          → getPublishedPosts()                     │
│ • /posts/[slug]   → getPostBySlug()                         │
│ • / (home)        → getPublishedPosts(limit: 3)             │
└─────────────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────────┐
│ DATABASE (PostgreSQL via Prisma)                             │
│ • Direct queries from Server Components                      │
│ • No API layer needed for public content                     │
└─────────────────────────────────────────────────────────────┘


┌─────────────────────────────────────────────────────────────┐
│ ADMIN USERS / EXTERNAL TOOLS                                 │
└─────────────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────────┐
│ ADMIN PAGES (Client Components) / EXTERNAL TOOLS             │
│ • /admin          → fetch('/api/admin/posts')               │
│ • /admin/new      → POST to '/api/admin/posts'              │
│ • /admin/edit/[id] → PUT/DELETE '/api/admin/posts/[id]'     │
└─────────────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────────┐
│ MIDDLEWARE (Security Layer)                                  │
│ • Rate limiting                                              │
│ • Origin validation (CSRF protection)                        │
│ • Authentication check for /api/admin/*                      │
└─────────────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────────┐
│ ADMIN API ROUTES                                             │
│ • POST   /api/admin/posts      → requireAdmin()             │
│ • GET    /api/admin/posts      → requireAdmin()             │
│ • GET    /api/admin/posts/[id] → requireAdmin()             │
│ • PUT    /api/admin/posts/[id] → requireAdmin()             │
│ • DELETE /api/admin/posts/[id] → requireAdmin()             │
└─────────────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────────┐
│ DATABASE (PostgreSQL via Prisma)                             │
└─────────────────────────────────────────────────────────────┘
```

## Why This Architecture?

### Problem with Public API
```bash
# Anyone can query your API:
curl https://your-blog.com/api/posts

# Can't prevent unauthorized access to public endpoints
# Can't distinguish between "your frontend" vs "external tools"
```

### Solution: Server-Side Rendering
```typescript
// Server Component (runs on server, never exposed)
export default async function PostsPage() {
  const posts = await getPublishedPosts() // Direct DB query
  return <div>{/* render posts */}</div>
}
```

**Benefits:**
- ✅ No public API exposure
- ✅ Better SEO (server-rendered)
- ✅ Faster initial load (no client-side fetch)
- ✅ Simpler code (no loading states)

## Data Access Layer

Use `src/lib/posts.ts` instead of API calls:

```typescript
import { getPublishedPosts, getPostBySlug } from '@/lib/posts'

// In Server Components:
const posts = await getPublishedPosts()
const post = await getPostBySlug('my-slug')
```

## Admin API for Management

### Browser (Session Auth)
```typescript
// Admin pages use session cookies automatically
const response = await fetch('/api/admin/posts', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ title: 'New Post', content: '...' })
})
```

### External Tools (API Key)
```bash
# Set API_KEY in .env
export API_KEY="your-secret-key-here"

# Use with curl
curl -H "x-api-key: your-secret-key-here" \
  https://your-blog.com/api/admin/posts

# Create post
curl -X POST \
  -H "x-api-key: your-secret-key-here" \
  -H "Content-Type: application/json" \
  -d '{"title":"My Post","content":"..."}' \
  https://your-blog.com/api/admin/posts
```

## Security Layers

1. **Server Components**: No API → No exposure
2. **API Catch-All**: Returns JSON 404 for undefined endpoints (prevents data leakage)
3. **Authentication**: `requireAdmin()` checks session/API key
4. **Origin Validation**: Prevents CSRF attacks
5. **Rate Limiting**: Prevents abuse/spam

### Preventing Data Leakage

**Problem**: Without a catch-all API route, requests to non-existent API endpoints like `/api/posts` would be processed by Next.js's `[locale]` dynamic route, causing:
1. The locale route to treat "api" as a locale parameter
2. Server Components to run and fetch database data
3. Data to be serialized in the 404 page HTML (visible in script tags)

**Solution**: The catch-all route at `/api/[...notFound]/route.ts` intercepts all undefined API requests and returns a clean JSON 404:

```typescript
// /api/posts → {"error": "API endpoint not found"}
// /api/users → {"error": "API endpoint not found"}
// /api/anything → {"error": "API endpoint not found"}
```

This ensures:
- ✅ No Server Components execute for invalid API paths
- ✅ No database queries run
- ✅ No data serialized in HTML
- ✅ Clean JSON error responses
- ✅ Proper 404 status codes

## File Structure

```
src/
├── lib/
│   ├── posts.ts          # Data access layer (use in Server Components)
│   ├── api-auth.ts       # API key + session authentication
│   └── security.ts       # Origin validation, CSRF protection
├── app/
│   ├── [locale]/
│   │   ├── posts/
│   │   │   └── page.tsx           # Server Component → getPublishedPosts()
│   │   ├── posts/[slug]/
│   │   │   └── page.tsx           # Server Component → getPostBySlug()
│   │   └── admin/
│   │       ├── page.tsx           # Client Component → fetch API
│   │       ├── new/page.tsx       # Client Component → POST API
│   │       └── edit/[id]/page.tsx # Client Component → PUT/DELETE API
│   └── api/
│       ├── [...notFound]/
│       │   └── route.ts           # Catch-all: prevents data leakage
│       └── admin/
│           └── posts/
│               ├── route.ts       # Admin API (all methods auth required)
│               └── [id]/route.ts  # Admin API (all methods auth required)
```
