'use client'

import ReactMarkdown from 'react-markdown'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { vscDarkPlus, vs } from 'react-syntax-highlighter/dist/esm/styles/prism'
import { useEffect, useState } from 'react'

interface MarkdownPreviewProps {
  content: string
}

export default function MarkdownPreview({ content }: MarkdownPreviewProps) {
  const [theme, setTheme] = useState<'light' | 'dark'>('light')

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
    <div className="max-w-none">
      <ReactMarkdown
        components={{
          h1: ({ children }) => (
            <h1 className="text-3xl font-bold mt-8 mb-4" style={{ color: 'var(--text-primary)' }}>
              {children}
            </h1>
          ),
          h2: ({ children }) => (
            <h2 className="text-2xl font-semibold mt-6 mb-3" style={{ color: 'var(--text-primary)' }}>
              {children}
            </h2>
          ),
          h3: ({ children }) => (
            <h3 className="text-xl font-semibold mt-4 mb-2" style={{ color: 'var(--text-primary)' }}>
              {children}
            </h3>
          ),
          p: ({ children }) => (
            <p className="mb-4" style={{ color: 'var(--text-primary)', lineHeight: '1.8' }}>
              {children}
            </p>
          ),
          ul: ({ children }) => (
            <ul className="list-disc list-inside mb-4 space-y-2" style={{ color: 'var(--text-primary)' }}>
              {children}
            </ul>
          ),
          ol: ({ children }) => (
            <ol className="list-decimal list-inside mb-4 space-y-2" style={{ color: 'var(--text-primary)' }}>
              {children}
            </ol>
          ),
          li: ({ children }) => (
            <li className="ml-4" style={{ color: 'var(--text-primary)' }}>
              {children}
            </li>
          ),
          blockquote: ({ children }) => (
            <blockquote 
              className="border-l-4 pl-4 my-4 italic" 
              style={{ 
                borderColor: 'var(--primary)',
                color: 'var(--text-secondary)'
              }}
            >
              {children}
            </blockquote>
          ),
          code: (props) => {
            const { className, children } = props
            const match = /language-(\w+)/.exec(className || '')
            const language = match ? match[1] : ''
            
            // Check if this is a code block (has a language class or multiple lines)
            const isCodeBlock = className?.startsWith('language-') || String(children).includes('\n')
            
            if (isCodeBlock && language) {
              // Code block with syntax highlighting
              return (
                <div className="rounded-lg overflow-hidden mb-4" style={{ border: '1px solid var(--border)' }}>
                  <SyntaxHighlighter
                    language={language}
                    style={theme === 'dark' ? vscDarkPlus : vs}
                    customStyle={{
                      margin: 0,
                      padding: '1rem',
                      backgroundColor: 'var(--background-tertiary)',
                      fontSize: '0.875rem',
                      lineHeight: '1.7'
                    }}
                    codeTagProps={{
                      style: {
                        fontFamily: 'var(--font-mono), "SF Mono", Monaco, Consolas, "Liberation Mono", "Courier New", monospace'
                      }
                    }}
                  >
                    {String(children).replace(/\n$/, '')}
                  </SyntaxHighlighter>
                </div>
              )
            }
            
            if (isCodeBlock) {
              // Code block without language specification
              return (
                <code 
                  className="block p-4 rounded-lg overflow-x-auto mb-4"
                  style={{
                    backgroundColor: 'var(--background-tertiary)',
                    color: 'var(--text-primary)',
                    border: '1px solid var(--border)',
                    fontSize: '0.875rem',
                    lineHeight: '1.7',
                    fontFamily: 'var(--font-mono), "SF Mono", Monaco, Consolas, "Liberation Mono", "Courier New", monospace'
                  }}
                >
                  {children}
                </code>
              )
            }
            
            // Inline code
            return (
              <code 
                className="px-1 py-0.5 rounded text-sm inline"
                style={{
                  backgroundColor: 'var(--background-tertiary)',
                  color: 'var(--text-primary)',
                  border: '1px solid var(--border)',
                  fontFamily: 'var(--font-mono), "SF Mono", Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
                  display: 'inline',
                  verticalAlign: 'baseline',
                  whiteSpace: 'nowrap'
                }}
                {...props}
              >
                {children}
              </code>
            )
          },
          pre: ({ children }) => {
            // The pre tag is handled by the code component when syntax highlighting is used
            return <>{children}</>
          },
          a: ({ href, children }) => (
            <a 
              href={href} 
              className="hover:underline transition-colors" 
              style={{ color: 'var(--primary)' }}
              target="_blank" 
              rel="noopener noreferrer"
            >
              {children}
            </a>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  )
}
