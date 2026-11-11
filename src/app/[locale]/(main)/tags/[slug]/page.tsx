import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getTranslations } from 'next-intl/server'
import { prisma } from '@/lib/prisma'
import { getFullUrl } from '@/lib/url'
import { routing } from '@/i18n/routing'

interface Post {
  id: string
  title: string
  slug: string
  excerpt: string | null
  createdAt: string
  author: {
    name: string | null
    email: string | null
  }
  tags: Array<{
    id: string
    name: string
    slug: string
  }>
}

interface TagResponse {
  tag: {
    id: string
    name: string
    slug: string
  }
  posts: Post[]
  count: number
}

async function getPostsByTag(slug: string): Promise<TagResponse> {
  // First, check if the tag exists
  const tag = await prisma.tag.findUnique({
    where: { slug },
  })

  if (!tag) {
    notFound()
  }

  // Get all posts with this tag
  const posts = await prisma.post.findMany({
    where: {
      published: true,
      tags: {
        some: {
          slug: slug
        }
      }
    },
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      title: true,
      slug: true,
      excerpt: true,
      createdAt: true,
      author: {
        select: {
          name: true,
          email: true,
        }
      },
      tags: {
        select: {
          id: true,
          name: true,
          slug: true,
        }
      },
      categories: {
        select: {
          id: true,
          name: true,
          slug: true,
        }
      },
    },
  })

  // Serialize dates for client
  const serializedPosts = posts.map(post => ({
    ...post,
    createdAt: post.createdAt.toISOString(),
  }))

  return {
    tag: {
      id: tag.id,
      name: tag.name,
      slug: tag.slug
    },
    posts: serializedPosts,
    count: serializedPosts.length
  }
}

export default async function TagPage({ params }: { params: Promise<{ slug: string; locale: string }> }) {
  const { slug, locale } = await params
  const { tag, posts, count } = await getPostsByTag(slug)
  const t = await getTranslations()

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
          {t('posts.taggedWith', { tag: tag.name })}
        </h1>
        <p style={{ color: 'var(--text-secondary)' }}>
          {t('posts.foundCount', { count })}
        </p>
      </div>

      <div className="space-y-6">
        {posts.length === 0 ? (
          <p className="text-center py-8" style={{ color: 'var(--text-tertiary)' }}>
            {t('posts.noPostsWithTag')}
          </p>
        ) : (
          posts.map((post) => (
            <article
              key={post.id}
              className="pb-6"
              style={{ borderBottom: '1px solid var(--border)' }}
            >
              <h2 className="text-2xl font-semibold mb-2">
                <Link
                  href={`/${locale}/posts/${post.slug}`}
                  className="post-card-title-link transition-colors"
                  style={{ color: 'var(--text-primary)' }}
                >
                  {post.title}
                </Link>
              </h2>

              {post.excerpt && (
                <p className="mb-3" style={{ color: 'var(--text-secondary)' }}>
                  {post.excerpt}
                </p>
              )}

              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm" style={{ color: 'var(--text-tertiary)' }}>
                <span>
                  {t('posts.byAuthor', { author: post.author.name || post.author.email || t('admin.anonymous') })}
                </span>
                <span>•</span>
                <time dateTime={post.createdAt}>
                  {new Date(post.createdAt).toLocaleDateString(locale, {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </time>
              </div>

              {post.tags.length > 0 && (
                <div className="flex flex-wrap gap-x-3 gap-y-1 mt-3">
                  {post.tags.map((t) => (
                    <Link
                      key={t.id}
                      href={`/${locale}/tags/${t.slug}`}
                      aria-current={t.slug === tag.slug ? 'page' : undefined}
                      className={`post-card-tag text-xs font-bold transition-colors hover:underline ${t.slug === tag.slug ? 'underline' : ''}`}
                      style={{ color: 'var(--tag-background)' }}
                    >
                      #{t.name}
                    </Link>
                  ))}
                </div>
              )}
            </article>
          ))
        )}
      </div>
      
      <div className="mt-8">
        <Link
          href={`/${locale}/posts`}
          className="post-card-readmore hover:underline"
          style={{ color: 'var(--primary)' }}
        >
          {t('common.backToAllPosts')}
        </Link>
      </div>
    </div>
  )
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string; locale: string }> }) {
  try {
    const { slug, locale } = await params
    
    // Lightweight query - only fetch tag info without posts
    const tag = await prisma.tag.findUnique({
      where: { slug },
      select: {
        name: true,
        slug: true,
        _count: {
          select: { posts: true }
        }
      }
    })

    if (!tag) {
      return {
        title: 'Tag not found',
        description: 'The requested tag could not be found',
      }
    }

    const count = tag._count.posts
    const tagUrl = getFullUrl(`/${locale}/tags/${slug}`)
    const baseUrl = getFullUrl('')

    return {
      title: `Posts tagged with "${tag.name}"`,
      description: `Browse ${count} blog ${count === 1 ? 'post' : 'posts'} tagged with ${tag.name}. Discover articles about ${tag.name} and related topics.`,
      keywords: [tag.name, 'blog posts', 'articles', 'tutorials'],
      alternates: {
        canonical: tagUrl,
        languages: {
          'x-default': `${baseUrl}/${routing.defaultLocale}/tags/${slug}`,
          'en': `${baseUrl}/en/tags/${slug}`,
          'fr': `${baseUrl}/fr/tags/${slug}`,
        },
      },
      openGraph: {
        type: 'website',
        title: `Posts tagged with "${tag.name}"`,
        description: `Browse ${count} blog ${count === 1 ? 'post' : 'posts'} tagged with ${tag.name}. Discover articles about ${tag.name} and related topics.`,
        url: tagUrl,
      },
      twitter: {
        card: 'summary_large_image',
        title: `Posts tagged with "${tag.name}"`,
        description: `Browse ${count} blog ${count === 1 ? 'post' : 'posts'} tagged with ${tag.name}.`,
      },
    }
  } catch {
    return {
      title: 'Tag not found',
      description: 'The requested tag could not be found',
    }
  }
}
