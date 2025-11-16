import { MetadataRoute } from 'next'
import { prisma } from '@/lib/prisma'
import { getBaseUrl } from '@/lib/url'
import { routing } from '@/i18n/routing'

// Force dynamic generation (not static at build time)
export const dynamic = 'force-dynamic'
export const revalidate = 3600 // Revalidate every hour

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = getBaseUrl()
  const locales = routing.locales

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

  // Homepage - create entry for each locale with alternates
  const homepage: MetadataRoute.Sitemap = locales.map((locale) => ({
    url: `${baseUrl}/${locale}`,
    lastModified: mostRecentPostDate,
    changeFrequency: 'daily' as const,
    priority: 1,
    alternates: {
      languages: Object.fromEntries(
        locales.map((loc) => [loc, `${baseUrl}/${loc}`])
      ),
    },
  }))

  // Posts page - create entry for each locale with alternates
  const postsPage: MetadataRoute.Sitemap = locales.map((locale) => ({
    url: `${baseUrl}/${locale}/posts`,
    lastModified: mostRecentPostDate,
    changeFrequency: 'daily' as const,
    priority: 0.9,
    alternates: {
      languages: Object.fromEntries(
        locales.map((loc) => [loc, `${baseUrl}/${loc}/posts`])
      ),
    },
  }))

  // Individual post pages - create entry for each locale with alternates
  const postPages: MetadataRoute.Sitemap = posts.flatMap((post) =>
    locales.map((locale) => ({
      url: `${baseUrl}/${locale}/posts/${post.slug}`,
      lastModified: post.updatedAt,
      changeFrequency: 'weekly' as const,
      priority: 0.8,
      alternates: {
        languages: Object.fromEntries(
          locales.map((loc) => [loc, `${baseUrl}/${loc}/posts/${post.slug}`])
        ),
      },
    }))
  )

  // Tag pages - create entry for each locale with alternates
  const tagPages: MetadataRoute.Sitemap = tags.flatMap((tag) =>
    locales.map((locale) => ({
      url: `${baseUrl}/${locale}/tags/${tag.slug}`,
      lastModified: tag.posts[0]?.updatedAt || mostRecentPostDate,
      changeFrequency: 'weekly' as const,
      priority: 0.7,
      alternates: {
        languages: Object.fromEntries(
          locales.map((loc) => [loc, `${baseUrl}/${loc}/tags/${tag.slug}`])
        ),
      },
    }))
  )

  // Category pages - create entry for each locale with alternates
  const categoryPages: MetadataRoute.Sitemap = categories.flatMap((category) =>
    locales.map((locale) => ({
      url: `${baseUrl}/${locale}/categories/${category.slug}`,
      lastModified: category.posts[0]?.updatedAt || mostRecentPostDate,
      changeFrequency: 'weekly' as const,
      priority: 0.7,
      alternates: {
        languages: Object.fromEntries(
          locales.map((loc) => [loc, `${baseUrl}/${loc}/categories/${category.slug}`])
        ),
      },
    }))
  )

  return [...homepage, ...postsPage, ...postPages, ...tagPages, ...categoryPages]
}
