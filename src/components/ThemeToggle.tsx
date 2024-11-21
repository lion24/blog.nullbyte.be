'use client'

import { useEffect, useState } from 'react'

type Theme = 'light' | 'dark' | 'system'

export default function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>('system')
  const [mounted, setMounted] = useState(false)
  const [systemTheme, setSystemTheme] = useState<'light' | 'dark'>('light')

  // Get the actual theme (resolving 'system' to light/dark)
  const resolvedTheme = theme === 'system' ? systemTheme : theme

  useEffect(() => {
    setMounted(true)
    
    // Get saved theme from localStorage or default to system
    const savedTheme = localStorage.getItem('theme') as Theme | null
    if (savedTheme) {
      setTheme(savedTheme)
    }

    // Detect system theme
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    setSystemTheme(mediaQuery.matches ? 'dark' : 'light')

    // Listen for system theme changes
    const handleChange = (e: MediaQueryListEvent) => {
      setSystemTheme(e.matches ? 'dark' : 'light')
    }
    
    mediaQuery.addEventListener('change', handleChange)
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [])

  useEffect(() => {
    if (!mounted) return

    const root = document.documentElement
    
    // Apply theme
    if (theme === 'system') {
      // Let CSS media queries handle it
      root.removeAttribute('data-theme')
    } else {
      root.setAttribute('data-theme', theme)
    }
    
    // Save to localStorage
    localStorage.setItem('theme', theme)
  }, [theme, mounted])

  const toggleTheme = () => {
    // Cycle through: system -> light -> dark -> system
    if (theme === 'system') {
      setTheme('light')
    } else if (theme === 'light') {
      setTheme('dark')
    } else {
      setTheme('system')
    }
  }

  // Don't render until mounted to avoid hydration issues
  if (!mounted) {
    return (
      <div className="w-20 h-10 hidden md:block" /> // Placeholder to prevent layout shift
    )
  }

  return (
    <>
      {/* Mobile version - icon only */}
      <button
        onClick={toggleTheme}
        className="md:hidden p-2 rounded-lg transition-colors"
        style={{
          backgroundColor: 'var(--background-secondary)',
          border: '1px solid var(--border)'
        }}
        aria-label={`Theme: ${theme === 'system' ? 'System' : theme}`}
        title={`Current theme: ${theme === 'system' ? 'System' : theme}`}
      >
        {resolvedTheme === 'dark' ? (
          // Moon icon for mobile
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{ color: 'var(--primary)' }}
          >
            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
          </svg>
        ) : (
          // Sun icon for mobile
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{ color: 'var(--primary)' }}
          >
            <circle cx="12" cy="12" r="5" />
            <line x1="12" y1="1" x2="12" y2="3" />
            <line x1="12" y1="21" x2="12" y2="23" />
            <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
            <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
            <line x1="1" y1="12" x2="3" y2="12" />
            <line x1="21" y1="12" x2="23" y2="12" />
            <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
            <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
          </svg>
        )}
      </button>

      {/* Desktop version - icon toggle */}
      <button
        onClick={toggleTheme}
        className="relative items-center h-10 rounded-full transition-colors duration-200 hidden md:inline-flex"
        style={{
          backgroundColor: resolvedTheme === 'dark' ? 'var(--text-primary)' : 'var(--background-secondary)',
          border: '1px solid var(--border)',
          padding: '4px',
          width: '80px'
        }}
        aria-label={`Theme: ${theme === 'system' ? 'System' : theme}`}
        title={`Current theme: ${theme === 'system' ? 'System' : theme}`}
      >
        {/* Static sun icon */}
        <span
          className="absolute flex items-center justify-center"
          style={{
            left: '4px',
            width: 'calc(50% - 4px)',
            height: 'calc(100% - 8px)',
            opacity: resolvedTheme === 'light' ? 0 : 0.5,
            transition: 'opacity 200ms'
          }}
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{ color: resolvedTheme === 'dark' ? 'var(--text-inverse)' : 'var(--text-secondary)' }}
          >
            <circle cx="12" cy="12" r="5" />
            <line x1="12" y1="1" x2="12" y2="3" />
            <line x1="12" y1="21" x2="12" y2="23" />
            <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
            <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
            <line x1="1" y1="12" x2="3" y2="12" />
            <line x1="21" y1="12" x2="23" y2="12" />
            <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
            <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
          </svg>
        </span>

        {/* Static moon icon */}
        <span
          className="absolute flex items-center justify-center"
          style={{
            right: '4px',
            width: 'calc(50% - 4px)',
            height: 'calc(100% - 8px)',
            opacity: resolvedTheme === 'dark' ? 0 : 0.5,
            transition: 'opacity 200ms'
          }}
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{ color: resolvedTheme === 'dark' ? 'var(--text-secondary)' : 'var(--text-primary)' }}
          >
            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
          </svg>
        </span>

        {/* Sliding background with active icon */}
        <span
          className="absolute flex items-center justify-center rounded-full transition-all duration-200"
          style={{
            width: 'calc(50% - 4px)',
            height: 'calc(100% - 8px)',
            backgroundColor: resolvedTheme === 'dark' ? 'var(--primary)' : 'var(--primary)',
            transform: resolvedTheme === 'dark' ? 'translateX(calc(100% + 4px))' : 'translateX(0)',
          }}
        >
          {resolvedTheme === 'dark' ? (
            // Active moon icon
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{ color: 'var(--text-inverse)' }}
            >
              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
            </svg>
          ) : (
            // Active sun icon
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{ color: 'var(--text-inverse)' }}
            >
              <circle cx="12" cy="12" r="5" />
              <line x1="12" y1="1" x2="12" y2="3" />
              <line x1="12" y1="21" x2="12" y2="23" />
              <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
              <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
              <line x1="1" y1="12" x2="3" y2="12" />
              <line x1="21" y1="12" x2="23" y2="12" />
              <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
              <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
            </svg>
          )}
        </span>
      </button>
    </>
  )
}
