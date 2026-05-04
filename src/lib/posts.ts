/**
 * Data access layer for posts
 * Use these functions in Server Components instead of calling API endpoints
 */

import { prisma } from './prisma'
import { calculateReadingTime } from './reading-time'

export type PostSummary = {
  id: string
  title: string
  slug: string
  excerpt: string | null
  featuredImage: string | null
  createdAt: string
  readingTime: number
  author: {
    name: string | null
    image: string | null
  }
  tags: Array<{ id: string; name: string; slug: string }>
  categories: Array<{ id: string; name: string; slug: string }>
}

export type PostDetail = PostSummary & {
  content: unknown // PlateJS JSON content
  published: boolean
  updatedAt: string
  views: number
}

/**
 * Get all published posts (for public pages).
 *
 * Returns [] when the database is unreachable. This is intentional: CI runs
 * `next build` with a placeholder DATABASE_URL just to verify compilation,
 * and the home + posts-index pages are now SSG so their prerender step
 * would otherwise crash the build. At runtime, a transient DB failure also
 * renders an empty list rather than a 500 — better UX than a stack trace.
 */
export async function getPublishedPosts(limit?: number): Promise<PostSummary[]> {
  try {
    const posts = await prisma.post.findMany({
      where: { published: true },
      orderBy: { createdAt: 'desc' },
      take: limit,
      select: {
        id: true,
        title: true,
        slug: true,
        excerpt: true,
        featuredImage: true,
        createdAt: true,
        content: true, // Need for reading time
        author: {
          select: {
            name: true,
            image: true,
          },
        },
        tags: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
        categories: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
    })

    return posts.map(post => ({
      ...post,
      createdAt: post.createdAt.toISOString(),
      readingTime: calculateReadingTime(post.content),
      content: undefined as never, // Remove from response
    }))
  } catch (err) {
    console.warn('getPublishedPosts: returning empty list, DB unreachable', err)
    return []
  }
}

/**
 * Get a single post by slug (for public post detail page)
 */
export async function getPostBySlug(slug: string): Promise<PostDetail | null> {
  const post = await prisma.post.findUnique({
    where: { slug, published: true },
    select: {
      id: true,
      title: true,
      slug: true,
      excerpt: true,
      featuredImage: true,
      content: true,
      published: true,
      createdAt: true,
      updatedAt: true,
      views: true,
      author: {
        select: {
          name: true,
          image: true,
        },
      },
      tags: {
        select: {
          id: true,
          name: true,
          slug: true,
        },
      },
      categories: {
        select: {
          id: true,
          name: true,
          slug: true,
        },
      },
    },
  })

  if (!post) {
    return null
  }

  return {
    ...post,
    createdAt: post.createdAt.toISOString(),
    updatedAt: post.updatedAt.toISOString(),
    readingTime: calculateReadingTime(post.content),
  }
}

/**
 * Get all posts (including unpublished) - for admin pages
 */
export async function getAllPosts(): Promise<PostSummary[]> {
  const posts = await prisma.post.findMany({
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      title: true,
      slug: true,
      excerpt: true,
      featuredImage: true,
      createdAt: true,
      content: true,
      author: {
        select: {
          name: true,
          image: true,
        },
      },
      tags: {
        select: {
          id: true,
          name: true,
          slug: true,
        },
      },
      categories: {
        select: {
          id: true,
          name: true,
          slug: true,
        },
      },
    },
  })

  return posts.map(post => ({
    ...post,
    createdAt: post.createdAt.toISOString(),
    readingTime: calculateReadingTime(post.content),
    content: undefined as never,
  }))
}

/**
 * Get post by ID (for admin edit page)
 */
export async function getPostById(id: string): Promise<PostDetail | null> {
  const post = await prisma.post.findUnique({
    where: { id },
    select: {
      id: true,
      title: true,
      slug: true,
      excerpt: true,
      featuredImage: true,
      content: true,
      published: true,
      createdAt: true,
      updatedAt: true,
      views: true,
      author: {
        select: {
          name: true,
          image: true,
        },
      },
      tags: {
        select: {
          id: true,
          name: true,
          slug: true,
        },
      },
      categories: {
        select: {
          id: true,
          name: true,
          slug: true,
        },
      },
    },
  })

  if (!post) {
    return null
  }

  return {
    ...post,
    createdAt: post.createdAt.toISOString(),
    updatedAt: post.updatedAt.toISOString(),
    readingTime: calculateReadingTime(post.content),
  }
}
