'use client'

import { useEffect, useState } from 'react'

type ViewCounterProps = {
  postId: string
  initialViews: number
  locale: string
  /** Localized templates with "#" for the number, e.g. { one: '# view', other: '# views' }. */
  templates: { one: string; other: string }
  className?: string
}

/**
 * Client-side view counter. Shows the snapshot view count rendered by the
 * server and fires a one-shot POST to increment it. Keeping the increment
 * out of the page render is what lets the post route be ISR-cached.
 */
export function ViewCounter({ postId, initialViews, locale, templates, className }: ViewCounterProps) {
  const [views, setViews] = useState(initialViews)

  useEffect(() => {
    // sessionStorage guard avoids double-counting within a tab (StrictMode in
    // dev fires effects twice; same tab re-renders shouldn't keep counting).
    const key = `view:${postId}`
    if (sessionStorage.getItem(key)) return
    sessionStorage.setItem(key, '1')

    fetch(`/api/posts/${encodeURIComponent(postId)}/view`, {
      method: 'POST',
      keepalive: true,
    })
      .then((res) => (res.ok ? setViews((v) => v + 1) : null))
      .catch(() => {})
  }, [postId])

  const form = new Intl.PluralRules(locale).select(views) === 'one' ? templates.one : templates.other
  return <span className={className}>{form.replace('#', views.toLocaleString(locale))}</span>
}
