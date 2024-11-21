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

export default function PostsPage() {
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/posts?published=true')
      .then(res => res.json())
      .then(data => {
        setPosts(data)
        setLoading(false)
      })
      .catch(err => {
        console.error('Failed to fetch posts:', err)
        setLoading(false)
      })
  }, [])

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-8" style={{ color: 'var(--text-primary)' }}>All Posts</h1>
      
      {loading ? (
        <div className="text-center py-12 rounded-lg" style={{
          backgroundColor: 'var(--background-secondary)',
          boxShadow: 'var(--shadow-sm)',
          border: '1px solid var(--border)'
        }}>
          <p style={{ color: 'var(--text-secondary)' }}>Loading posts...</p>
        </div>
      ) : posts.length === 0 ? (
        <div className="text-center py-12 rounded-lg" style={{
          backgroundColor: 'var(--background-secondary)',
          boxShadow: 'var(--shadow-sm)',
          border: '1px solid var(--border)'
        }}>
          <p style={{ color: 'var(--text-tertiary)' }}>No posts published yet.</p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {posts.map((post) => (
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
                <time className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                  {new Date(post.createdAt).toLocaleDateString()}
                </time>
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
              
              <h2 className="text-xl font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
                <Link 
                  href={`/posts/${post.slug}`} 
                  className="transition-colors"
                  style={{ color: 'inherit' }}
                  onMouseEnter={(e) => e.currentTarget.style.color = 'var(--primary)'}
                  onMouseLeave={(e) => e.currentTarget.style.color = 'inherit'}
                >
                  {post.title}
                </Link>
              </h2>
              
              {post.excerpt && (
                <p className="mb-4 flex-1" style={{ color: 'var(--text-secondary)' }}>{post.excerpt}</p>
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
    </div>
  )
}