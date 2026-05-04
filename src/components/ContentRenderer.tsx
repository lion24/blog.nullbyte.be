import type { Value } from 'platejs'
import { renderHtml, renderMarkdown } from '@/lib/markdown'
import PlatePreviewClient from './PlatePreviewClient'

interface ContentRendererProps {
  content: string
  className?: string
}

function looksLikePlate(content: string): { value: Value } | null {
  try {
    const parsed = JSON.parse(content)
    if (
      Array.isArray(parsed) &&
      parsed.length > 0 &&
      parsed[0] &&
      typeof parsed[0] === 'object' &&
      ('type' in parsed[0] || 'children' in parsed[0])
    ) {
      return { value: parsed as Value }
    }
  } catch {
    /* not JSON, not Plate */
  }
  return null
}

function looksLikeHtmlDocument(content: string): boolean {
  const trimmed = content.trim()
  return trimmed.startsWith('<!DOCTYPE') || trimmed.startsWith('<html')
}

export async function ContentRenderer({ content, className }: ContentRendererProps) {
  if (!content) {
    return <div className={className}>No content available</div>
  }

  // Plate JSON: defer to a client island that lazy-loads the editor on mount.
  // Non-Plate posts (the common case) never download Plate.
  const plate = looksLikePlate(content)
  if (plate) {
    return <PlatePreviewClient value={plate.value} className={className} />
  }

  // Pure HTML document, or markdown (most common). Both go through unified
  // server-side and render as static HTML — no client JS for syntax
  // highlighting or rendering.
  const html = looksLikeHtmlDocument(content)
    ? await renderHtml(content)
    : await renderMarkdown(content)

  return (
    <div
      className={`prose prose-neutral dark:prose-invert max-w-none ${className || ''}`}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  )
}

export default ContentRenderer
