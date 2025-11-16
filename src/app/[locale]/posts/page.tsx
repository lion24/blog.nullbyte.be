import { getTranslations } from 'next-intl/server'
import PostCard from '@/components/PostCard'
import { getPublishedPosts } from '@/lib/posts'
import type { Metadata } from 'next'

type Props = {
  params: Promise<{ locale: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'posts' })
  
  return {
    title: t('allPosts'),
    description: t('allPostsDescription'),
  }
}

export default async function PostsPage({ params }: Props) {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'posts' })
  const tCommon = await getTranslations({ locale, namespace: 'common' })
  
  // Fetch posts directly from database (Server Component)
  const posts = await getPublishedPosts()

  // Add formatted reading time to each post
  const postsWithTranslations = posts.map(post => ({
    ...post,
    readingTimeText: tCommon('readingTime', { minutes: post.readingTime })
  }))

  const translations = {
    readMore: tCommon('readMore'),
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-8" style={{ color: 'var(--text-primary)' }}>
        {t('allPosts')}
      </h1>

      {posts.length === 0 ? (
        <div className="text-center py-12 rounded-lg" style={{
          backgroundColor: 'var(--background-secondary)',
          boxShadow: 'var(--shadow-sm)',
          border: '1px solid var(--border)'
        }}>
          <p style={{ color: 'var(--text-tertiary)' }}>{t('noPostsPublished')}</p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {postsWithTranslations.map((post) => (
            <PostCard key={post.id} post={post} locale={locale} translations={translations} />
          ))}
        </div>
      )}
    </div>
  )
}
