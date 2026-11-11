'use client'

import { useEffect, useState } from 'react'

type Props = {
  /** Button label after a successful copy, e.g. "Copied". */
  copiedLabel: string
  /** Button label at rest, e.g. "Copy". */
  copyLabel: string
}

/**
 * Progressive enhancement for the Build Log article page. The page is fully
 * server-rendered; this only:
 * - makes the code toolbars' copy buttons work (one delegated listener);
 * - marks the section currently in view in every Sections index (aria-current).
 */
export default function ArticleEnhancer({ copiedLabel, copyLabel }: Props) {
  const [status, setStatus] = useState('')

  useEffect(() => {
    const article = document.querySelector('.bl-article')
    if (!article) return

    const timers = new Map<HTMLButtonElement, number>()
    const onClick = async (event: Event) => {
      const button = (event.target as HTMLElement).closest<HTMLButtonElement>('[data-copy]')
      if (!button) return
      const code = button.closest('.bl-code')?.querySelector('pre')?.textContent ?? ''
      try {
        await navigator.clipboard.writeText(code)
        button.textContent = copiedLabel
        button.dataset.copied = 'true'
        setStatus(copiedLabel)
        window.clearTimeout(timers.get(button))
        timers.set(
          button,
          window.setTimeout(() => {
            button.textContent = copyLabel
            delete button.dataset.copied
            setStatus('')
          }, 2000),
        )
      } catch {
        // Clipboard unavailable (insecure context or denied): leave the label as is.
      }
    }
    article.addEventListener('click', onClick)

    const headings = [...article.querySelectorAll<HTMLElement>('h2[id], h3[id]')]
    const links = [...document.querySelectorAll<HTMLAnchorElement>('[data-section-link]')]
    const mark = (id: string) => {
      for (const link of links) {
        if (link.getAttribute('href') === `#${id}`) link.setAttribute('aria-current', 'location')
        else link.removeAttribute('aria-current')
      }
    }
    let observer: IntersectionObserver | undefined
    if (headings.length && links.length && 'IntersectionObserver' in window) {
      observer = new IntersectionObserver(
        () => {
          // The current section is the last heading that has scrolled past the top band.
          const passed = headings.filter((h) => h.getBoundingClientRect().top < window.innerHeight * 0.3)
          const current = passed.at(-1) ?? headings[0]
          mark(current.id)
        },
        { rootMargin: '0px 0px -60% 0px', threshold: [0, 1] },
      )
      headings.forEach((h) => observer!.observe(h))
      mark(headings[0].id)
    }

    return () => {
      article.removeEventListener('click', onClick)
      observer?.disconnect()
      timers.forEach((t) => window.clearTimeout(t))
    }
  }, [copiedLabel, copyLabel])

  return (
    <span className="bl-sr-only" role="status" aria-live="polite">
      {status}
    </span>
  )
}
