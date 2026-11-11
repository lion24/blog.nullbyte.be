import Link from 'next/link'
import { Fragment } from 'react'
import { notFound } from 'next/navigation'
import { getTranslations, setRequestLocale } from 'next-intl/server'
import { prisma } from '@/lib/prisma'
import { getPublishedPosts } from '@/lib/posts'
import BuildLog from '@/components/BuildLog'
import { OTHER_LANE, isoDate, rankTopics } from '@/lib/build-log'
import { getFullUrl } from '@/lib/url'
import { routing } from '@/i18n/routing'

export default async function TagPage({ params }: { params: Promise<{ slug: string; locale: string }> }) {
  const { slug, locale } = await params
  setRequestLocale(locale)

  const tag = await prisma.tag.findUnique({ where: { slug }, select: { name: true, slug: true } })
  if (!tag) notFound()

  const t = await getTranslations({ locale })
  // Lanes are ranked over every published post, so the tag keeps the colour it has on the home page.
  const all = await getPublishedPosts()
  const { laneOf, stats } = rankTopics(all)
  const lane = laneOf.get(tag.slug) ?? OTHER_LANE
  const posts = all.filter((post) => post.tags.some((x) => x.slug === tag.slug))
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
    <div className={`bl-logpage bl-lane-${lane}`}>
      <div className="bl-wrap">
        <header className="bl-listhead">
          <nav aria-label={t('breadcrumb.posts')} className="bl-crumb bl-mono">
            <Link href={`/${locale}`}>{t('breadcrumb.home')}</Link>
            <span aria-hidden="true">/</span>
            <Link href={`/${locale}/posts`}>{t('breadcrumb.posts')}</Link>
          </nav>
          <h1 className="bl-listhead__title">
            <span className="bl-listhead__swatch" aria-hidden="true" />
            <span>{tag.name}</span>
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
          focusLane={lane}
          emptyText={t('posts.noPostsWithTag')}
          end={
            first && (
              <p className="bl-end">
                {t('posts.branchStart')} ·{' '}
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
    
    // Lightweight query - only fetch tag info without posts
    const tag = await prisma.tag.findUnique({
      where: { slug },
      select: {
        name: true,
        slug: true,
        _count: {
          select: { posts: true }
        }
      }
    })

    if (!tag) {
      return {
        title: 'Tag not found',
        description: 'The requested tag could not be found',
      }
    }

    const count = tag._count.posts
    const tagUrl = getFullUrl(`/${locale}/tags/${slug}`)
    const baseUrl = getFullUrl('')

    return {
      title: `Posts tagged with "${tag.name}"`,
      description: `Browse ${count} blog ${count === 1 ? 'post' : 'posts'} tagged with ${tag.name}. Discover articles about ${tag.name} and related topics.`,
      keywords: [tag.name, 'blog posts', 'articles', 'tutorials'],
      alternates: {
        canonical: tagUrl,
        languages: {
          'x-default': `${baseUrl}/${routing.defaultLocale}/tags/${slug}`,
          'en': `${baseUrl}/en/tags/${slug}`,
          'fr': `${baseUrl}/fr/tags/${slug}`,
        },
      },
      openGraph: {
        type: 'website',
        title: `Posts tagged with "${tag.name}"`,
        description: `Browse ${count} blog ${count === 1 ? 'post' : 'posts'} tagged with ${tag.name}. Discover articles about ${tag.name} and related topics.`,
        url: tagUrl,
      },
      twitter: {
        card: 'summary_large_image',
        title: `Posts tagged with "${tag.name}"`,
        description: `Browse ${count} blog ${count === 1 ? 'post' : 'posts'} tagged with ${tag.name}.`,
      },
    }
  } catch {
    return {
      title: 'Tag not found',
      description: 'The requested tag could not be found',
    }
  }
}
