import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getTranslations } from 'next-intl/server'
import { prisma } from '@/lib/prisma'
import { getFullUrl } from '@/lib/url'

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
        <h1 className="text-3xl font-bold mb-2">
          {t('posts.taggedWith', { tag: tag.name })}
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          {t('posts.foundCount', { count })}
        </p>
      </div>

      <div className="space-y-6">
        {posts.length === 0 ? (
          <p className="text-gray-500 dark:text-gray-400 text-center py-8">
            {t('posts.noPostsWithTag')}
          </p>
        ) : (
          posts.map((post) => (
            <article
              key={post.id}
              className="border-b border-gray-200 dark:border-gray-700 pb-6"
            >
              <Link href={`/${locale}/posts/${post.slug}`}>
                <h2 className="text-2xl font-semibold mb-2 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                  {post.title}
                </h2>
              </Link>

              {post.excerpt && (
                <p className="text-gray-600 dark:text-gray-400 mb-3">
                  {post.excerpt}
                </p>
              )}

              <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                <span>
                  {t('posts.byAuthor', { author: post.author.name || post.author.email || t('admin.anonymous') })}
                </span>
                <span>•</span>
                <time dateTime={post.createdAt}>
                  {new Date(post.createdAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </time>
              </div>

              {post.tags.length > 0 && (
                <div className="flex gap-2 mt-3">
                  {post.tags.map((t) => (
                    <Link
                      key={t.id}
                      href={`/${locale}/tags/${t.slug}`}
                      className={`text-xs px-2 py-1 rounded-md transition-colors ${
                        t.slug === tag.slug
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600'
                      }`}
                    >
                      {t.name}
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
          className="text-blue-600 dark:text-blue-400 hover:underline"
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
