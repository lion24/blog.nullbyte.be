import { Prisma, Role } from '@prisma/client'

// Helper function to generate unique slugs
const slugify = (text: string): string => {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

// User factory
export const createUser = (overrides?: Partial<Prisma.UserCreateInput>): Prisma.UserCreateInput => {
  const timestamp = Date.now()
  const random = Math.floor(Math.random() * 1000)
  
  return {
    name: `User ${timestamp}-${random}`,
    email: `user-${timestamp}-${random}@example.com`,
    emailVerified: new Date(),
    role: Role.READER,
    image: `https://api.dicebear.com/7.x/avataaars/svg?seed=${timestamp}`,
    ...overrides
  }
}

// Admin user factory
export const createAdminUser = (overrides?: Partial<Prisma.UserCreateInput>): Prisma.UserCreateInput => {
  return createUser({
    role: Role.ADMIN,
    ...overrides
  })
}

// Post factory
export const createPost = (
  authorId: string,
  overrides?: Partial<Prisma.PostUncheckedCreateInput>
): Prisma.PostUncheckedCreateInput => {
  const timestamp = Date.now()
  const random = Math.floor(Math.random() * 1000)
  const title = overrides?.title || `Post Title ${timestamp}-${random}`
  
  return {
    title,
    slug: slugify(title),
    content: `# ${title}\n\nThis is the content of the post.\n\n## Section 1\nLorem ipsum dolor sit amet, consectetur adipiscing elit.\n\n## Section 2\nSed do eiusmod tempor incididunt ut labore et dolore magna aliqua.`,
    excerpt: 'This is a sample blog post excerpt that provides a brief overview of the content.',
    published: true,
    authorId,
    views: Math.floor(Math.random() * 1000),
    createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000), // Random date within last 30 days
    ...overrides
  }
}

// Tag factory
export const createTag = (overrides?: Partial<Prisma.TagCreateInput>): Prisma.TagCreateInput => {
  const timestamp = Date.now()
  const random = Math.floor(Math.random() * 1000)
  const name = overrides?.name || `Tag ${timestamp}-${random}`
  
  return {
    name,
    slug: slugify(name),
    ...overrides
  }
}

// Category factory
export const createCategory = (overrides?: Partial<Prisma.CategoryCreateInput>): Prisma.CategoryCreateInput => {
  const timestamp = Date.now()
  const random = Math.floor(Math.random() * 1000)
  const name = overrides?.name || `Category ${timestamp}-${random}`
  
  return {
    name,
    slug: slugify(name),
    ...overrides
  }
}

// Default fixtures data
export const defaultTags = [
  { name: 'JavaScript', slug: 'javascript' },
  { name: 'TypeScript', slug: 'typescript' },
  { name: 'React', slug: 'react' },
  { name: 'Next.js', slug: 'nextjs' },
  { name: 'Node.js', slug: 'nodejs' },
  { name: 'Database', slug: 'database' },
  { name: 'PostgreSQL', slug: 'postgresql' },
  { name: 'Prisma', slug: 'prisma' },
  { name: 'Testing', slug: 'testing' },
  { name: 'DevOps', slug: 'devops' }
]

export const defaultCategories = [
  { name: 'Tutorial', slug: 'tutorial' },
  { name: 'How-To', slug: 'how-to' },
  { name: 'Best Practices', slug: 'best-practices' },
  { name: 'News', slug: 'news' },
  { name: 'Opinion', slug: 'opinion' },
  { name: 'Case Study', slug: 'case-study' }
]

// Sample blog post content
export const samplePostContents = [
  {
    title: 'Getting Started with Next.js 14',
    excerpt: 'Learn how to build modern web applications with Next.js 14 and its new features.',
    content: `# Getting Started with Next.js 14

Next.js 14 introduces several exciting features that make building web applications even better.

## Key Features

- **Turbopack**: The new Rust-based bundler
- **Server Actions**: Simplified data mutations
- **Partial Prerendering**: Combining static and dynamic content

## Installation

\`\`\`bash
npx create-next-app@latest my-app
cd my-app
npm run dev
\`\`\`

## Creating Your First Page

\`\`\`typescript
export default function HomePage() {
  return <h1>Welcome to Next.js!</h1>
}
\`\`\`
`
  },
  {
    title: 'Understanding Prisma ORM',
    excerpt: 'Deep dive into Prisma ORM and how it simplifies database operations.',
    content: `# Understanding Prisma ORM

Prisma is a next-generation ORM that makes database access easy with type-safe queries.

## Why Prisma?

- Type-safe database queries
- Auto-generated types
- Database migrations
- Visual database browser

## Basic Setup

\`\`\`bash
npm install prisma @prisma/client
npx prisma init
\`\`\`

## Defining Models

\`\`\`prisma
model User {
  id    String @id @default(cuid())
  email String @unique
  posts Post[]
}
\`\`\`
`
  },
  {
    title: 'Building Scalable APIs with Node.js',
    excerpt: 'Best practices for building production-ready APIs with Node.js.',
    content: `# Building Scalable APIs with Node.js

Learn how to build APIs that can handle millions of requests.

## Architecture Patterns

- **Microservices**: Breaking down into smaller services
- **Event-driven**: Using message queues
- **Caching**: Redis for performance

## Code Example

\`\`\`javascript
app.get('/api/users', async (req, res) => {
  const users = await prisma.user.findMany()
  res.json(users)
})
\`\`\`
`
  }
]