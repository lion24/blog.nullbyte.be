import Link from 'next/link'
import { notFound } from 'next/navigation'

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
  const res = await fetch(`${process.env.NEXT_PUBLIC_URL || 'http://localhost:3000'}/api/tags/${slug}`, {
    cache: 'no-store'
  })
  
  if (!res.ok) {
    if (res.status === 404) {
      notFound()
    }
    throw new Error('Failed to fetch posts')
  }
  
  return res.json()
}

export default async function TagPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const { tag, posts, count } = await getPostsByTag(slug)
  
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">
          Posts tagged with &ldquo;{tag.name}&rdquo;
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Found {count} {count === 1 ? 'post' : 'posts'}
        </p>
      </div>
      
      <div className="space-y-6">
        {posts.length === 0 ? (
          <p className="text-gray-500 dark:text-gray-400 text-center py-8">
            No posts found with this tag.
          </p>
        ) : (
          posts.map((post) => (
            <article
              key={post.id}
              className="border-b border-gray-200 dark:border-gray-700 pb-6"
            >
              <Link href={`/posts/${post.slug}`}>
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
                  By {post.author.name || post.author.email}
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
                      href={`/tags/${t.slug}`}
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
          href="/posts"
          className="text-blue-600 dark:text-blue-400 hover:underline"
        >
          ← Back to all posts
        </Link>
      </div>
    </div>
  )
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  try {
    const { slug } = await params
    const { tag } = await getPostsByTag(slug)
    
    return {
      title: `Posts tagged with "${tag.name}"`,
      description: `Browse all blog posts tagged with ${tag.name}`
    }
  } catch {
    return {
      title: 'Tag not found',
      description: 'The requested tag could not be found'
    }
  }
}