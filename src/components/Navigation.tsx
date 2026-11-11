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
    <nav className="bl-chrome bl-nav">
      <div className="bl-wrap bl-nav__bar">
        <Link href={`/${locale}`} className="bl-wordmark">
          {tNav('brand')}
        </Link>
        <div className="bl-nav__links">
          <Link href={`/${locale}`} className="bl-nav__link bl-nav__link--home">
            {t('home')}
          </Link>
          <Link href={`/${locale}/posts`} className="bl-nav__link">
            {t('posts')}
          </Link>
        </div>

        <div className="bl-nav__tools">
          <LanguageSwitcher />
          <ThemeToggle />
          <NavAuthMenu locale={locale} />
        </div>
      </div>
    </nav>
  )
}
