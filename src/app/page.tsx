'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useEffect, useState } from 'react'
import { formatReadingTime } from '@/lib/reading-time'

type Post = {
  id: string
  title: string
  slug: string
  excerpt: string | null
  createdAt: string
  readingTime: number
  author: {
    name: string | null
  }
  tags: Array<{ id: string; name: string; slug: string }>
  categories: Array<{ id: string; name: string }>
}

export default function HomePage() {
  const [latestPosts, setLatestPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)

  const truncateExcerpt = (text: string | null, maxLength: number = 115): string => {
    if (!text) return ''
    if (text.length <= maxLength) return text
    return text.slice(0, maxLength).trim() + '...'
  }

  useEffect(() => {
    fetch('/api/posts?published=true&limit=3')
      .then(res => res.json())
      .then(data => {
        setLatestPosts(data)
        setLoading(false)
      })
      .catch(err => {
        console.error('Failed to fetch posts:', err)
        setLoading(false)
      })
  }, [])

  return (
    <div className="container mx-auto px-4 py-8">
      <section className="relative text-center py-16 mb-8 rounded-2xl overflow-hidden">
        {/* Background Image - 16:9 aspect ratio */}
        <div className="absolute inset-0 w-full h-full">
          <Image
            src="/hero.jpg"
            alt="Hero background"
            fill
            className="object-cover opacity-30"
            priority
          />
          {/* Theme-aware overlay for better text readability */}
          <div
            className="absolute inset-0"
            style={{
              backgroundColor: 'var(--background)',
              opacity: 0.6
            }}
          />
        </div>

        {/* Content - positioned above background */}
        <div className="relative z-10 px-4 py-12">
          <h1
            className="text-5xl font-bold mb-4"
            style={{ color: 'var(--text-primary)' }}
          >
            Welcome to My Tech Blog
          </h1>
          <p
            className="text-xl mb-8 max-w-2xl mx-auto"
            style={{ color: 'var(--text-secondary)' }}
          >
            Sharing my development journey, insights, and discoveries in the world of technology
          </p>
          <div className="flex justify-center space-x-4 flex-wrap gap-4">
            <Link
              href="/posts"
              className="px-6 py-3 rounded-lg transition-colors inline-block shadow-lg"
              style={{
                backgroundColor: 'var(--primary)',
                color: 'var(--text-inverse)'
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--primary-hover)'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'var(--primary)'}
            >
              Browse All Posts
            </Link>
            <Link
              href="https://github.com/lion24"
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-3 rounded-lg transition-colors inline-block shadow-lg"
              style={{
                backgroundColor: 'var(--background-secondary)',
                color: 'var(--text-primary)',
                border: '1px solid var(--border)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--background-tertiary)';
                e.currentTarget.style.borderColor = 'var(--border-hover)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--background-secondary)';
                e.currentTarget.style.borderColor = 'var(--border)';
              }}
            >
              GitHub Profile
            </Link>
          </div>
        </div>
      </section>

      <section className="py-16">
        <h2 className="text-3xl font-bold mb-8" style={{ color: 'var(--text-primary)' }}>Latest Posts</h2>
        {loading ? (
          <div className="text-center py-12 rounded-lg" style={{
            backgroundColor: 'var(--background-secondary)',
            boxShadow: 'var(--shadow-sm)',
            border: '1px solid var(--border)'
          }}>
            <p style={{ color: 'var(--text-secondary)' }}>Loading posts...</p>
          </div>
        ) : latestPosts.length === 0 ? (
          <div className="text-center py-12 rounded-lg" style={{
            backgroundColor: 'var(--background-secondary)',
            boxShadow: 'var(--shadow-sm)',
            border: '1px solid var(--border)'
          }}>
            <p style={{ color: 'var(--text-tertiary)' }}>No posts yet. Check back soon!</p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {latestPosts.map((post) => (
              <article
                key={post.id}
                className="p-6 rounded-lg transition-all flex flex-col"
                style={{
                  backgroundColor: 'var(--background-secondary)',
                  boxShadow: 'var(--shadow-sm)',
                  border: '1px solid var(--border)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.boxShadow = 'var(--shadow-md)';
                  e.currentTarget.style.borderColor = 'var(--border-hover)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
                  e.currentTarget.style.borderColor = 'var(--border)';
                }}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
                    <time>{new Date(post.createdAt).toLocaleDateString()}</time>
                    <span>•</span>
                    <span>{formatReadingTime(post.readingTime)}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    {post.categories.map((category) => (
                      <span
                        key={category.id}
                        className="text-xs px-2 py-1 rounded"
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

                <h3 className="text-xl font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
                  <Link
                    href={`/posts/${post.slug}`}
                    className="transition-colors"
                    style={{ color: 'inherit' }}
                    onMouseEnter={(e) => e.currentTarget.style.color = 'var(--primary)'}
                    onMouseLeave={(e) => e.currentTarget.style.color = 'inherit'}
                  >
                    {post.title}
                  </Link>
                </h3>

                {post.excerpt && (
                  <p className="mb-4 flex-1" style={{ color: 'var(--text-secondary)' }}>
                    {truncateExcerpt(post.excerpt)}
                  </p>
                )}

                <div className="flex items-center justify-between mt-auto">
                  <div className="flex items-center space-x-2">
                    {post.tags.slice(0, 3).map((tag) => (
                      <Link
                        key={tag.id}
                        href={`/tags/${tag.slug}`}
                        className="text-xs transition-colors"
                        style={{ color: 'var(--text-tertiary)' }}
                        onMouseEnter={(e) => e.currentTarget.style.color = 'var(--text-secondary)'}
                        onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-tertiary)'}
                      >
                        #{tag.name}
                      </Link>
                    ))}
                    {post.tags.length > 3 && (
                      <span className="text-xs" style={{ color: 'var(--text-tertiary)' }}>+{post.tags.length - 3}</span>
                    )}
                  </div>
                  <Link
                    href={`/posts/${post.slug}`}
                    className="text-sm font-medium transition-colors"
                    style={{ color: 'var(--primary)' }}
                    onMouseEnter={(e) => e.currentTarget.style.color = 'var(--primary-hover)'}
                    onMouseLeave={(e) => e.currentTarget.style.color = 'var(--primary)'}
                  >
                    Read →
                  </Link>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
