import { MetadataRoute } from 'next'
import { prisma } from '@/lib/prisma'
import { getBaseUrl } from '@/lib/url'

// Force dynamic generation (not static at build time)
export const dynamic = 'force-dynamic'
export const revalidate = 3600 // Revalidate every hour

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = getBaseUrl()

  // Fetch all published posts
  const posts = await prisma.post.findMany({
    where: { published: true },
    select: {
      slug: true,
      updatedAt: true,
    },
    orderBy: { updatedAt: 'desc' },
  })

  // Get the most recent post update date (for listing pages)
  const mostRecentPostDate = posts.length > 0 ? posts[0].updatedAt : new Date()

  // Fetch all tags that have published posts with their most recent post
  const tags = await prisma.tag.findMany({
    where: {
      posts: {
        some: {
          published: true,
        },
      },
    },
    select: {
      slug: true,
      posts: {
        where: { published: true },
        select: { updatedAt: true },
        orderBy: { updatedAt: 'desc' },
        take: 1,
      },
    },
  })

  // Fetch all categories that have published posts with their most recent post
  const categories = await prisma.category.findMany({
    where: {
      posts: {
        some: {
          published: true,
        },
      },
    },
    select: {
      slug: true,
      posts: {
        where: { published: true },
        select: { updatedAt: true },
        orderBy: { updatedAt: 'desc' },
        take: 1,
      },
    },
  })

  // Homepage - uses most recent post date
  const homepage: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: mostRecentPostDate,
      changeFrequency: 'daily',
      priority: 1,
    },
  ]

  // Posts page - uses most recent post date
  const postsPage: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}/posts`,
      lastModified: mostRecentPostDate,
      changeFrequency: 'daily',
      priority: 0.9,
    },
  ]

  // Individual post pages - uses their own updatedAt
  const postPages: MetadataRoute.Sitemap = posts.map((post) => ({
    url: `${baseUrl}/posts/${post.slug}`,
    lastModified: post.updatedAt,
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }))

  // Tag pages - uses most recent post date in that tag
  const tagPages: MetadataRoute.Sitemap = tags.map((tag) => ({
    url: `${baseUrl}/tags/${tag.slug}`,
    lastModified: tag.posts[0]?.updatedAt || mostRecentPostDate,
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }))

  // Category pages - uses most recent post date in that category
  const categoryPages: MetadataRoute.Sitemap = categories.map((category) => ({
    url: `${baseUrl}/categories/${category.slug}`,
    lastModified: category.posts[0]?.updatedAt || mostRecentPostDate,
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }))

  return [...homepage, ...postsPage, ...postPages, ...tagPages, ...categoryPages]
}
