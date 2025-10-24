'use client'

import { notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import ContentRenderer from '@/components/ContentRenderer'
import SocialShare from '@/components/SocialShare'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

type Post = {
  id: string
  title: string
  content: string
  excerpt: string | null
  featuredImage: string | null
  published: boolean
  views: number
  createdAt: string
  author: {
    name: string | null
  }
  tags: Array<{ id: string; name: string; slug: string }>
  categories: Array<{ id: string; name: string }>
}

export default function PostPage({ params }: { params: Promise<{ slug: string }> }) {
  const [post, setPost] = useState<Post | null>(null)
  const [loading, setLoading] = useState(true)
  const [postUrl, setPostUrl] = useState('')
  const router = useRouter()

  useEffect(() => {
    async function fetchPost() {
      try {
        const { slug } = await params
        if (!slug) {
          notFound()
        }

        const response = await fetch(`/api/posts/by-slug/${slug}`)
        if (!response.ok) {
          if (response.status === 404) {
            notFound()
          }
          throw new Error('Failed to fetch post')
        }

        const data = await response.json()
        setPost(data)

        // Set the full URL for sharing
        if (typeof window !== 'undefined') {
          setPostUrl(window.location.href)
        }
      } catch (error) {
        console.error('Error fetching post:', error)
        router.push('/posts')
      } finally {
        setLoading(false)
      }
    }

    fetchPost()
  }, [params, router])

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="flex justify-center items-center min-h-[60vh]">
          <div style={{ color: 'var(--text-secondary)' }}>Loading...</div>
        </div>
      </div>
    )
  }

  if (!post) {
    return null
  }

  return (
    <article className="container mx-auto px-4 py-8 max-w-4xl">
      <header className="mb-8">
        <div className="flex items-center gap-2 text-sm mb-4" style={{ color: 'var(--text-secondary)' }}>
          <Link href="/" className="hover:text-primary transition-colors">Home</Link>
          <span>→</span>
          <Link href="/posts" className="hover:text-primary transition-colors">Posts</Link>
          <span>→</span>
          <span style={{ color: 'var(--text-primary)' }}>{post.title}</span>
        </div>

        <h1 className="text-4xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>{post.title}</h1>

        <div className="flex items-center justify-between flex-wrap gap-4 text-sm mb-6" style={{ color: 'var(--text-secondary)' }}>
          <div className="flex items-center space-x-4">
            <span>By {post.author.name || 'Anonymous'}</span>
            <span>•</span>
            <time>{new Date(post.createdAt).toLocaleDateString()}</time>
            <span>•</span>
            <span>{post.views} views</span>
          </div>

          <div className="flex items-center space-x-2">
            {post.categories.map((category) => (
              <span
                key={category.id}
                className="px-3 py-1 rounded-full text-xs"
                style={{
                  backgroundColor: 'var(--primary)',
                  color: 'var(--text-inverse)',
                  opacity: 0.9
                }}
              >
                {category.name}
              </span>
            ))}
          </div>
        </div>

        {postUrl && (
          <div className="pb-6 mb-6" style={{ borderBottom: '1px solid var(--border)' }}>
            <SocialShare url={postUrl} title={post.title} />
          </div>
        )}
      </header>

      {post.featuredImage && (
        <div className="mb-8 -mx-4 md:mx-0">
          <div className="relative w-full h-[400px] md:h-[500px] md:rounded-lg overflow-hidden">
            <Image
              src={post.featuredImage}
              alt={post.title}
              fill
              className="object-cover"
              priority
            />
          </div>
        </div>
      )}

      {post.excerpt && (
        <div className="text-xl mb-8 italic" style={{ color: 'var(--text-secondary)' }}>
          {post.excerpt}
        </div>
      )}

      <div className="mb-8">
        <ContentRenderer content={post.content} />
      </div>

      <footer className="pt-8" style={{ borderTop: '1px solid var(--border)' }}>
        <div className="flex items-center flex-wrap gap-2 mb-8">
          <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>Tags:</span>
          {post.tags.map((tag) => (
            <Link
              key={tag.id}
              href={`/tags/${tag.slug}`}
              className="text-sm transition-colors"
              style={{ color: 'var(--text-tertiary)' }}
              onMouseEnter={(e) => e.currentTarget.style.color = 'var(--text-secondary)'}
              onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-tertiary)'}
            >
              #{tag.name}
            </Link>
          ))}
        </div>

        <Link
          href="/posts"
          className="inline-flex items-center transition-colors"
          style={{ color: 'var(--primary)' }}
          onMouseEnter={(e) => e.currentTarget.style.color = 'var(--primary-hover)'}
          onMouseLeave={(e) => e.currentTarget.style.color = 'var(--primary)'}
        >
          ← Back to all posts
        </Link>
      </footer>
    </article>
  )
}
