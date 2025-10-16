'use client'

import ReactMarkdown from 'react-markdown'
import rehypeRaw from 'rehype-raw'
import remarkGfm from 'remark-gfm'
import remarkUnwrapImages from 'remark-unwrap-images'
import rehypeSanitize from 'rehype-sanitize'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { vscDarkPlus, vs } from 'react-syntax-highlighter/dist/esm/styles/prism'
import { useEffect, useState } from 'react'
import React from 'react'
import Image from 'next/image'

interface MarkdownPreviewProps {
  content: string
  className?: string
}

// Preprocess mixed HTML/markdown content
const preprocessContent = (content: string): string => {
  // Simple processing that doesn't interfere with code blocks
  const processed = content
    // Fix list items wrapped in spans with color styles - match asterisk at the beginning of the span content
    .replace(/<span[^>]*>\s*\*\s+([^<]+)<\/span>/g, '* $1')
    // Fix numbered list items - ensure the number and dot are at the start and followed by space
    .replace(/<span[^>]*>\s*(\d+)\.\s+([^<]+)<\/span>/g, '$1. $2')
    // Clean up empty spans that might break rendering
    .replace(/<span[^>]*>\s*<\/span>/g, '')
    // Strip inline color/background-color styles inside any style attribute
    .replace(/style\s*=\s*"([^"]*)"/gi, (_m, styles: string) => {
      const cleaned = styles
        .split(';')
        .map((s) => s.trim())
        .filter(Boolean)
        .filter((s) => !/^\s*(color|background-color)\s*:/i.test(s))
        .join('; ');
      return cleaned ? `style="${cleaned}"` : '';
    })
    // Unwrap spans that only had color styling and are now style-less
    .replace(/<span\s*>([\s\S]*?)<\/span>/gi, '$1')
    // Remove empty class/style attributes
    .replace(/\s+class="\s*"/gi, '')
    .replace(/\s+style="\s*"/gi, '');

  return processed;
}

// Helper function to check if a child is a valid React element with specific props
function isCodeElement(child: unknown): child is React.ReactElement<{ className?: string; children?: React.ReactNode }> {
  if (!React.isValidElement(child)) {
    return false;
  }

  const type = child.type;
  const props = (child as React.ReactElement).props as { className?: unknown; children?: React.ReactNode };

  const isCodeTag = type === 'code' || (typeof type === 'function' && type.name === 'code');
  const hasClassName = typeof props?.className === 'string';

  return isCodeTag || hasClassName;
}

export default function MarkdownPreview({ content, className }: MarkdownPreviewProps) {
  const [theme, setTheme] = useState<'light' | 'dark'>('light')
  
  // Preprocess the content to handle mixed HTML/markdown better
  const processedContent = preprocessContent(content)

  useEffect(() => {
    // Check if dark mode is active
    const checkTheme = () => {
      const isDark = 
        document.documentElement.getAttribute('data-theme') === 'dark' ||
        (window.matchMedia('(prefers-color-scheme: dark)').matches && 
         !document.documentElement.getAttribute('data-theme'))
      setTheme(isDark ? 'dark' : 'light')
    }

    // Initial check
    checkTheme()

    // Watch for theme changes
    const observer = new MutationObserver(checkTheme)
    observer.observe(document.documentElement, { 
      attributes: true, 
      attributeFilter: ['data-theme'] 
    })

    // Watch for system theme changes
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    mediaQuery.addEventListener('change', checkTheme)

    return () => {
      observer.disconnect()
      mediaQuery.removeEventListener('change', checkTheme)
    }
  }, [])

  return (
    <div className={`prose prose-neutral dark:prose-invert max-w-none ${className || ''}`}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkUnwrapImages]}
        rehypePlugins={[
          rehypeRaw,
          [
            rehypeSanitize,
            {
              tagNames: ['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'div', 'span', 'strong', 'em', 'u', 'del', 'ul', 'ol', 'li', 'blockquote', 'a', 'code', 'pre', 'br', 'hr', 'table', 'thead', 'tbody', 'tr', 'th', 'td', 'img'],
              attributes: {
                '*': ['style', 'class', 'id'],
                'a': ['href', 'target', 'rel'],
                'code': ['className'],
                'img': ['src', 'alt', 'title', 'width', 'height']
              }
            }
          ]
        ]}
        components={{
          pre: ({ children }) => {
            // Check if this is a code block with language (handled by SyntaxHighlighter)
            if (isCodeElement(children) && children.props?.className?.startsWith('language-')) {
              // Return the pre with minimal styling - the code component handles the rest
              return <>{children}</>;
            }
            
            // This is a code block without language specification
            if (isCodeElement(children)) {
              return (
                <pre 
                  className="p-4 rounded-lg overflow-x-auto mb-4 border border-[var(--border)]"
                  style={{
                    backgroundColor: 'var(--background-tertiary)',
                    color: 'var(--text-primary)',
                    fontSize: '0.875rem',
                    lineHeight: '1.7',
                    fontFamily: 'var(--font-mono, "SF Mono", Monaco, Consolas, "Liberation Mono", "Courier New", monospace)',
                    whiteSpace: 'pre',
                    margin: 0
                  }}
                >
                  {children.props.children}
                </pre>
              );
            }
            
            // Fallback for other cases
            return <pre>{children}</pre>;
          },
          code: ({ className, children }) => {
            const match = /language-(\w+)/.exec(className || '')
            const language = match ? match[1] : ''
            
            if (language) {
              // Code block with syntax highlighting - remove the wrapper pre
              return (
                <SyntaxHighlighter
                  language={language}
                  style={theme === 'dark' ? vscDarkPlus : vs}
                  customStyle={{
                    margin: 0,
                    padding: '1rem',
                    backgroundColor: 'var(--background-tertiary)',
                    fontSize: '0.875rem',
                    lineHeight: '1.7',
                    color: 'var(--text-primary)',
                    borderRadius: '0.5rem',
                    border: '1px solid var(--border)',
                    marginBottom: '1rem'
                  }}
                  codeTagProps={{
                    style: {
                      fontFamily: 'var(--font-mono, "SF Mono", Monaco, Consolas, "Liberation Mono", "Courier New", monospace)',
                      color: 'var(--text-primary)'
                    }
                  }}
                >
                  {String(children)}
                </SyntaxHighlighter>
              )
            }
            
            // Inline code only
            return (
              <code 
                className="px-1 py-0.5 rounded text-sm inline border border-[var(--border)]"
                style={{
                  backgroundColor: 'var(--background-tertiary)',
                  color: 'var(--text-primary)',
                  fontFamily: 'var(--font-mono, "SF Mono", Monaco, Consolas, "Liberation Mono", "Courier New", monospace)',
                  display: 'inline',
                  verticalAlign: 'baseline',
                  whiteSpace: 'nowrap'
                }}
              >
                {children}
              </code>
            )
          },
          a: ({ href, children }) => (
            <a
              href={href}
              className="hover:underline transition-colors"
              target="_blank"
              rel="noopener noreferrer"
            >
              {children}
            </a>
          ),
          img: ({ src, alt, title, width, height }) => {
            if (!src) return null;
            // Type guard: Next.js Image requires string src, not Blob
            const srcString = typeof src === 'string' ? src : null;
            if (!srcString) return null;

            // Parse width and height if provided (from markdown or editor)
            const imgWidth = width ? (typeof width === 'string' ? parseInt(width, 10) : width) : undefined;
            const imgHeight = height ? (typeof height === 'string' ? parseInt(height, 10) : height) : undefined;

            return (
              <figure className="my-6">
                <div className="relative w-full">
                  <Image
                    src={srcString}
                    alt={alt || ''}
                    title={title}
                    width={imgWidth || 0}
                    height={imgHeight || 0}
                    className="max-w-full h-auto rounded-lg mx-auto"
                    style={{
                      display: 'block',
                      marginLeft: 'auto',
                      marginRight: 'auto',
                      width: imgWidth ? `${imgWidth}px` : 'auto',
                      height: 'auto',
                    }}
                    loading="lazy"
                    unoptimized={!imgWidth || !imgHeight}
                  />
                </div>
                {title && (
                  <figcaption
                    className="text-center text-sm italic mt-2"
                    style={{ color: 'var(--text-secondary)' }}
                  >
                    {title}
                  </figcaption>
                )}
              </figure>
            );
          },
        }}
      >
        {processedContent}
      </ReactMarkdown>
    </div>
  )
}
