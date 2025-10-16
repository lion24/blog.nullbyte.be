# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

This is a modern, full-featured blog built with Next.js 15, TypeScript, Prisma, PostgreSQL, and NextAuth.js. The application features a rich WYSIWYG editor (PlateJS) for blog post creation, GitHub OAuth authentication, role-based access control, and comprehensive tagging/categorization.

## Development Commands

### Running the Application

```bash
npm run dev              # Start development server with Turbopack
npm run build            # Build for production with Turbopack
npm start                # Start production server
npm run lint             # Run ESLint
```

### Database Operations

```bash
npm run db:seed          # Seed database with sample data (development)
npm run db:seed:prod     # Seed database (production mode)
npm run db:reset         # Reset database (drops all data)
npm run db:push          # Push schema changes without migrations
npm run db:migrate       # Create and run migrations
npm run db:studio        # Open Prisma Studio GUI
```

Additional Prisma commands:
```bash
npx prisma generate      # Regenerate Prisma Client after schema changes
```

## Architecture

### Authentication & Authorization

- **Authentication**: NextAuth.js with GitHub OAuth provider
- **Session Management**: JWT-based sessions (not database sessions)
- **Authorization**: Role-based access control (READER, ADMIN)
  - Admin role is stored in the database and loaded into JWT during sign-in
  - Auth helpers are in `src/lib/auth.ts`: `requireAuth()`, `requireAdmin()`, `requireRole()`
  - IMPORTANT: User roles are only refreshed on sign-in. If you modify a user's role, they must sign out and back in to see the change.

### Database Layer

- **ORM**: Prisma with PostgreSQL
- **Models**: User, Account, Post, Tag, Category
- **Relationships**:
  - Users → Posts (one-to-many)
  - Posts ↔ Tags (many-to-many via "PostToTag")
  - Posts ↔ Categories (many-to-many via "CategoryToPost")
- **Schema**: Located at `prisma/schema.prisma`
- **Fixtures**: Factory functions and test helpers in `prisma/fixtures/` for generating sample data

### PlateJS Editor Architecture

The blog uses PlateJS, a plugin-based rich text editor built on Slate.js. Understanding this architecture is critical for working with the editor.

- **Plugin System**: Editor functionality is organized into "kits" in `src/components/editor/plugins/`
  - Each kit registers plugins and their associated UI components
  - Kits follow naming convention: `*-base-kit.tsx` (core config) and `*-kit.tsx` (with UI)
- **Dual Rendering**: Components have two versions:
  - Interactive editor nodes (e.g., `code-node.tsx`) for editing
  - Static read-only nodes (e.g., `code-node-static.tsx`) for display
- **Editor State**: Stored as JSON in Post.content field
- **Markdown Support**: `markdown-kit.tsx` handles markdown serialization/deserialization
- **Custom Transforms**: `src/components/editor/transforms.ts` and `src/lib/markdown-joiner-transform.ts`

### API Routes Structure

All API routes follow Next.js 15 App Router conventions in `src/app/api/`:

- `/api/auth/[...nextauth]/route.ts` - NextAuth.js handler
- `/api/posts/` - Post CRUD operations
  - `GET /api/posts` - List posts (supports `?published=false` for drafts)
  - `POST /api/posts` - Create post (requires ADMIN)
  - `GET /api/posts/by-slug/[slug]` - Get post by slug
  - `GET /api/posts/[id]` - Get post by ID
  - `PUT/DELETE /api/posts/[id]` - Update/delete post (requires ADMIN)
- `/api/tags/` - Tag operations
- `/api/users/` - User management (requires ADMIN)

### Frontend Architecture

- **Framework**: Next.js 15 with App Router
- **Styling**: Tailwind CSS 4 with custom CSS variables for theming
- **Component Library**: Radix UI primitives + shadcn/ui patterns
- **State Management**: React hooks + NextAuth session
- **Pages**:
  - `/` - Homepage with post listings
  - `/posts` - All posts
  - `/posts/[slug]` - Individual post view
  - `/admin` - Admin dashboard (ADMIN only)
  - `/admin/new` - Create new post
  - `/admin/edit/[id]` - Edit existing post
  - `/admin/users` - User management
  - `/tags/[slug]` - Posts by tag

## Key Implementation Details

### Working with the Editor

When modifying or extending the PlateJS editor:

1. **Adding New Node Types**: Create both interactive and static components
2. **Plugin Registration**: Add to appropriate kit or create new kit in `src/components/editor/plugins/`
3. **Styling**: Editor uses Tailwind + custom variants defined in `src/components/ui/editor.tsx`
4. **Serialization**: Ensure markdown transforms are updated if adding new block types

### Admin Access Control

All admin routes and API endpoints must verify the user has ADMIN role:

```typescript
// In API routes
import { requireAdmin } from '@/lib/auth'
const session = await requireAdmin()
if (session instanceof NextResponse) return session // Error response

// In page components
import { useSession } from 'next-auth/react'
const { data: session } = useSession()
if (session?.user?.role !== Role.ADMIN) // Handle unauthorized
```

### Database Seeding

The seed script (`prisma/seed.ts`) uses factory functions from `prisma/fixtures/factories.ts`:

- `createUser()`, `createAdminUser()` - Generate users
- `createPost()` - Generate posts with sample content
- `createTag()`, `createCategory()` - Generate taxonomy
- Includes predefined `defaultTags`, `defaultCategories`, and `samplePostContents`

## Environment Variables

Required environment variables (see `.env.example`):

- `DATABASE_URL` - PostgreSQL connection string
- `NEXTAUTH_URL` - Application URL
- `NEXTAUTH_SECRET` - Random secret for JWT signing
- `GITHUB_CLIENT_ID`, `GITHUB_CLIENT_SECRET` - GitHub OAuth credentials
- `OPENAI_API_KEY` - For AI editor features (optional)
- `BLOB_READ_WRITE_TOKEN` - Vercel Blob Storage token for media uploads

## Common Workflows

### Creating a New Post

Posts are created through the admin interface at `/admin/new` which uses the PlateJS editor. Content is stored as JSON in the database and rendered using static components for display.

### Adding a New Admin User

Users authenticate via GitHub OAuth and are created as READER by default. To promote to ADMIN:

```bash
npm run db:studio
# Update user role to ADMIN in Prisma Studio
# User must sign out and back in for role change to take effect
```

### Modifying Database Schema

1. Edit `prisma/schema.prisma`
2. Run `npm run db:migrate` to create and apply migration
3. Update TypeScript types if needed (Prisma auto-generates most types)
4. Update seed script if new fields/models added
