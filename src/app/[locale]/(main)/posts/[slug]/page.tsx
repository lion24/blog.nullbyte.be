import { Fragment } from 'react'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import SocialShare from '@/components/SocialShare'
import ArticleEnhancer from '@/components/ArticleEnhancer'
import { ViewCounter } from '@/components/ViewCounter'
import { getTranslations, setRequestLocale } from 'next-intl/server'
import { prisma } from '@/lib/prisma'
import { calculateReadingTime, countCodeBlocks, countWords } from '@/lib/reading-time'
import { renderArticle } from '@/lib/markdown'
import { OTHER_LANE, isoDate, rankTopics, shortId, subjectOf } from '@/lib/build-log'
import { getFullUrl } from '@/lib/url'
import { routing } from '@/i18n/routing'
import type { Metadata } from 'next'

// ISR: each post is regenerated at most once per minute. New slugs not in
// generateStaticParams are rendered on demand and cached after first request.
export const revalidate = 60

export async function generateStaticParams() {
  // CI builds without DB connectivity (placeholder DATABASE_URL) hit this code
  // path. Returning [] there falls back to fully on-demand ISR — posts render
  // and cache on first request instead of being pre-rendered at build time.
  try {
    const posts = await prisma.post.findMany({
      where: { published: true },
      select: { slug: true },
    })
    return posts.flatMap((post) =>
      routing.locales.map((locale) => ({ locale, slug: post.slug }))
    )
  } catch (err) {
    console.warn('generateStaticParams: skipping DB query, falling back to on-demand ISR', err)
    return []
  }
}

type Props = {
  params: Promise<{ slug: string; locale: string }>
}

type Post = {
  id: string
  title: string
  content: string
  excerpt: string | null
  featuredImage: string | null
  published: boolean
  views: number
  readingTime: number
  createdAt: string
  updatedAt: string
  author: {
    name: string | null
  }
  tags: Array<{ id: string; name: string; slug: string }>
  categories: Array<{ id: string; name: string; slug: string }>
}

async function getPostBySlug(slug: string): Promise<Post | null> {
  const post = await prisma.post.findUnique({
    where: { slug },
    include: {
      author: true,
      tags: true,
      categories: true,
    },
  })

  if (!post || !post.published) {
    return null
  }

  return {
    ...post,
    views: post.views,
    readingTime: calculateReadingTime(post.content),
    createdAt: post.createdAt.toISOString(),
    updatedAt: post.updatedAt.toISOString(),
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug, locale } = await params
  const post = await getPostBySlug(slug)
  
  if (!post) {
    return {
      title: 'Post Not Found',
    }
  }

  const fullUrl = getFullUrl(`/${locale}/posts/${slug}`)
  const baseUrl = getFullUrl('')
  
  return {
    title: post.title,
    description: post.excerpt || undefined,
    keywords: post.tags.length ? post.tags.map(tag => tag.name).join(', ') : undefined,
    authors: post.author.name ? [{ name: post.author.name }] : undefined,
    alternates: {
      canonical: fullUrl,
      languages: {
        'x-default': `${baseUrl}/${routing.defaultLocale}/posts/${slug}`,
        'en': `${baseUrl}/en/posts/${slug}`,
        'fr': `${baseUrl}/fr/posts/${slug}`,
      },
    },
    openGraph: {
      title: post.title,
      description: post.excerpt || undefined,
      type: 'article',
      url: fullUrl,
      images: post.featuredImage ? [{ url: post.featuredImage }] : undefined,
      publishedTime: post.createdAt,
      modifiedTime: post.updatedAt,
      authors: post.author.name ? [post.author.name] : undefined,
      tags: post.tags.map(tag => tag.name),
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: post.excerpt || undefined,
      images: post.featuredImage ? [post.featuredImage] : undefined,
    },
  }
}

export default async function PostPage({ params }: Props) {
  const { slug, locale } = await params
  setRequestLocale(locale)
  const t = await getTranslations({ locale })
  const tSocial = await getTranslations({ locale, namespace: 'social' })

  // Fetch post directly from database
  const post = await getPostBySlug(slug)

  if (!post) {
    notFound()
  }

  // One light query (no bodies) feeds topic colours, neighbours and "more on this topic".
  const log = (
    await prisma.post.findMany({
      where: { published: true },
      orderBy: { createdAt: 'desc' },
      select: { id: true, title: true, slug: true, createdAt: true, tags: { select: { name: true, slug: true } } },
    })
  ).map((p) => ({ ...p, createdAt: p.createdAt.toISOString() }))
  const { laneOf, stats } = rankTopics(log)
  const subject = subjectOf(post, laneOf, stats)
  const lane = subject.lane
  const index = log.findIndex((p) => p.id === post.id)
  const newer = index > 0 ? log[index - 1] : null
  const older = index >= 0 && index < log.length - 1 ? log[index + 1] : null
  const sameTopic = subject.tag
    ? log.filter((p) => p.id !== post.id && p.tags.some((tag) => tag.slug === subject.tag!.slug))
    : []

  const pad = (n: number) => String(n).padStart(2, '0')
  const { html, sections } = await renderArticle(post.content, {
    hunk: (n, total, count) => t('posts.hunk', { n: pad(n), total: pad(total), count }),
    anchor: t('posts.linkToSection'),
    copy: t('posts.copyCode'),
    title: post.title,
  })
  const showIndex = sections.filter((s) => s.level === 2).length >= 2
  const nf = new Intl.NumberFormat(locale)

  // Get full URL for sharing
  const postUrl = getFullUrl(`/${locale}/posts/${slug}`)

  const socialTranslations = {
    share: tSocial('share'),
    shareOnFacebook: tSocial('shareOnFacebook'),
    shareOnX: tSocial('shareOnX'),
    shareOnReddit: tSocial('shareOnReddit'),
    copyLink: tSocial('copyLink'),
  }
  const viewTemplates = {
    one: t('posts.viewCount', { count: 1 }).replace('1', '#'),
    other: t('posts.viewCount', { count: 2 }).replace('2', '#'),
  }

  const statLine = [
    <time key="d" dateTime={post.createdAt}>{isoDate(post.createdAt)}</time>,
    <span key="rt">{t('common.readingTime', { minutes: post.readingTime })}</span>,
    <span key="w">{t('home.words', { count: nf.format(countWords(post.content)) })}</span>,
    <span key="c">{t('home.codeBlocks', { count: countCodeBlocks(post.content) })}</span>,
    <ViewCounter key="v" postId={post.id} initialViews={post.views} locale={locale} templates={viewTemplates} />,
  ]

  const sectionList = (
    <ol className="bl-sections__list">
      {sections.map((s) => (
        <li key={s.id} className={s.level === 3 ? 'bl-sections__sub' : undefined}>
          <a href={`#${s.id}`} data-section-link="">
            {s.n !== undefined && <span className="bl-sections__n bl-mono">{pad(s.n)}</span>}
            <span>{s.text}</span>
          </a>
        </li>
      ))}
    </ol>
  )

  const neighbour = (p: (typeof log)[number] | null, label: string, dir: 'older' | 'newer') =>
    p ? (
      <Link href={`/${locale}/posts/${p.slug}`} className={`bl-nextprev__link bl-nextprev__link--${dir}`}>
        <span className="bl-nextprev__label bl-mono">
          {dir === 'older' ? `← ${label}` : `${label} →`}
        </span>
        <span className="bl-nextprev__title">{p.title}</span>
      </Link>
    ) : (
      <span aria-hidden="true" />
    )

  return (
    <div className={`bl-article-page bl-lane-${lane}`}>
      <div className="bl-wrap bl-article-grid">
        <article className="bl-article-main">
          <header className="bl-article-head">
            <nav aria-label={t('breadcrumb.posts')} className="bl-crumb bl-mono">
              <Link href={`/${locale}`}>{t('breadcrumb.home')}</Link>
              <span aria-hidden="true">/</span>
              <Link href={`/${locale}/posts`}>{t('breadcrumb.posts')}</Link>
              {subject.tag && (
                <>
                  <span aria-hidden="true">/</span>
                  <Link href={`/${locale}/tags/${subject.tag.slug}`}>{subject.tag.name}</Link>
                </>
              )}
            </nav>

            <div className="bl-ref bl-mono">
              <span className="bl-branch__swatch" aria-hidden="true" />
              <span className="bl-hash">{shortId(post.id)}</span>
              {subject.tag && <span className="bl-chip">{subject.tag.name}</span>}
            </div>
            <p className="bl-stats bl-mono">
              {statLine.map((item, i) => (
                <Fragment key={i}>
                  <span className="bl-stats__item">
                    {item}
                    {i < statLine.length - 1 && <span className="bl-stats__sep" aria-hidden="true">{' ·'}</span>}
                  </span>
                  {i < statLine.length - 1 && ' '}
                </Fragment>
              ))}
            </p>

            <h1 className="bl-article-title">{post.title}</h1>
            {post.excerpt && <p className="bl-article-lede">{post.excerpt}</p>}

            <div className="bl-article-byline">
              <span>{t('posts.byAuthor', { author: post.author.name || t('admin.anonymous') })}</span>
              <SocialShare url={postUrl} title={post.title} translations={socialTranslations} />
            </div>
          </header>

          {post.featuredImage && (
            <figure className="bl-article-figure">
              <Image
                src={post.featuredImage}
                alt=""
                fill
                sizes="(min-width: 1100px) 760px, 100vw"
                className="object-cover"
                priority
              />
            </figure>
          )}

          {showIndex && (
            <details className="bl-sections bl-sections--inline">
              <summary className="bl-sections__label">{t('posts.sections')}</summary>
              {sectionList}
            </details>
          )}

          <div className="bl-article prose max-w-none" dangerouslySetInnerHTML={{ __html: html }} />

          <footer className="bl-article-end">
            {post.tags.length > 0 && (
              <div className="bl-article-tags">
                <span className="bl-sections__label">{t('posts.tags')}</span>
                {post.tags.map((tag) => (
                  <Link
                    key={tag.id}
                    href={`/${locale}/tags/${tag.slug}`}
                    className={`bl-topic bl-lane-${laneOf.get(tag.slug) ?? OTHER_LANE}`}
                  >
                    {tag.name}
                  </Link>
                ))}
              </div>
            )}

            {subject.tag && sameTopic.length > 0 && (
              <section className="bl-more" aria-labelledby="bl-more-title">
                <h2 id="bl-more-title" className="bl-more__title">
                  {t('posts.moreOnTopic', { topic: subject.tag.name })}
                </h2>
                <ul className="bl-more__list">
                  {sameTopic.slice(0, 3).map((p) => (
                    <li key={p.id}>
                      <Link href={`/${locale}/posts/${p.slug}`} className="bl-title-link bl-more__link">
                        {p.title}
                      </Link>
                      <span className="bl-meta bl-mono">
                        <span>{shortId(p.id)}</span>
                        <time dateTime={p.createdAt}>{isoDate(p.createdAt)}</time>
                      </span>
                    </li>
                  ))}
                </ul>
                <Link href={`/${locale}/tags/${subject.tag.slug}`} className="bl-end bl-title-link">
                  {t('posts.allInTopic', { topic: subject.tag.name })} →
                </Link>
              </section>
            )}

            {(older || newer) && (
              <nav className="bl-nextprev" aria-label={`${t('posts.olderPost')} / ${t('posts.newerPost')}`}>
                {neighbour(older, t('posts.olderPost'), 'older')}
                {neighbour(newer, t('posts.newerPost'), 'newer')}
              </nav>
            )}

            <Link href={`/${locale}/posts`} className="bl-back">
              {t('common.backToAllPosts')}
            </Link>
          </footer>
        </article>

        {showIndex && (
          <aside className="bl-sections bl-sections--margin">
            <nav aria-label={t('posts.sections')}>
              <p className="bl-sections__label">{t('posts.sections')}</p>
              {sectionList}
            </nav>
          </aside>
        )}
      </div>
      <ArticleEnhancer copyLabel={t('posts.copyCode')} copiedLabel={t('posts.copiedCode')} />
    </div>
  )
}
