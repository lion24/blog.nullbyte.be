import Link from 'next/link'
import { getTranslations } from 'next-intl/server'
import LanguageSwitcher from './LanguageSwitcher'
import ThemeToggle from './ThemeToggle'
import NavAuthMenu from './NavAuthMenu'

type NavigationProps = {
  locale: string
}

export default async function Navigation({ locale }: NavigationProps) {
  const t = await getTranslations({ locale, namespace: 'common' })
  const tNav = await getTranslations({ locale, namespace: 'navigation' })

  return (
    <nav
      style={{
        backgroundColor: 'var(--background-secondary)',
        borderBottom: '1px solid var(--border)',
        boxShadow: 'var(--shadow-sm)',
      }}
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-8">
            <Link
              href={`/${locale}`}
              className="text-xl font-bold"
              style={{ color: 'var(--text-primary)' }}
            >
              {tNav('brand')}
            </Link>
            <div className="hidden md:flex space-x-4">
              <Link
                href={`/${locale}`}
                className="nav-link transition-colors"
                style={{ color: 'var(--text-secondary)' }}
              >
                {t('home')}
              </Link>
              <Link
                href={`/${locale}/posts`}
                className="nav-link transition-colors"
                style={{ color: 'var(--text-secondary)' }}
              >
                {t('posts')}
              </Link>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <LanguageSwitcher />
            <ThemeToggle />
            <NavAuthMenu locale={locale} />
          </div>
        </div>
      </div>
    </nav>
  )
}
