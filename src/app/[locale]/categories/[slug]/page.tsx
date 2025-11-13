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
    include: {
      author: {
        select: {
          id: true,
          name: true,
          email: true,
          image: true
        }
      },
      tags: true,
      categories: true,
    },
  })

  // Serialize dates for client
  const serializedPosts = posts.map(post => ({
    ...post,
    createdAt: post.createdAt.toISOString(),
    updatedAt: post.updatedAt.toISOString(),
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
        <h1 className="text-3xl font-bold mb-2">
          {t('posts.categorizedAs', { category: category.name })}
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          {t('posts.foundCount', { count })}
        </p>
      </div>

      <div className="space-y-6">
        {posts.length === 0 ? (
          <p className="text-gray-500 dark:text-gray-400 text-center py-8">
            {t('posts.noPostsInCategory')}
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

              {/* Display categories */}
              {post.categories.length > 0 && (
                <div className="flex gap-2 mt-3">
                  {post.categories.map((cat) => (
                    <Link
                      key={cat.id}
                      href={`/${locale}/categories/${cat.slug}`}
                      className={`text-xs px-2 py-1 rounded-md transition-colors ${
                        cat.slug === category.slug
                          ? 'bg-purple-600 text-white'
                          : 'bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600'
                      }`}
                    >
                      {cat.name}
                    </Link>
                  ))}
                </div>
              )}

              {/* Display tags */}
              {post.tags.length > 0 && (
                <div className="flex gap-2 mt-2">
                  {post.tags.map((tag) => (
                    <Link
                      key={tag.id}
                      href={`/${locale}/tags/${tag.slug}`}
                      className="text-xs px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-md hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors"
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
          className="text-blue-600 dark:text-blue-400 hover:underline"
        >
          {t('common.backToAllPosts')}
        </Link>
      </div>
    </div>
  )
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  try {
    const { slug } = await params
    const { category, count } = await getPostsByCategory(slug)
    const categoryUrl = getFullUrl(`/categories/${slug}`)

    return {
      title: `${category.name} - Blog Posts`,
      description: `Browse ${count} blog ${count === 1 ? 'post' : 'posts'} in the ${category.name} category. Discover articles about ${category.name} and related topics.`,
      keywords: [category.name, 'blog posts', 'articles', 'category', 'tutorials'],
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
