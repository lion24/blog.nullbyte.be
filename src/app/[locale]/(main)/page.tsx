import Link from 'next/link'
import { Fragment, type CSSProperties } from 'react'
import { getTranslations, setRequestLocale } from 'next-intl/server'
import { getPublishedPosts, type PostSummary } from '@/lib/posts'
import BranchSwitcher from '@/components/BranchSwitcher'
import { OTHER_LANE, isoDate, rankTopics, shortId, subjectOf as subjectFor } from '@/lib/build-log'
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

type Branch = { lane: number; slug: string | null; name: string; count: number; latest: string }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params
  const tMeta = await getTranslations({ locale, namespace: 'metadata' })

  return {
    title: { absolute: tMeta('siteTitle') },
    description: tMeta('description'),
  }
}

/** Branches for the switcher: the ranked topic lanes plus the folded "other" lane. */
function buildBranches(posts: PostSummary[]) {
  const { topics, laneOf, stats } = rankTopics(posts)

  const lanesFor = (post: PostSummary): number[] => {
    const lanes = new Set<number>()
    for (const tag of post.tags) lanes.add(laneOf.get(tag.slug) ?? OTHER_LANE)
    if (lanes.size === 0) lanes.add(OTHER_LANE)
    return [...lanes].sort((a, b) => a - b)
  }

  const subjectOf = (post: PostSummary) => subjectFor(post, laneOf, stats)

  const otherPosts = posts.filter((p) => lanesFor(p).includes(OTHER_LANE))
  const branches: Branch[] = [...topics]
  if (otherPosts.length > 0) {
    branches.push({ lane: OTHER_LANE, slug: null, name: '', count: otherPosts.length, latest: otherPosts[0].createdAt })
  }
  return { branches, laneOf, lanesFor, subjectOf }
}

export default async function HomePage({ params }: Props) {
  const { locale } = await params
  setRequestLocale(locale)
  const t = await getTranslations({ locale })

  const posts = await getPublishedPosts()
  const { branches, laneOf, lanesFor, subjectOf } = buildBranches(posts)
  const nf = new Intl.NumberFormat(locale)

  const shown = posts.slice(0, LOG_LIMIT + 1)
  const rows = shown.map((post) => {
    const lanes = lanesFor(post)
    const subject = subjectOf(post)
    return { post, lanes, primary: subject.lane, subject: subject.tag }
  })
  // A lane's rail starts at the newest row that belongs to it and runs to the end of the log.
  const firstRow = new Map<number, number>()
  rows.forEach((row, i) => row.lanes.forEach((l) => { if (!firstRow.has(l)) firstRow.set(l, i) }))
  const activeLanes = [...firstRow.keys()].sort((a, b) => a - b)
  const hasMore = posts.length > shown.length
  const shownPerLane = (lane: number) => rows.filter((r) => r.lanes.includes(lane)).length

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

  const graphCell = (rowIndex: number, nodeLanes: number[], primary: number | null, isEnd = false) => (
    <div className="bl-graph" aria-hidden="true">
      {activeLanes
        .filter((l) => (firstRow.get(l) ?? Infinity) <= rowIndex)
        .map((l) => {
          const tip = firstRow.get(l) === rowIndex
          const cls = ['bl-seg', `bl-lane-${l}`, tip && 'bl-seg--tip', isEnd && 'bl-seg--root'].filter(Boolean).join(' ')
          return <span key={`s${l}`} className={cls} style={{ '--rev': rows.length - rowIndex } as CSSProperties} />
        })}
      {nodeLanes.map((l) =>
        l === primary ? (
          <span key={`n${l}`} className={`bl-node bl-lane-${l}`} />
        ) : (
          <span key={`n${l}`} className={`bl-node bl-node--dot bl-lane-${l}`} />
        ),
      )}
    </div>
  )

  const topicLinks = (post: PostSummary) =>
    post.tags.map((tag) => (
      <Link
        key={tag.id}
        href={`/${locale}/tags/${tag.slug}`}
        className={`bl-topic bl-lane-${laneOf.get(tag.slug) ?? OTHER_LANE}`}
      >
        {tag.name}
      </Link>
    ))

  const [head, ...older] = rows

  return (
    <div className="bl-home">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="bl-wrap">
        <header className="bl-repo">
          <div className="bl-repo__body">
            <h1 className="bl-repo__title">{t('home.title')}</h1>
            {branches.length > 0 && (
              <BranchSwitcher>
              <fieldset className="bl-branches">
                <legend className="bl-branches__legend">{t('home.branchesLabel')}</legend>
                <div className="bl-branches__list">
                  <div className="bl-branch">
                    <input type="radio" name="bl-branch" id="bl-b-all" defaultChecked />
                    <label htmlFor="bl-b-all">
                      {t('home.allBranches')}
                      <span className="bl-branch__stat bl-mono">{nf.format(posts.length)}</span>
                    </label>
                  </div>
                  {branches.map((b) => (
                    <div className="bl-branch" key={b.lane}>
                      <input type="radio" name="bl-branch" id={`bl-b-${b.lane}`} />
                      <label htmlFor={`bl-b-${b.lane}`} className={`bl-lane-${b.lane}`}>
                        <span className="bl-branch__swatch" aria-hidden="true" />
                        {b.slug ? b.name : t('home.otherBranch')}
                        <span className="bl-branch__stat bl-mono">
                          {nf.format(b.count)}
                          <span className="bl-branch__when">
                            <span className="bl-branch__dot" aria-hidden="true">·</span>
                            <time dateTime={b.latest}>{isoDate(b.latest)}</time>
                          </span>
                        </span>
                      </label>
                    </div>
                  ))}
                </div>
              </fieldset>
              </BranchSwitcher>
            )}
          </div>
        </header>

        {!head ? (
          <ol className="bl-log">
            <li className="bl-row bl-row--empty">
              <div className="bl-graph" aria-hidden="true">
                <span className={`bl-node bl-lane-${OTHER_LANE}`} />
              </div>
              <div className="bl-content">
                <p className="bl-empty">{t('home.noPosts')}</p>
              </div>
            </li>
          </ol>
        ) : (
          <ol className="bl-log">
            <li className="bl-row bl-row--head" data-lane={head.primary} data-lanes={head.lanes.join(' ')} style={{ viewTransitionName: 'bl-row-0' } as CSSProperties}>
              {graphCell(0, head.lanes, head.primary)}
              <article className="bl-content">
                <div className="bl-ref bl-mono">
                  <span className="bl-hash">{shortId(head.post.id)}</span>
                  <span className="bl-chip">
                    HEAD → {head.subject?.name ?? t('home.otherBranch')}
                  </span>
                  <span className="bl-sr-only">{t('home.latestLabel')}</span>
                </div>
                <h2 className="bl-head__title">
                  <Link href={`/${locale}/posts/${head.post.slug}`} className="bl-title-link">
                    {head.post.title}
                  </Link>
                </h2>
                {head.post.excerpt && <p className="bl-head__excerpt">{head.post.excerpt}</p>}
                <p className="bl-stats bl-mono">
                  {[
                    <span key="rt">{t('common.readingTime', { minutes: head.post.readingTime })}</span>,
                    head.post.wordCount !== undefined && (
                      <span key="w">{t('home.words', { count: nf.format(head.post.wordCount) })}</span>
                    ),
                    head.post.codeBlocks !== undefined && (
                      <span key="c">{t('home.codeBlocks', { count: head.post.codeBlocks })}</span>
                    ),
                    <time key="d" dateTime={head.post.createdAt}>{isoDate(head.post.createdAt)}</time>,
                  ]
                    .filter(Boolean)
                    .map((item, i, all) => (
                      <Fragment key={i}>
                        {/* The dot stays glued to its item; the plain space after it is the break point. */}
                        <span className="bl-stats__item">
                          {item}
                          {i < all.length - 1 && <span className="bl-stats__sep" aria-hidden="true">{'\u00a0·'}</span>}
                        </span>
                        {i < all.length - 1 && ' '}
                      </Fragment>
                    ))}
                </p>
                <Link href={`/${locale}/posts/${head.post.slug}`} className="bl-cta">
                  {t('home.readLatest')}
                  <span className="bl-cta__arrow" aria-hidden="true">→</span>
                </Link>
              </article>
            </li>

            {older.map((row, i) => (
              <li
                key={row.post.id}
                className="bl-row"
                data-lane={row.primary}
                data-lanes={row.lanes.join(' ')}
                style={{ viewTransitionName: `bl-row-${i + 1}` } as CSSProperties}
              >
                {graphCell(i + 1, row.lanes, row.primary)}
                <article className="bl-content">
                  <h2 className="bl-row__title">
                    <Link href={`/${locale}/posts/${row.post.slug}`} className="bl-title-link">
                      {row.post.title}
                    </Link>
                  </h2>
                  {row.post.excerpt && <p className="bl-row__excerpt">{row.post.excerpt}</p>}
                  <div className="bl-meta bl-mono">
                    <span>{shortId(row.post.id)}</span>
                    <time dateTime={row.post.createdAt}>{isoDate(row.post.createdAt)}</time>
                    <span>{t('common.readingTime', { minutes: row.post.readingTime })}</span>
                    {topicLinks(row.post)}
                  </div>
                </article>
              </li>
            ))}

            {branches
              .filter((b) => b.count > shownPerLane(b.lane))
              .map((b) => (
                <li key={`more-${b.lane}`} className="bl-row bl-row--more" data-more={b.lane}>
                  {graphCell(rows.length, [], null)}
                  <div className="bl-content">
                    <Link
                      href={b.slug ? `/${locale}/tags/${b.slug}` : `/${locale}/posts`}
                      className="bl-end bl-title-link"
                    >
                      {t('home.moreInBranch', { branch: b.slug ? b.name : t('home.otherBranch') })} →
                    </Link>
                  </div>
                </li>
              ))}

            <li className="bl-row bl-row--end" data-lanes={activeLanes.join(' ')}>
              {graphCell(rows.length, [], null, true)}
              <div className="bl-content">
                {hasMore ? (
                  <Link href={`/${locale}/posts`} className="bl-end bl-title-link">
                    {t('posts.allPosts')} →
                  </Link>
                ) : (
                  <p className="bl-end">
                    {t('home.logEnd')} ·{' '}
                    <time className="bl-mono" dateTime={posts[posts.length - 1].createdAt}>
                      {isoDate(posts[posts.length - 1].createdAt)}
                    </time>
                  </p>
                )}
              </div>
            </li>
          </ol>
        )}
      </div>
    </div>
  )
}
