'use client'

import Link from 'next/link'
import Image from 'next/image'
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

export default function HomePage() {
  const [latestPosts, setLatestPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const t = useTranslations()
  const locale = useLocale()

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
            {t('home.title')}
          </h1>
          <p
            className="text-xl mb-8 max-w-2xl mx-auto"
            style={{ color: 'var(--text-secondary)' }}
          >
            {t('home.subtitle')}
          </p>
          <div className="flex justify-center space-x-4 flex-wrap gap-4">
            <Link
              href={`/${locale}/posts`}
              className="px-6 py-3 rounded-lg transition-colors inline-block shadow-lg"
              style={{
                backgroundColor: 'var(--primary)',
                color: 'var(--text-inverse)'
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--primary-hover)'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'var(--primary)'}
            >
              {t('posts.allPosts')}
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
              {t('home.githubProfile')}
            </Link>
          </div>
        </div>
      </section>

      <section className="py-16">
        <h2 className="text-3xl font-bold mb-8" style={{ color: 'var(--text-primary)' }}>{t('home.latestPosts')}</h2>
        {loading ? (
          <div className="text-center py-12 rounded-lg" style={{
            backgroundColor: 'var(--background-secondary)',
            boxShadow: 'var(--shadow-sm)',
            border: '1px solid var(--border)'
          }}>
            <p style={{ color: 'var(--text-secondary)' }}>{t('common.loading')}</p>
          </div>
        ) : latestPosts.length === 0 ? (
          <div className="text-center py-12 rounded-lg" style={{
            backgroundColor: 'var(--background-secondary)',
            boxShadow: 'var(--shadow-sm)',
            border: '1px solid var(--border)'
          }}>
            <p style={{ color: 'var(--text-tertiary)' }}>{t('home.noPosts')}</p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {latestPosts.map((post) => (
              <PostCard key={post.id} post={post} locale={locale} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
