import { cache } from 'react'
import { prisma } from './prisma'

/**
 * Article-page queries, memoised per request with React's cache(). The post
 * layout, generateMetadata and the page all need the same post; without this
 * each made its own Prisma call (Prisma, unlike fetch, is not deduplicated),
 * and prerendering every article at once exhausted the connection pool.
 */

/** The post by slug, published or not, with its author, tags and categories. */
export const findPostBySlug = cache((slug: string) =>
  prisma.post.findUnique({
    where: { slug },
    include: { author: true, tags: true, categories: true },
  }),
)

/** Published posts without bodies, newest first: topic lanes, neighbours, "more on this topic". */
export const getPostLog = cache(async () =>
  (
    await prisma.post.findMany({
      where: { published: true },
      orderBy: { createdAt: 'desc' },
      select: { id: true, title: true, slug: true, createdAt: true, tags: { select: { name: true, slug: true } } },
    })
  ).map((p) => ({ ...p, createdAt: p.createdAt.toISOString() })),
)
