'use client'

import { useRef, type ChangeEvent, type ReactNode } from 'react'

/**
 * Progressive enhancement for the home page's branch (topic) radios.
 * Filtering itself is pure CSS (:has on the checked radio); this only wraps
 * the change in a view transition so the log visibly re-flows. Without
 * View Transitions support, or under reduced motion, the change snaps.
 */
export default function BranchSwitcher({ children }: { children: ReactNode }) {
  const checked = useRef<HTMLInputElement | null>(null)

  const onChange = (event: ChangeEvent<HTMLDivElement>) => {
    const next = event.target as unknown as HTMLInputElement
    if (next.type !== 'radio') return
    const prev = checked.current ?? (document.getElementById('bl-b-all') as HTMLInputElement | null)
    checked.current = next

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (!prev || prev === next || reduced || !('startViewTransition' in document)) return

    // Re-show the previous state for the snapshot, then apply the new one inside the transition.
    prev.checked = true
    document.startViewTransition(() => {
      next.checked = true
    })
  }

  return <div onChange={onChange}>{children}</div>
}
