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

## Internationalization (i18n)

This project uses a **strongly typed, fully server-side i18n system** built on top of `next-intl`. This approach provides:

- **Type Safety**: Translation objects are fully typed with TypeScript classes
- **Server-Side**: All translations happen on the server, reducing client bundle size
- **Developer Experience**: No need for multiple `t()` calls - get structured translation objects
- **Props Drilling**: Easy to pass typed translations down to client components

### Translation System Architecture

#### Translation Files

Translation content is stored in TypeScript files (not JSON):

- `messages/en.ts` - English translations
- `messages/fr.ts` - French translations

Each file exports a `FullTranslation` object with all namespaces.

#### Namespace Classes

Each translation namespace has a corresponding TypeScript class in `messages/types/`:

- `CommonT` - Common UI text (buttons, navigation, etc.)
- `HomeT` - Homepage content
- `PostsT` - Post-related text
- `AdminT` - Admin interface text
- `AuthT` - Authentication messages
- `FooterT` - Footer content
- `ErrorsT` - Error messages
- And more...

These classes define the structure of translations and provide type safety.

### Using Translations in Server Components

Use the `localize()` function to get strongly typed translation objects:

```typescript
// app/[locale]/page.tsx
import { localize } from '@/i18n/localize'
import { HomeT, CommonT } from '@/messages/types'

export default async function HomePage() {
  // Get structured translation objects
  const home = await localize(HomeT)
  const common = await localize(CommonT)

  return (
    <div>
      <h1>{home.title}</h1>
      <p>{home.subtitle}</p>
      <p>{home.latestPosts}</p>
      
      {/* Pass to child components */}
      <Button translations={common} />
    </div>
  )
}
```

### Using Translations in Client Components

Client components receive translations as props from their parent server component:

```typescript
// components/MyButton.tsx
'use client'

import type { CommonT } from '@/messages/types'

interface ButtonProps {
  translations: CommonT  // Fully typed!
}

export function Button({ translations }: ButtonProps) {
  return (
    <button onClick={() => alert(translations.loading)}>
      {translations.signIn}
    </button>
  )
}
```

### Using Partial Translations (Subtypes)

You can pass only part of a namespace using TypeScript's indexed access types:

```typescript
// Server component
import { localize } from '@/i18n/localize'
import { AdminT } from '@/messages/types'

export default async function AdminPage() {
  const admin = await localize(AdminT)
  
  // Pass only the needed subset
  return <PostForm buttonLabels={admin} />
}

// Client component with partial translations
'use client'

interface PostFormProps {
  buttonLabels: Pick<AdminT, 'save' | 'cancel' | 'delete'>
}

export function PostForm({ buttonLabels }: PostFormProps) {
  return (
    <>
      <button>{buttonLabels.save}</button>
      <button>{buttonLabels.cancel}</button>
      <button>{buttonLabels.delete}</button>
    </>
  )
}
```

### Traditional next-intl Usage (Still Supported)

For simple cases or dynamic keys, you can still use the traditional `useTranslations()` and `getTranslations()`:

```typescript
// Server component
import { getTranslations } from 'next-intl/server'

const t = await getTranslations('common')
const text = t('signIn')

// Client component
'use client'
import { useTranslations } from 'next-intl'

const t = useTranslations('common')
const text = t('signIn')
```

However, prefer the `localize()` approach for better type safety and developer experience.

### Adding New Translations

To add a new translation namespace:

1. **Create the namespace class** in `messages/types/`:

```typescript
// messages/types/MyNewFeatureT.ts
import type { Translation } from './Translation'

export class MyNewFeatureT implements Translation {
  namespace?: keyof import('./FullTranslation').FullTranslation = 'myNewFeature'
  
  title = ''
  description = ''
  // ... other fields
}
```

2. **Add to FullTranslation type**:

```typescript
// messages/types/FullTranslation.ts
import type { MyNewFeatureT } from './MyNewFeatureT'

export type FullTranslation = {
  // ... existing namespaces
  myNewFeature: MyNewFeatureT
}
```

3. **Add translations to all language files**:

```typescript
// messages/en.ts
const en: FullTranslation = {
  // ... existing namespaces
  myNewFeature: {
    title: 'My Feature Title',
    description: 'Feature description',
  }
}

// messages/fr.ts
const fr: FullTranslation = {
  // ... existing namespaces
  myNewFeature: {
    title: 'Titre de ma fonctionnalité',
    description: 'Description de la fonctionnalité',
  }
}
```

4. **Export from index**:

```typescript
// messages/types/index.ts
export { MyNewFeatureT } from './MyNewFeatureT'
```

5. **Use in components**:

```typescript
import { localize } from '@/i18n/localize'
import { MyNewFeatureT } from '@/messages/types'

const translations = await localize(MyNewFeatureT)
```

### Benefits of This Approach

1. **Type Safety**: TypeScript will catch missing or misspelled translation keys at compile time
2. **Single Call**: Get all translations for a namespace with one function call instead of multiple `t()` calls
3. **Structured Props**: Pass complete or partial translation objects to child components with proper typing
4. **Server-Only**: No need for `NextIntlClientProvider` or client-side translation context
5. **Maintenance**: When adding/changing translations, TypeScript will highlight all affected files
6. **Autocomplete**: Full IDE autocomplete support for all translation keys

