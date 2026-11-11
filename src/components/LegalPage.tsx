import type { ReactNode } from 'react'

type Props = {
  title: string
  /** The "Last updated" line, already rendered (omitted on pages without one). */
  updated?: ReactNode
  children: ReactNode
}

/**
 * The legal pages in the Build Log world: the article page's reading column
 * (title at Article title scale, body in the article's prose styles), without
 * the article-only parts (ref line, hunk lines, share buttons, Sections index).
 */
export default function LegalPage({ title, updated, children }: Props) {
  return (
    <div className="bl-article-page bl-legal">
      <div className="bl-wrap bl-article-grid">
        <article className="bl-article-main">
          <header className="bl-article-head bl-legal__head">
            <h1 className="bl-article-title">{title}</h1>
            {updated && <p className="bl-legal__updated">{updated}</p>}
          </header>
          <div className="bl-article prose max-w-none">{children}</div>
        </article>
      </div>
    </div>
  )
}
