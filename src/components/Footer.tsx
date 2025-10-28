'use client'

import Link from 'next/link'
import { useTranslations } from 'next-intl'

export default function Footer() {
  const currentYear = new Date().getFullYear()
  const t = useTranslations()

  return (
    <footer
      className="mt-auto"
      style={{
        backgroundColor: 'var(--background-secondary)',
        borderTop: '1px solid var(--border)',
      }}
    >
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-6">
          {/* About Section */}
          <div>
            <h3 className="text-lg font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>
              {t('footer.techBlog')}
            </h3>
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
              {t('footer.tagline')}
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>
              {t('footer.quickLinks')}
            </h3>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/"
                  className="text-sm transition-colors"
                  style={{ color: 'var(--text-secondary)' }}
                  onMouseEnter={(e) => e.currentTarget.style.color = 'var(--text-primary)'}
                  onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-secondary)'}
                >
                  {t('footer.home')}
                </Link>
              </li>
              <li>
                <Link
                  href="/posts"
                  className="text-sm transition-colors"
                  style={{ color: 'var(--text-secondary)' }}
                  onMouseEnter={(e) => e.currentTarget.style.color = 'var(--text-primary)'}
                  onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-secondary)'}
                >
                  {t('footer.allPosts')}
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-lg font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>
              {t('footer.connect')}
            </h3>
            <ul className="space-y-2">
              <li>
                <a
                  href="mailto:contact@example.com"
                  className="text-sm transition-colors"
                  style={{ color: 'var(--text-secondary)' }}
                  onMouseEnter={(e) => e.currentTarget.style.color = 'var(--text-primary)'}
                  onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-secondary)'}
                >
                  {t('footer.email')}
                </a>
              </li>
              <li>
                <Link
                  href="https://github.com/lion24"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm transition-colors"
                  style={{ color: 'var(--text-secondary)' }}
                  onMouseEnter={(e) => e.currentTarget.style.color = 'var(--text-primary)'}
                  onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-secondary)'}
                >
                  {t('footer.github')}
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Copyright */}
        <div
          className="pt-6 text-center text-sm"
          style={{
            borderTop: '1px solid var(--border)',
            color: 'var(--text-tertiary)',
          }}
        >
          <p>{t('footer.copyright', { year: currentYear })}</p>
        </div>
      </div>
    </footer>
  )
}
