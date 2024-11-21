'use client'

import { useSession } from 'next-auth/react'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Role } from '@prisma/client'

type Post = {
  id: string
  title: string
  slug: string
  published: boolean
  createdAt: string
  updatedAt: string
  author: {
    name: string | null
    email: string | null
  }
  tags: Array<{ id: string; name: string }>
  categories: Array<{ id: string; name: string }>
}

export default function AdminPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (status === 'loading') return
    if (!session) {
      router.push('/')
      return
    }
    // Check if user has admin role
    if (session.user.role !== Role.ADMIN) {
      router.push('/')
      return
    }

    fetchPosts()
  }, [session, status, router])

  const fetchPosts = async () => {
    try {
      const response = await fetch('/api/posts?published=false')
      const data = await response.json()
      setPosts(data)
    } catch (error) {
      console.error('Failed to fetch posts:', error)
    } finally {
      setLoading(false)
    }
  }

  if (status === 'loading' || loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div style={{ color: 'var(--text-secondary)' }}>Loading...</div>
      </div>
    )
  }

  if (!session || session.user.role !== Role.ADMIN) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center" style={{ color: 'var(--text-secondary)' }}>
          <h1 className="text-2xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>Access Denied</h1>
          <p>You need administrator privileges to access this page.</p>
          <Link 
            href="/"
            className="inline-block mt-4 px-4 py-2 rounded-lg transition-colors"
            style={{
              backgroundColor: 'var(--primary)',
              color: 'var(--text-inverse)'
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--primary-hover)'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'var(--primary)'}
          >
            Go Home
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>Admin Dashboard</h1>
        <div className="flex gap-3">
          <Link
            href="/admin/users"
            className="px-4 py-2 rounded-lg transition-colors"
            style={{
              backgroundColor: 'var(--background-tertiary)',
              color: 'var(--text-primary)',
              border: '1px solid var(--border)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = 'var(--border-hover)';
              e.currentTarget.style.backgroundColor = 'var(--background-secondary)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'var(--border)';
              e.currentTarget.style.backgroundColor = 'var(--background-tertiary)';
            }}
          >
            Manage Users
          </Link>
          <Link
            href="/admin/new"
            className="px-4 py-2 rounded-lg transition-colors"
            style={{
              backgroundColor: 'var(--primary)',
              color: 'var(--text-inverse)'
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--primary-hover)'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'var(--primary)'}
          >
            New Post
          </Link>
        </div>
      </div>

      <div className="rounded-lg" style={{
        backgroundColor: 'var(--background-secondary)',
        boxShadow: 'var(--shadow-md)',
        border: '1px solid var(--border)'
      }}>
        <div className="p-6">
          <h2 className="text-xl font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>All Posts</h2>
          {posts.length === 0 ? (
            <p style={{ color: 'var(--text-tertiary)' }}>No posts yet. Create your first post!</p>
          ) : (
            <div className="space-y-4">
              {posts.map((post) => (
                <div
                  key={post.id}
                  className="rounded-lg p-4 transition-all"
                  style={{
                    border: '1px solid var(--border)',
                    backgroundColor: 'var(--background)'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
                    e.currentTarget.style.borderColor = 'var(--border-hover)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.boxShadow = 'none';
                    e.currentTarget.style.borderColor = 'var(--border)';
                  }}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg mb-1" style={{ color: 'var(--text-primary)' }}>
                        {post.title}
                      </h3>
                      <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                        {new Date(post.createdAt).toLocaleDateString()} • 
                        {post.published ? (
                          <span className="ml-1" style={{ color: 'var(--success)' }}>Published</span>
                        ) : (
                          <span className="ml-1" style={{ color: 'var(--warning)' }}>Draft</span>
                        )}
                      </p>
                      <div className="flex gap-2 mt-2">
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
                        {post.tags.map((tag) => (
                          <span
                            key={tag.id}
                            className="text-xs px-2 py-1 rounded"
                            style={{
                              backgroundColor: 'var(--background-tertiary)',
                              color: 'var(--text-secondary)',
                              border: '1px solid var(--border)'
                            }}
                          >
                            #{tag.name}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="flex gap-2 ml-4">
                      <Link
                        href={`/admin/edit/${post.id}`}
                        className="text-sm transition-colors"
                        style={{ color: 'var(--primary)' }}
                        onMouseEnter={(e) => e.currentTarget.style.color = 'var(--primary-hover)'}
                        onMouseLeave={(e) => e.currentTarget.style.color = 'var(--primary)'}
                      >
                        Edit
                      </Link>
                      <Link
                        href={`/posts/${post.slug}`}
                        className="text-sm transition-colors"
                        style={{ color: 'var(--text-secondary)' }}
                        onMouseEnter={(e) => e.currentTarget.style.color = 'var(--text-primary)'}
                        onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-secondary)'}
                      >
                        View
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}