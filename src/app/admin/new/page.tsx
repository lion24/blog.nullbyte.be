'use client'

import { useSession } from 'next-auth/react'
import { useState, FormEvent, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import MarkdownPreview from '@/components/MarkdownPreview'
import { Role } from '@prisma/client'

export default function NewPostPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [showPreview, setShowPreview] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    excerpt: '',
    tags: '',
    categories: '',
    published: false,
  })

  useEffect(() => {
    if (status === 'loading') return
    if (!session || session.user.role !== Role.ADMIN) {
      router.push('/')
    }
  }, [session, status, router])

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch('/api/posts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          tags: formData.tags.split(',').map(tag => tag.trim()).filter(Boolean),
          categories: formData.categories.split(',').map(cat => cat.trim()).filter(Boolean),
        }),
      })

      if (response.ok) {
        await response.json()
        router.push(`/admin`)
      } else {
        console.error('Failed to create post')
      }
    } catch (error) {
      console.error('Error creating post:', error)
    } finally {
      setLoading(false)
    }
  }

  if (status === 'loading') {
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
          <p>You need administrator privileges to create posts.</p>
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
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Create New Post</h1>
        <Link
          href="/admin"
          className="text-blue-600 dark:text-blue-400 hover:underline"
        >
          Back to Admin
        </Link>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Title
          </label>
          <input
            type="text"
            id="title"
            required
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          />
        </div>

        <div>
          <label htmlFor="excerpt" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Excerpt
          </label>
          <textarea
            id="excerpt"
            rows={2}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
            value={formData.excerpt}
            onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
            placeholder="Brief description of your post..."
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-1">
            <label htmlFor="content" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Content (Markdown supported)
            </label>
            <button
              type="button"
              onClick={() => setShowPreview(!showPreview)}
              className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
            >
              {showPreview ? 'Edit' : 'Preview'}
            </button>
          </div>
          {showPreview ? (
            <div className="border border-gray-300 dark:border-gray-600 rounded-md p-4 min-h-[300px] bg-gray-50 dark:bg-gray-700">
              {formData.content ? (
                <MarkdownPreview content={formData.content} />
              ) : (
                <p className="text-gray-500 dark:text-gray-400 italic">Nothing to preview</p>
              )}
            </div>
          ) : (
            <textarea
              id="content"
              rows={12}
              required
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 font-mono text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              placeholder="Write your post content here..."
            />
          )}
        </div>

        <div>
          <label htmlFor="categories" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Categories (comma-separated)
          </label>
          <input
            type="text"
            id="categories"
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
            value={formData.categories}
            onChange={(e) => setFormData({ ...formData, categories: e.target.value })}
            placeholder="e.g., Web Development, JavaScript"
          />
        </div>

        <div>
          <label htmlFor="tags" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Tags (comma-separated)
          </label>
          <input
            type="text"
            id="tags"
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
            value={formData.tags}
            onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
            placeholder="e.g., nextjs, react, typescript"
          />
        </div>

        <div className="flex items-center">
          <input
            type="checkbox"
            id="published"
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700"
            checked={formData.published}
            onChange={(e) => setFormData({ ...formData, published: e.target.checked })}
          />
          <label htmlFor="published" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
            Publish immediately
          </label>
        </div>

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
          >
            {loading ? 'Creating...' : 'Create Post'}
          </button>
          <Link
            href="/admin"
            className="px-6 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  )
}