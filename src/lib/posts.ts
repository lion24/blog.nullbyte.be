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
 * Get all published posts (for public pages)
 */
export async function getPublishedPosts(limit?: number): Promise<PostSummary[]> {
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
 * Increment post view count (non-blocking)
 */
export async function incrementPostViews(postId: string): Promise<void> {
  // Fire and forget - don't await
  prisma.post.update({
    where: { id: postId },
    data: { views: { increment: 1 } },
  }).catch(err => {
    console.error('Failed to increment post views:', err)
  })
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
