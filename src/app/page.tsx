'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'

type Post = {
  id: string
  title: string
  slug: string
  excerpt: string | null
  createdAt: string
  author: {
    name: string | null
  }
  tags: Array<{ id: string; name: string; slug: string }>
  categories: Array<{ id: string; name: string }>
}

export default function HomePage() {
  const [latestPosts, setLatestPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/posts?published=true&limit=5')
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
      <section className="text-center py-16">
        <h1 className="text-5xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
          Welcome to My Tech Blog
        </h1>
        <p className="text-xl mb-8 max-w-2xl mx-auto" style={{ color: 'var(--text-secondary)' }}>
          Sharing my development journey, insights, and discoveries in the world of technology
        </p>
        <div className="flex justify-center space-x-4">
          <Link
            href="/posts"
            className="px-6 py-3 rounded-lg transition-colors inline-block"
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
            className="px-6 py-3 rounded-lg transition-colors inline-block"
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
          <div className="space-y-6">
            {latestPosts.map((post) => (
              <article key={post.id} className="p-6 rounded-lg transition-all" style={{
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
              }}>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                      By {post.author.name || 'Anonymous'}
                    </span>
                    <span className="text-sm" style={{ color: 'var(--text-tertiary)' }}>•</span>
                    <time className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                      {new Date(post.createdAt).toLocaleDateString()}
                    </time>
                  </div>
                  <div className="flex items-center space-x-2">
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
                
                <h3 className="text-2xl font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
                  <Link href={`/posts/${post.slug}`} className="transition-colors"
                    style={{ color: 'inherit' }}
                    onMouseEnter={(e) => e.currentTarget.style.color = 'var(--primary)'}
                    onMouseLeave={(e) => e.currentTarget.style.color = 'inherit'}>
                    {post.title}
                  </Link>
                </h3>
                
                {post.excerpt && (
                  <p className="mb-4" style={{ color: 'var(--text-secondary)' }}>{post.excerpt}</p>
                )}
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    {post.tags.map((tag) => (
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
                  </div>
                  <Link
                    href={`/posts/${post.slug}`}
                    className="font-medium text-sm transition-colors"
                    style={{ color: 'var(--primary)' }}
                    onMouseEnter={(e) => e.currentTarget.style.color = 'var(--primary-hover)'}
                    onMouseLeave={(e) => e.currentTarget.style.color = 'var(--primary)'}
                  >
                    Read more →
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
