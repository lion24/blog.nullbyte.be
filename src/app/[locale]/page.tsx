import Image from 'next/image'
import { getTranslations } from 'next-intl/server'
import PostCard from '@/components/PostCard'
import InteractiveLink from '@/components/InteractiveLink'
import { getPublishedPosts } from '@/lib/posts'
import type { Metadata } from 'next'

type Props = {
  params: Promise<{ locale: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'home' })
  
  return {
    title: t('title'),
    description: t('subtitle'),
  }
}

export default async function HomePage({ params }: Props) {
  const { locale } = await params
  const t = await getTranslations({ locale })
  const tCommon = await getTranslations({ locale, namespace: 'common' })
  
  // Fetch latest 3 posts directly from database
  const latestPosts = await getPublishedPosts(3)

  // Add formatted reading time to each post
  const postsWithTranslations = latestPosts.map(post => ({
    ...post,
    readingTimeText: tCommon('readingTime', { minutes: post.readingTime })
  }))

  const translations = {
    readMore: tCommon('readMore'),
  }

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
            <InteractiveLink
              href={`/${locale}/posts`}
              className="px-6 py-3 rounded-lg inline-block shadow-lg"
              baseColor="var(--text-inverse)"
              hoverColor="var(--text-inverse)"
              backgroundColor="var(--primary)"
              hoverBackgroundColor="var(--primary-hover)"
            >
              {t('posts.allPosts')}
            </InteractiveLink>
            <InteractiveLink
              href="https://github.com/lion24"
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-3 rounded-lg inline-block shadow-lg"
              baseColor="var(--text-primary)"
              hoverColor="var(--text-primary)"
              backgroundColor="var(--background-secondary)"
              hoverBackgroundColor="var(--background-tertiary)"
              border="1px solid var(--border)"
              hoverBorder="1px solid var(--border-hover)"
            >
              {t('home.githubProfile')}
            </InteractiveLink>
          </div>
        </div>
      </section>

      <section className="py-16">
        <h2 className="text-3xl font-bold mb-8" style={{ color: 'var(--text-primary)' }}>{t('home.latestPosts')}</h2>
        {latestPosts.length === 0 ? (
          <div className="text-center py-12 rounded-lg" style={{
            backgroundColor: 'var(--background-secondary)',
            boxShadow: 'var(--shadow-sm)',
            border: '1px solid var(--border)'
          }}>
            <p style={{ color: 'var(--text-tertiary)' }}>{t('home.noPosts')}</p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {postsWithTranslations.map((post) => (
              <PostCard key={post.id} post={post} locale={locale} translations={translations} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
