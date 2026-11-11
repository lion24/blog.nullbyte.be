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
  categories: Array<{
    id: string
    name: string
    slug: string
  }>
}

interface CategoryResponse {
  category: {
    id: string
    name: string
    slug: string
  }
  posts: Post[]
  count: number
}

async function getPostsByCategory(slug: string): Promise<CategoryResponse> {
  // First, check if the category exists
  const category = await prisma.category.findUnique({
    where: { slug },
  })

  if (!category) {
    notFound()
  }

  // Get all posts in this category
  const posts = await prisma.post.findMany({
    where: {
      published: true,
      categories: {
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
    category: {
      id: category.id,
      name: category.name,
      slug: category.slug
    },
    posts: serializedPosts,
    count: serializedPosts.length
  }
}

export default async function CategoryPage({ params }: { params: Promise<{ slug: string; locale: string }> }) {
  const { slug, locale } = await params
  const { category, posts, count } = await getPostsByCategory(slug)
  const t = await getTranslations()

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
          {t('posts.categorizedAs', { category: category.name })}
        </h1>
        <p style={{ color: 'var(--text-secondary)' }}>
          {t('posts.foundCount', { count })}
        </p>
      </div>

      <div className="space-y-6">
        {posts.length === 0 ? (
          <p className="text-center py-8" style={{ color: 'var(--text-tertiary)' }}>
            {t('posts.noPostsInCategory')}
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

              {/* Display categories */}
              {post.categories.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-3">
                  {post.categories.map((cat) => (
                    <Link
                      key={cat.id}
                      href={`/${locale}/categories/${cat.slug}`}
                      className="post-card-category text-xs px-2.5 py-1 rounded-full font-medium"
                      aria-current={cat.slug === category.slug ? 'page' : undefined}
                      style={
                        cat.slug === category.slug
                          ? { backgroundColor: 'var(--primary)', color: 'var(--text-inverse)' }
                          : { backgroundColor: 'var(--background-tertiary)', color: 'var(--text-secondary)', border: '1px solid var(--border)' }
                      }
                    >
                      {cat.name}
                    </Link>
                  ))}
                </div>
              )}

              {/* Display tags */}
              {post.tags.length > 0 && (
                <div className="flex flex-wrap gap-x-3 gap-y-1 mt-2">
                  {post.tags.map((tag) => (
                    <Link
                      key={tag.id}
                      href={`/${locale}/tags/${tag.slug}`}
                      className="post-card-tag text-xs font-bold transition-colors hover:underline"
                      style={{ color: 'var(--tag-background)' }}
                    >
                      #{tag.name}
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
    
    // Lightweight query - only fetch category info without posts
    const category = await prisma.category.findUnique({
      where: { slug },
      select: {
        name: true,
        slug: true,
        _count: {
          select: { posts: true }
        }
      }
    })

    if (!category) {
      return {
        title: 'Category not found',
        description: 'The requested category could not be found',
      }
    }

    const count = category._count.posts
    const categoryUrl = getFullUrl(`/${locale}/categories/${slug}`)
    const baseUrl = getFullUrl('')

    return {
      title: `${category.name} - Blog Posts`,
      description: `Browse ${count} blog ${count === 1 ? 'post' : 'posts'} in the ${category.name} category. Discover articles about ${category.name} and related topics.`,
      keywords: [category.name, 'blog posts', 'articles', 'category', 'tutorials'],
      alternates: {
        canonical: categoryUrl,
        languages: {
          'x-default': `${baseUrl}/${routing.defaultLocale}/categories/${slug}`,
          'en': `${baseUrl}/en/categories/${slug}`,
          'fr': `${baseUrl}/fr/categories/${slug}`,
        },
      },
      openGraph: {
        type: 'website',
        title: `${category.name} - Blog Posts`,
        description: `Browse ${count} blog ${count === 1 ? 'post' : 'posts'} in the ${category.name} category. Discover articles about ${category.name} and related topics.`,
        url: categoryUrl,
      },
      twitter: {
        card: 'summary_large_image',
        title: `${category.name} - Blog Posts`,
        description: `Browse ${count} blog ${count === 1 ? 'post' : 'posts'} in the ${category.name} category.`,
      },
    }
  } catch {
    return {
      title: 'Category not found',
      description: 'The requested category could not be found',
    }
  }
}
