import { renderHtml, renderMarkdown } from '@/lib/markdown'

interface ContentRendererProps {
  content: string
  className?: string
}

function looksLikeHtmlDocument(content: string): boolean {
  const trimmed = content.trim()
  return trimmed.startsWith('<!DOCTYPE') || trimmed.startsWith('<html')
}

export async function ContentRenderer({ content, className }: ContentRendererProps) {
  if (!content) {
    return <div className={className}>No content available</div>
  }

  // The editor serializes to markdown on save (see PlateEditor's
  // plateValueToMarkdown), so all stored content is either markdown or a
  // pure HTML document. Both go through unified server-side; no Plate code
  // ships to readers.
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
