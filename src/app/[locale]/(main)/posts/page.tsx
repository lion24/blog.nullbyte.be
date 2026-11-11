import { getTranslations, setRequestLocale } from 'next-intl/server'
import BranchFilter from '@/components/BranchFilter'
import BuildLog from '@/components/BuildLog'
import { getPublishedPosts } from '@/lib/posts'
import { buildBranches, isoDate, rankTopics } from '@/lib/build-log'
import { getBaseUrl } from '@/lib/url'
import { routing } from '@/i18n/routing'
import type { Metadata } from 'next'

export const revalidate = 300

type Props = {
  params: Promise<{ locale: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'posts' })
  const baseUrl = getBaseUrl()

  return {
    title: t('allPosts'),
    description: t('allPostsDescription'),
    alternates: {
      canonical: `${baseUrl}/${locale}/posts`,
      languages: {
        'x-default': `${baseUrl}/${routing.defaultLocale}/posts`,
        en: `${baseUrl}/en/posts`,
        fr: `${baseUrl}/fr/posts`,
      },
    },
  }
}

export default async function PostsPage({ params }: Props) {
  const { locale } = await params
  setRequestLocale(locale)
  const t = await getTranslations({ locale })

  const posts = await getPublishedPosts()
  const { topics, laneOf, stats } = rankTopics(posts)
  const branches = buildBranches(posts, topics, laneOf)
  const first = posts[posts.length - 1]

  return (
    <div className="bl-logpage">
      <div className="bl-wrap">
        <header className="bl-repo">
          <div className="bl-repo__body">
            <div className="bl-repo__line">
              <h1 className="bl-repo__title">{t('posts.allPosts')}</h1>
              {posts.length > 0 && (
                <span className="bl-repo__count bl-mono">{t('posts.postCount', { count: posts.length })}</span>
              )}
            </div>
            <BranchFilter locale={locale} branches={branches} total={posts.length} />
          </div>
        </header>

        <BuildLog
          locale={locale}
          posts={posts}
          laneOf={laneOf}
          stats={stats}
          emptyText={t('posts.noPostsPublished')}
          end={
            first && (
              <p className="bl-end">
                {t('home.logEnd')} ·{' '}
                <time className="bl-mono" dateTime={first.createdAt}>{isoDate(first.createdAt)}</time>
              </p>
            )
          }
        />
      </div>
    </div>
  )
}
