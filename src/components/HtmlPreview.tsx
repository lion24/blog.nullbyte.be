'use client'

import DOMPurify from 'dompurify'

interface HtmlPreviewProps {
  content: string
  className?: string
}

export default function HtmlPreview({ content, className }: HtmlPreviewProps) {
  // Sanitize HTML to prevent XSS attacks
  let sanitizedContent = DOMPurify.sanitize(content, {
    ALLOWED_TAGS: ['p', 'div', 'span', 'strong', 'em', 'u', 'del', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'ul', 'ol', 'li', 'blockquote', 'a', 'code', 'pre', 'br'],
    ALLOWED_ATTR: ['style', 'href', 'target', 'rel', 'class']
  })

  // Strip any inline color styles that may remain after sanitization
  sanitizedContent = sanitizedContent
    .replace(/style\s*=\s*"([^"]*)"/gi, (_m, styles: string) => {
      const cleaned = styles
        .split(';')
        .map((s) => s.trim())
        .filter(Boolean)
        .filter((s) => !/^\s*(color|background-color)\s*:/i.test(s))
        .join('; ');
      return cleaned ? `style="${cleaned}"` : '';
    })
    .replace(/<span\s*>([\s\S]*?)<\/span>/gi, '$1')
    .replace(/\s+class="\s*"/gi, '')
    .replace(/\s+style="\s*"/gi, '');

  return (
    <div 
      className={`html-content max-w-none ${className || ''}`}
      dangerouslySetInnerHTML={{ __html: sanitizedContent }}
      style={{
        '--html-color': 'var(--text-primary)',
        color: 'var(--text-primary)',
        lineHeight: '1.8',
        fontSize: 'inherit',
        fontFamily: 'inherit'
      } as React.CSSProperties}
    />
  )
}
