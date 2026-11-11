import Link from 'next/link'
import { Fragment } from 'react'
import { notFound } from 'next/navigation'
import { getTranslations, setRequestLocale } from 'next-intl/server'
import { prisma } from '@/lib/prisma'
import { getPublishedPosts } from '@/lib/posts'
import BuildLog from '@/components/BuildLog'
import { isoDate, rankTopics } from '@/lib/build-log'
import { getFullUrl } from '@/lib/url'
import { routing } from '@/i18n/routing'

export default async function CategoryPage({ params }: { params: Promise<{ slug: string; locale: string }> }) {
  const { slug, locale } = await params
  setRequestLocale(locale)

  const category = await prisma.category.findUnique({ where: { slug }, select: { name: true, slug: true } })
  if (!category) notFound()

  const t = await getTranslations({ locale })
  // A category has no rail of its own: its posts keep the topic rails they have on the home page.
  const all = await getPublishedPosts()
  const { laneOf, stats } = rankTopics(all)
  const posts = all.filter((post) => post.categories.some((x) => x.slug === category.slug))
  const first = posts[posts.length - 1]

  const statLine = posts.length
    ? [
        t('posts.postCount', { count: posts.length }),
        first.createdAt === posts[0].createdAt
          ? isoDate(first.createdAt)
          : `${isoDate(first.createdAt)} → ${isoDate(posts[0].createdAt)}`,
      ]
    : []

  return (
    <div className="bl-logpage">
      <div className="bl-wrap">
        <header className="bl-listhead">
          <nav aria-label={t('breadcrumb.posts')} className="bl-crumb bl-mono">
            <Link href={`/${locale}`}>{t('breadcrumb.home')}</Link>
            <span aria-hidden="true">/</span>
            <Link href={`/${locale}/posts`}>{t('breadcrumb.posts')}</Link>
          </nav>
          <h1 className="bl-listhead__title">
            <span>{category.name}</span>
          </h1>
          {statLine.length > 0 && (
            <p className="bl-stats bl-mono">
              {statLine.map((item, i) => (
                <Fragment key={i}>
                  <span className="bl-stats__item">
                    {item}
                    {i < statLine.length - 1 && <span className="bl-stats__sep" aria-hidden="true">{'\u00a0·'}</span>}
                  </span>
                  {i < statLine.length - 1 && ' '}
                </Fragment>
              ))}
            </p>
          )}
        </header>

        <BuildLog
          locale={locale}
          posts={posts}
          laneOf={laneOf}
          stats={stats}
          emptyText={t('posts.noPostsInCategory')}
          end={
            first && (
              <p className="bl-end">
                {t('posts.categoryStart')} ·{' '}
                <time className="bl-mono" dateTime={first.createdAt}>{isoDate(first.createdAt)}</time>
              </p>
            )
          }
        />

        <Link href={`/${locale}/posts`} className="bl-back">
          {t('common.backToAllPosts')}
        </Link>
      </div>
    </div>
  )
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string; locale: string }> }) {
  try {
    const { slug, locale } = await params
    
    // Lightweight query - only fetch category info without posts
    const category = await prisma.category.findUnique({
      where: { slug },
      select: {
        name: true,
        slug: true,
        _count: {
          select: { posts: true }
        }
      }
    })

    if (!category) {
      return {
        title: 'Category not found',
        description: 'The requested category could not be found',
      }
    }

    const count = category._count.posts
    const categoryUrl = getFullUrl(`/${locale}/categories/${slug}`)
    const baseUrl = getFullUrl('')

    return {
      title: `${category.name} - Blog Posts`,
      description: `Browse ${count} blog ${count === 1 ? 'post' : 'posts'} in the ${category.name} category. Discover articles about ${category.name} and related topics.`,
      keywords: [category.name, 'blog posts', 'articles', 'category', 'tutorials'],
      alternates: {
        canonical: categoryUrl,
        languages: {
          'x-default': `${baseUrl}/${routing.defaultLocale}/categories/${slug}`,
          'en': `${baseUrl}/en/categories/${slug}`,
          'fr': `${baseUrl}/fr/categories/${slug}`,
        },
      },
      openGraph: {
        type: 'website',
        title: `${category.name} - Blog Posts`,
        description: `Browse ${count} blog ${count === 1 ? 'post' : 'posts'} in the ${category.name} category. Discover articles about ${category.name} and related topics.`,
        url: categoryUrl,
      },
      twitter: {
        card: 'summary_large_image',
        title: `${category.name} - Blog Posts`,
        description: `Browse ${count} blog ${count === 1 ? 'post' : 'posts'} in the ${category.name} category.`,
      },
    }
  } catch {
    return {
      title: 'Category not found',
      description: 'The requested category could not be found',
    }
  }
}
