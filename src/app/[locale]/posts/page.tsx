'use client'

import { useEffect, useState } from 'react'
import { useTranslations, useLocale } from 'next-intl'
import PostCard from '@/components/PostCard'

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

export default function PostsPage() {
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const t = useTranslations()
  const locale = useLocale()

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
      <h1 className="text-4xl font-bold mb-8" style={{ color: 'var(--text-primary)' }}>{t('posts.allPosts')}</h1>

      {loading ? (
        <div className="text-center py-12 rounded-lg" style={{
          backgroundColor: 'var(--background-secondary)',
          boxShadow: 'var(--shadow-sm)',
          border: '1px solid var(--border)'
        }}>
          <p style={{ color: 'var(--text-secondary)' }}>{t('posts.loadingPosts')}</p>
        </div>
      ) : posts.length === 0 ? (
        <div className="text-center py-12 rounded-lg" style={{
          backgroundColor: 'var(--background-secondary)',
          boxShadow: 'var(--shadow-sm)',
          border: '1px solid var(--border)'
        }}>
          <p style={{ color: 'var(--text-tertiary)' }}>{t('posts.noPostsPublished')}</p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {posts.map((post) => (
            <PostCard key={post.id} post={post} locale={locale} />
          ))}
        </div>
      )}
    </div>
  )
}