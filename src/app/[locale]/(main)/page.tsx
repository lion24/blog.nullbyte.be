import Link from 'next/link'
import { getTranslations, setRequestLocale } from 'next-intl/server'
import { getPublishedPosts } from '@/lib/posts'
import BranchFilter from '@/components/BranchFilter'
import BuildLog from '@/components/BuildLog'
import { buildBranches, isoDate, lanesOf, rankTopics } from '@/lib/build-log'
import { getBaseUrl, getFullUrl } from '@/lib/url'
import type { Metadata } from 'next'

// ISR: regenerate the homepage at most every 5 minutes. New posts appear
// after the next revalidation; admin actions can call revalidatePath('/[locale]')
// for immediate freshness.
export const revalidate = 300

type Props = {
  params: Promise<{ locale: string }>
}

/** Older posts shown in the log before it hands off to the full posts index. */
const LOG_LIMIT = 12

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params
  const tMeta = await getTranslations({ locale, namespace: 'metadata' })

  return {
    title: { absolute: tMeta('siteTitle') },
    description: tMeta('description'),
  }
}

export default async function HomePage({ params }: Props) {
  const { locale } = await params
  setRequestLocale(locale)
  const t = await getTranslations({ locale })

  const posts = await getPublishedPosts()
  const { topics, laneOf, stats } = rankTopics(posts)
  const branches = buildBranches(posts, topics, laneOf)

  const shown = posts.slice(0, LOG_LIMIT + 1)
  const hasMore = posts.length > shown.length
  const shownPerLane = (lane: number) => shown.filter((p) => lanesOf(p, laneOf).includes(lane)).length
  const more = branches
    .filter((b) => b.count > shownPerLane(b.lane))
    .map((b) => ({
      lane: b.lane,
      href: b.slug ? `/${locale}/tags/${b.slug}` : `/${locale}/posts`,
      label: t('home.moreInBranch', { branch: b.slug ? b.name : t('home.otherBranch') }),
    }))

  const baseUrl = getBaseUrl()
  const author = {
    '@type': 'Person' as const,
    name: 'Lionel H',
    url: baseUrl,
  }
  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebSite',
        name: 'NullByte',
        alternateName: 'NullByte - Tech Blog',
        url: baseUrl,
        inLanguage: locale,
        publisher: author,
      },
      {
        '@type': 'Blog',
        name: 'NullByte',
        url: `${baseUrl}/${locale}`,
        inLanguage: locale,
        author,
        publisher: author,
        image: getFullUrl('/logo.png'),
      },
    ],
  }

  return (
    <div className="bl-logpage">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="bl-wrap">
        <header className="bl-repo">
          <div className="bl-repo__body">
            <h1 className="bl-repo__title">{t('home.title')}</h1>
            <BranchFilter locale={locale} branches={branches} total={posts.length} />
          </div>
        </header>

        <BuildLog
          locale={locale}
          posts={shown}
          laneOf={laneOf}
          stats={stats}
          head
          more={more}
          emptyText={t('home.noPosts')}
          end={
            hasMore ? (
              <Link href={`/${locale}/posts`} className="bl-end bl-title-link">
                {t('posts.allPosts')} →
              </Link>
            ) : (
              <p className="bl-end">
                {t('home.logEnd')} ·{' '}
                <time className="bl-mono" dateTime={posts[posts.length - 1]?.createdAt}>
                  {isoDate(posts[posts.length - 1]?.createdAt ?? '')}
                </time>
              </p>
            )
          }
        />
      </div>
    </div>
  )
}
