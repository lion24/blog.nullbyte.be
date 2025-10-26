# GitHub Copilot Instructions for NullByte Tech Blog

## Project Overview

This is a modern, full-featured blog built with Next.js 15, TypeScript, Prisma, PostgreSQL, NextAuth.js, and PlateJS rich text editor. The application features GitHub OAuth authentication, role-based access control, and comprehensive SEO optimization.

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript (strict mode)
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: NextAuth.js with GitHub OAuth
- **Editor**: PlateJS (Slate.js based)
- **Styling**: Tailwind CSS 4 with CSS custom properties
- **Deployment**: Vercel

## Code Quality Standards

### TypeScript

- **ALWAYS** use strict TypeScript - no `any` types
- Define proper types and interfaces for all data structures
- Use type inference where appropriate
- Prefer `unknown` over `any` when type is truly unknown
- Use discriminated unions for complex state

### Error Handling

- Always handle errors in async operations
- Use try-catch blocks in API routes
- Log errors with context using `console.error`
- Return appropriate HTTP status codes (400, 404, 500, etc.)
- Never expose internal errors to clients

## Architecture Patterns

### Next.js 15 App Router

- Use Server Components by default
- Only use `'use client'` when absolutely necessary (hooks, browser APIs, interactivity)
- Prefer Server Actions for mutations when possible
- Use proper loading and error boundaries
- Leverage parallel routes and intercepting routes where beneficial

### API Routes

- Follow REST conventions for HTTP methods
- Use `NextRequest` and `NextResponse` types
- Validate all inputs before processing
- Use middleware patterns for cross-cutting concerns
- Keep routes thin - delegate business logic to services/utils

### Database Patterns (Prisma)

- **CRITICAL**: Use atomic operations for counters and concurrent updates
  ```typescript
  // ✅ GOOD - Atomic increment
  data: { views: { increment: 1 } }

  // ❌ BAD - Race condition
  data: { views: post.views + 1 }
  ```
- Use `select` for field selection to minimize data transfer
- Add indexes for frequently queried fields
- Use transactions for related mutations
- Handle unique constraint violations gracefully
- Always use proper migrations (`prisma migrate`) - **NEVER** use `db push` for production

### Performance Optimization

- Use non-blocking operations where possible (fire-and-forget pattern for non-critical updates)
- Minimize database round trips
- Use Prisma's `select` to fetch only needed fields
- Add database indexes for common query patterns
- Optimize images with Next.js Image component
- Defer non-critical scripts (analytics, tracking)

### Authentication & Authorization

- Always verify authentication/authorization in protected routes
- Use helper functions from `@/lib/auth`: `requireAuth()`, `requireAdmin()`, `requireRole()`
- Check user roles before mutations
- **IMPORTANT**: User roles are only refreshed on sign-in
- Store minimal data in JWT sessions
- Never expose sensitive user data in API responses

### SEO Best Practices

- Always include comprehensive metadata (title, description, keywords)
- Use JSON-LD structured data for articles
- Include Open Graph and Twitter Card metadata
- Add featured images to social media metadata
- Generate dynamic sitemaps and robots.txt
- Use semantic HTML and proper heading hierarchy
- Include reading time estimates

### Environment Variables

- Use `server-only` package for server-side only code that accesses env vars
- Detect environment properly:
  ```typescript
  // ✅ GOOD - Proper environment detection
  if (process.env.VERCEL_ENV === 'production') {
    return process.env.VERCEL_PROJECT_PRODUCTION_URL
  }
  ```
- Never expose secrets in client-side code
- Use `NEXT_PUBLIC_` prefix only for truly public values

## PlateJS Editor Patterns

### Dual Rendering System

- Create both interactive (editor) and static (display) components for custom nodes
- Interactive nodes: `*-node.tsx` (for editing)
- Static nodes: `*-node-static.tsx` (for display)
- Register plugins in appropriate kits in `src/components/editor/plugins/`

### Content Structure

- Store editor content as JSON in database
- Calculate reading time from JSON content using `extractTextFromPlateJS`
- Use markdown transforms for import/export
- Handle empty content gracefully

## Common Patterns

### URL Construction

- Use utility functions from `@/lib/url`:
  ```typescript
  import { getBaseUrl, getFullUrl } from '@/lib/url'

  const baseUrl = getBaseUrl() // Environment-aware
  const fullUrl = getFullUrl('/posts/my-slug')
  ```

### Reading Time Calculation

- Use `calculateReadingTime()` from `@/lib/reading-time`
- Supports both string and PlateJS JSON content
- Based on 200 words per minute average
- Always format with `formatReadingTime()` for display

### Theme System

- Use CSS custom properties for all colors
- Support both light and dark themes
- Use theme-aware variables:
  ```typescript
  style={{ color: 'var(--text-primary)' }}
  style={{ backgroundColor: 'var(--background-secondary)' }}
  ```

## Git Workflow

### Database Migrations

- **ALWAYS** create proper migrations with `npx prisma migrate dev`
- **NEVER** use `npx prisma db push` for changes that will go to production
- Test migrations in development before deploying
- Include both up and down migrations when possible

### Commit Messages

- Use conventional commits format
- Be specific about changes and their purpose
- Reference issue numbers when applicable

## Testing

- Write tests for utility functions and business logic
- Use Jest with React Testing Library
- Mock external dependencies (database, APIs)
- Test error paths, not just happy paths

## Security

- Validate all user inputs
- Sanitize data before database operations
- Use parameterized queries (Prisma handles this)
- Implement rate limiting for API endpoints
- Never trust client-side data
- Use CSRF protection for mutations

## Common Pitfalls to Avoid

1. **Race Conditions**: Always use atomic operations for concurrent updates
2. **N+1 Queries**: Use Prisma's `include` or `select` with relations
3. **Missing Indexes**: Add indexes for frequently queried fields
4. **Memory Leaks**: Clean up event listeners and subscriptions
5. **Blocking Operations**: Use non-blocking patterns for non-critical updates
6. **Type Any**: Never use `any` - define proper types or use `unknown`
7. **Missing Error Handling**: Always handle promise rejections
8. **Client-Side Env Vars**: Use `server-only` for server-side code
9. **Static Generation with Dynamic Data**: Use `dynamic = 'force-dynamic'` for runtime data
10. **Database Push in Production**: Always use proper migrations

## File Organization

- API routes: `/src/app/api/`
- Pages: `/src/app/` (App Router)
- Components: `/src/components/`
- Utilities: `/src/lib/`
- Database: `/prisma/` (schema, migrations, seeds)
- Tests: Co-located with source files (`*.test.ts`)

## Review Focus Areas

When reviewing code, pay special attention to:

1. **Correctness**: Does the code do what it's supposed to do?
2. **Type Safety**: Are all types properly defined?
3. **Performance**: Are there potential bottlenecks or inefficiencies?
4. **Security**: Are there any security vulnerabilities?
5. **Error Handling**: Are errors properly caught and handled?
6. **Race Conditions**: Are concurrent operations handled safely?
7. **Database Patterns**: Are Prisma best practices followed?
8. **SEO**: Is metadata complete and correct?
9. **Accessibility**: Is the UI accessible to all users?
10. **Code Quality**: Is the code readable, maintainable, and well-documented?
