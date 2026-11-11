import Link from 'next/link'
import { Fragment, type CSSProperties, type ReactNode } from 'react'
import { getTranslations } from 'next-intl/server'
import type { PostSummary } from '@/lib/posts'
import { OTHER_LANE, isoDate, lanesOf, shortId, subjectOf, type TopicStat } from '@/lib/build-log'

type Props = {
  locale: string
  /** The posts to draw, newest first. */
  posts: PostSummary[]
  /** Lane ranking computed over every published post, so a topic keeps its colour site-wide. */
  laneOf: Map<string, number>
  stats: Map<string, TopicStat>
  /** Set the first post as the HEAD commit block (home page only). */
  head?: boolean
  /** Branch view: only this lane gets a rail and every node sits on it; the posts' other topics show as dots. */
  focusLane?: number
  /** "More in {branch}" rows, revealed by the branch filter. */
  more?: Array<{ lane: number; href: string; label: string }>
  /** Content of the closing row at the root of the log. */
  end: ReactNode
  emptyText: string
}

/** The Build Log graph: posts as commits on their topic rails (see DESIGN.md, "Build Log (signature)"). */
export default async function BuildLog({ locale, posts, laneOf, stats, head = false, focusLane, more = [], end, emptyText }: Props) {
  const t = await getTranslations({ locale })
  const nf = new Intl.NumberFormat(locale)

  if (posts.length === 0) {
    return (
      <ol className="bl-log">
        <li className="bl-row bl-row--empty">
          <div className="bl-graph" aria-hidden="true">
            <span className={`bl-node bl-lane-${focusLane ?? OTHER_LANE}`} />
          </div>
          <div className="bl-content">
            <p className="bl-empty">{emptyText}</p>
          </div>
        </li>
      </ol>
    )
  }

  const rows = posts.map((post) => {
    const lanes = lanesOf(post, laneOf)
    const subject = subjectOf(post, laneOf, stats)
    const primary = focusLane ?? subject.lane
    return { post, lanes, primary, rails: focusLane === undefined ? lanes : [focusLane], subject: subject.tag }
  })
  // A lane's rail starts at the newest row that belongs to it and runs to the end of the log.
  const firstRow = new Map<number, number>()
  rows.forEach((row, i) => row.rails.forEach((l) => { if (!firstRow.has(l)) firstRow.set(l, i) }))
  const activeLanes = [...firstRow.keys()].sort((a, b) => a - b)

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

  const nodeLanesOf = (row: (typeof rows)[number]) =>
    row.lanes.includes(row.primary) ? row.lanes : [row.primary, ...row.lanes]

  const headRow = head ? rows[0] : undefined
  const logRows = head ? rows.slice(1) : rows
  const offset = head ? 1 : 0

  return (
    <ol className={focusLane === undefined ? 'bl-log' : 'bl-log bl-log--branch'}>
      {headRow && (
        <li className="bl-row bl-row--head" data-lane={headRow.primary} data-lanes={headRow.lanes.join(' ')} style={{ viewTransitionName: 'bl-row-0' } as CSSProperties}>
          {graphCell(0, nodeLanesOf(headRow), headRow.primary)}
          <article className="bl-content">
            <div className="bl-ref bl-mono">
              <span className="bl-hash">{shortId(headRow.post.id)}</span>
              <span className="bl-chip">
                HEAD → {headRow.subject?.name ?? t('home.otherBranch')}
              </span>
              <span className="bl-sr-only">{t('home.latestLabel')}</span>
            </div>
            <h2 className="bl-head__title">
              <Link href={`/${locale}/posts/${headRow.post.slug}`} className="bl-title-link">
                {headRow.post.title}
              </Link>
            </h2>
            {headRow.post.excerpt && <p className="bl-head__excerpt">{headRow.post.excerpt}</p>}
            <p className="bl-stats bl-mono">
              {[
                <span key="rt">{t('common.readingTime', { minutes: headRow.post.readingTime })}</span>,
                headRow.post.wordCount !== undefined && (
                  <span key="w">{t('home.words', { count: nf.format(headRow.post.wordCount) })}</span>
                ),
                headRow.post.codeBlocks !== undefined && (
                  <span key="c">{t('home.codeBlocks', { count: headRow.post.codeBlocks })}</span>
                ),
                <time key="d" dateTime={headRow.post.createdAt}>{isoDate(headRow.post.createdAt)}</time>,
              ]
                .filter(Boolean)
                .map((item, i, all) => (
                  <Fragment key={i}>
                    {/* The dot stays glued to its item; the plain space after it is the break point. */}
                    <span className="bl-stats__item">
                      {item}
                      {i < all.length - 1 && <span className="bl-stats__sep" aria-hidden="true">{' ·'}</span>}
                    </span>
                    {i < all.length - 1 && ' '}
                  </Fragment>
                ))}
            </p>
            <Link href={`/${locale}/posts/${headRow.post.slug}`} className="bl-cta">
              {t('home.readLatest')}
              <span className="bl-cta__arrow" aria-hidden="true">→</span>
            </Link>
          </article>
        </li>
      )}

      {logRows.map((row, i) => (
        <li
          key={row.post.id}
          className="bl-row"
          data-lane={row.primary}
          data-lanes={row.lanes.join(' ')}
          style={{ viewTransitionName: `bl-row-${i + offset}` } as CSSProperties}
        >
          {graphCell(i + offset, nodeLanesOf(row), row.primary)}
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

      {more.map((m) => (
        <li key={`more-${m.lane}`} className="bl-row bl-row--more" data-more={m.lane}>
          {graphCell(rows.length, [], null)}
          <div className="bl-content">
            <Link href={m.href} className="bl-end bl-title-link">
              {m.label} →
            </Link>
          </div>
        </li>
      ))}

      <li className="bl-row bl-row--end" data-lanes={activeLanes.join(' ')}>
        {graphCell(rows.length, [], null, true)}
        <div className="bl-content">{end}</div>
      </li>
    </ol>
  )
}
