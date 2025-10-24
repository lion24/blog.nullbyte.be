'use client'

import { useSession } from 'next-auth/react'
import { useState, useEffect, FormEvent, use, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { PlateEditor, plateValueToMarkdown } from '@/components/PlateEditor'
import type { Value } from 'platejs'
import { useUploadFile } from '@/hooks/use-upload-file'

type Post = {
  id: string
  title: string
  content: string
  excerpt: string | null
  featuredImage: string | null
  published: boolean
  tags: Array<{ name: string }>
  categories: Array<{ name: string }>
}

export default function EditPostPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const { data: session, status } = useSession()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [fetchingPost, setFetchingPost] = useState(true)
  const [editorValue, setEditorValue] = useState<Value>([{type: 'p', children: [{text: ''}]}])
  const [markdownContent, setMarkdownContent] = useState<string>('')
  const [formData, setFormData] = useState({
    title: '',
    excerpt: '',
    featuredImage: '',
    tags: '',
    categories: '',
    published: false,
  })
  const { uploadFile, isUploading, uploadedFile } = useUploadFile({
    onUploadComplete: (file) => {
      setFormData({ ...formData, featuredImage: file.url })
    },
  })

  const fetchPost = useCallback(async () => {
    try {
      const response = await fetch(`/api/posts/${id}`)
      if (!response.ok) {
        throw new Error('Failed to fetch post')
      }
      const post: Post = await response.json()
      
      setFormData({
        title: post.title,
        excerpt: post.excerpt || '',
        featuredImage: post.featuredImage || '',
        tags: post.tags.map(t => t.name).join(', '),
        categories: post.categories.map(c => c.name).join(', '),
        published: post.published,
      })
      
      // Set markdown content directly - PlateEditor will handle conversion
      setMarkdownContent(post.content)
    } catch (error) {
      console.error('Error fetching post:', error)
      alert('Failed to load post')
      router.push('/admin')
    } finally {
      setFetchingPost(false)
    }
  }, [id, router])

  useEffect(() => {
    if (status === 'loading') return
    if (!session) {
      router.push('/')
      return
    }

    fetchPost()
  }, [session, status, router, fetchPost])

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch(`/api/posts/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          content: plateValueToMarkdown(editorValue),
          tags: formData.tags.split(',').map(tag => tag.trim()).filter(Boolean),
          categories: formData.categories.split(',').map(cat => cat.trim()).filter(Boolean),
        }),
      })

      if (response.ok) {
        router.push('/admin')
      } else {
        const error = await response.json()
        alert(error.error || 'Failed to update post')
      }
    } catch (error) {
      console.error('Error updating post:', error)
      alert('Failed to update post')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this post? This action cannot be undone.')) {
      return
    }

    setDeleting(true)
    try {
      const response = await fetch(`/api/posts/${id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        router.push('/admin')
      } else {
        const error = await response.json()
        alert(error.error || 'Failed to delete post')
      }
    } catch (error) {
      console.error('Error deleting post:', error)
      alert('Failed to delete post')
    } finally {
      setDeleting(false)
    }
  }

  if (status === 'loading' || fetchingPost) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="text-secondary">Loading...</div>
      </div>
    )
  }

  if (!session) {
    return null
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Edit Post</h1>
        <Link
          href="/admin"
          className="text-secondary hover:text-primary transition-colors"
        >
          Back to Admin
        </Link>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 p-6 rounded-lg" style={{
        backgroundColor: 'var(--background-secondary)',
        boxShadow: 'var(--shadow-md)',
        border: '1px solid var(--border)'
      }}>
        <div>
          <label htmlFor="title" className="block text-sm font-medium mb-1" style={{ color: 'var(--text-primary)' }}>
            Title
          </label>
          <input
            type="text"
            id="title"
            required
            className="w-full px-3 py-2 rounded-md focus:outline-none transition-colors"
            style={{
              backgroundColor: 'var(--input-background)',
              border: '1px solid var(--input-border)',
              color: 'var(--text-primary)'
            }}
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          />
        </div>

        <div>
          <label htmlFor="excerpt" className="block text-sm font-medium mb-1" style={{ color: 'var(--text-primary)' }}>
            Excerpt
          </label>
          <textarea
            id="excerpt"
            rows={2}
            className="w-full px-3 py-2 rounded-md focus:outline-none transition-colors"
            style={{
              backgroundColor: 'var(--input-background)',
              border: '1px solid var(--input-border)',
              color: 'var(--text-primary)'
            }}
            value={formData.excerpt}
            onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
            placeholder="Brief description of your post..."
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-primary)' }}>
            Featured Image (Optional)
          </label>
          <div className="space-y-2">
            <input
              type="file"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files?.[0]
                if (file) {
                  uploadFile(file)
                }
              }}
              disabled={isUploading}
              className="block w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold"
              style={{
                color: 'var(--text-secondary)'
              }}
            />
            {isUploading && (
              <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Uploading image...</p>
            )}
            {(formData.featuredImage || uploadedFile) && (
              <div className="relative w-full h-48 rounded-md overflow-hidden" style={{ border: '1px solid var(--border)' }}>
                <Image
                  src={formData.featuredImage || uploadedFile?.url || ''}
                  alt="Featured image preview"
                  fill
                  className="object-cover"
                />
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, featuredImage: '' })}
                  className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            )}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
            Content
          </label>
          <PlateEditor
            initialValue={markdownContent}
            onChange={setEditorValue}
            placeholder="Write your post content here..."
            className="rounded-md overflow-hidden"
            style={{
              border: '1px solid var(--input-border)'
            }}
          />
        </div>

        <div>
          <label htmlFor="categories" className="block text-sm font-medium mb-1" style={{ color: 'var(--text-primary)' }}>
            Categories (comma-separated)
          </label>
          <input
            type="text"
            id="categories"
            className="w-full px-3 py-2 rounded-md focus:outline-none transition-colors"
            style={{
              backgroundColor: 'var(--input-background)',
              border: '1px solid var(--input-border)',
              color: 'var(--text-primary)'
            }}
            value={formData.categories}
            onChange={(e) => setFormData({ ...formData, categories: e.target.value })}
            placeholder="e.g., Web Development, JavaScript"
          />
        </div>

        <div>
          <label htmlFor="tags" className="block text-sm font-medium mb-1" style={{ color: 'var(--text-primary)' }}>
            Tags (comma-separated)
          </label>
          <input
            type="text"
            id="tags"
            className="w-full px-3 py-2 rounded-md focus:outline-none transition-colors"
            style={{
              backgroundColor: 'var(--input-background)',
              border: '1px solid var(--input-border)',
              color: 'var(--text-primary)'
            }}
            value={formData.tags}
            onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
            placeholder="e.g., nextjs, react, typescript"
          />
        </div>

        <div className="flex items-center">
          <input
            type="checkbox"
            id="published"
            className="h-4 w-4 rounded transition-colors"
            style={{
              accentColor: 'var(--primary)',
              borderColor: 'var(--input-border)'
            }}
            checked={formData.published}
            onChange={(e) => setFormData({ ...formData, published: e.target.checked })}
          />
          <label htmlFor="published" className="ml-2 block text-sm" style={{ color: 'var(--text-primary)' }}>
            Published
          </label>
        </div>

        <div className="flex gap-3 justify-between">
          <div className="flex gap-3">
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 rounded-md focus:outline-none disabled:opacity-50 transition-colors"
              style={{
                backgroundColor: 'var(--primary)',
                color: 'var(--text-inverse)'
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--primary-hover)'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'var(--primary)'}
            >
              {loading ? 'Updating...' : 'Update Post'}
            </button>
            <Link
              href="/admin"
              className="px-6 py-2 rounded-md focus:outline-none transition-colors"
              style={{
                backgroundColor: 'var(--background-tertiary)',
                color: 'var(--text-primary)',
                border: '1px solid var(--border)'
              }}
              onMouseEnter={(e) => e.currentTarget.style.borderColor = 'var(--border-hover)'}
              onMouseLeave={(e) => e.currentTarget.style.borderColor = 'var(--border)'}
            >
              Cancel
            </Link>
          </div>
          <button
            type="button"
            onClick={handleDelete}
            disabled={deleting}
            className="px-6 py-2 rounded-md focus:outline-none disabled:opacity-50 transition-colors"
            style={{
              backgroundColor: 'var(--danger)',
              color: 'var(--text-inverse)'
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--danger-hover)'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'var(--danger)'}
          >
            {deleting ? 'Deleting...' : 'Delete Post'}
          </button>
        </div>
      </form>
    </div>
  )
}