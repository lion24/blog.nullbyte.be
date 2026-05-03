'use client'

import { useSession } from 'next-auth/react'
import { useState, FormEvent, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useTranslations, useLocale } from 'next-intl'
import Link from 'next/link'
import Image from 'next/image'
import { PlateEditor, plateValueToMarkdown } from '@/components/PlateEditor'
import { Role } from '@prisma/client'
import type { Value } from 'platejs'

import { useUploadFile } from '@/hooks/use-upload-file'

export default function NewPostPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [editorValue, setEditorValue] = useState<Value>([{type: 'p', children: [{text: ''}]}])
  const t = useTranslations()
  const locale = useLocale()
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
      const response = await fetch('/api/admin/posts', {
        method: 'POST',
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
        await response.json()
        router.push(`/${locale}/admin`)
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
        <div style={{ color: 'var(--text-secondary)' }}>{t('common.loading')}</div>
      </div>
    )
  }

  if (!session || session.user.role !== Role.ADMIN) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center" style={{ color: 'var(--text-secondary)' }}>
          <h1 className="text-2xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>{t('auth.accessDenied')}</h1>
          <p>{t('auth.accessDeniedCreatePost')}</p>
          <Link
            href={`/${locale}`}
            className="inline-block mt-4 px-4 py-2 rounded-lg transition-colors"
            style={{
              backgroundColor: 'var(--primary)',
              color: 'var(--text-inverse)'
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--primary-hover)'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'var(--primary)'}
          >
            {t('common.goHome')}
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">{t('admin.createNewPost')}</h1>
        <Link
          href={`/${locale}/admin`}
          className="text-blue-600 dark:text-blue-400 hover:underline"
        >
          {t('admin.backToAdmin')}
        </Link>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            {t('admin.title')}
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
            {t('admin.excerpt')}
          </label>
          <textarea
            id="excerpt"
            rows={2}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
            value={formData.excerpt}
            onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
            placeholder={t('admin.excerptPlaceholder')}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            {t('admin.featuredImageOptional')}
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
              className="block w-full text-sm text-gray-500 dark:text-gray-400
                file:mr-4 file:py-2 file:px-4
                file:rounded-md file:border-0
                file:text-sm file:font-semibold
                file:bg-blue-50 file:text-blue-700
                hover:file:bg-blue-100
                dark:file:bg-gray-700 dark:file:text-gray-300
                dark:hover:file:bg-gray-600"
            />
            {isUploading && (
              <p className="text-sm text-gray-500 dark:text-gray-400">{t('admin.uploadingImage')}</p>
            )}
            {(formData.featuredImage || uploadedFile) && (
              <div className="relative w-full h-48 rounded-md overflow-hidden border border-gray-300 dark:border-gray-600">
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
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            {t('admin.content')}
          </label>
          <PlateEditor
            onChange={setEditorValue}
            placeholder={t('admin.contentPlaceholder')}
            className="rounded-md overflow-hidden"
            style={{
              border: '1px solid var(--input-border)'
            }}
          />
        </div>

        <div>
          <label htmlFor="categories" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            {t('admin.categoriesLabel')}
          </label>
          <input
            type="text"
            id="categories"
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
            value={formData.categories}
            onChange={(e) => setFormData({ ...formData, categories: e.target.value })}
            placeholder={t('admin.categoriesPlaceholder')}
          />
        </div>

        <div>
          <label htmlFor="tags" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            {t('admin.tagsLabel')}
          </label>
          <input
            type="text"
            id="tags"
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
            value={formData.tags}
            onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
            placeholder={t('admin.tagsPlaceholder')}
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
            {t('admin.publishImmediately')}
          </label>
        </div>

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
          >
            {loading ? t('admin.creating') : t('admin.createPost')}
          </button>
          <Link
            href={`/${locale}/admin`}
            className="px-6 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
          >
            {t('admin.cancel')}
          </Link>
        </div>
      </form>
    </div>
  )
}
