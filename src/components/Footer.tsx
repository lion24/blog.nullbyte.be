import Link from 'next/link'
import { getTranslations } from 'next-intl/server'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faGithub,
  faInstagram,
  faTiktok,
} from '@fortawesome/free-brands-svg-icons'

type FooterProps = {
  locale: string
}

export default async function Footer({ locale }: FooterProps) {
  const currentYear = new Date().getFullYear()
  const t = await getTranslations({ locale })

  const links = [
    { href: `/${locale}`, label: t('footer.home') },
    { href: `/${locale}/posts`, label: t('footer.allPosts') },
    { href: `/${locale}/legal/terms`, label: t('legal.common.terms') },
    { href: `/${locale}/legal/privacy`, label: t('legal.common.privacy') },
    { href: `/${locale}/legal/data-deletion`, label: t('legal.common.dataDeletion') },
  ]

  const social = [
    { href: 'https://github.com/lion24', label: t('footer.github'), icon: faGithub },
    { href: 'https://www.instagram.com/nullbyt3', label: t('footer.instagram'), icon: faInstagram },
    { href: 'https://www.tiktok.com/@nullbyte0x', label: t('footer.tiktok'), icon: faTiktok },
  ]

  return (
    <footer className="bl-chrome bl-footer">
      <div className="bl-wrap">
        <div className="bl-footer__grid">
          <div>
            <p className="bl-footer__mark">{t('footer.techBlog')}</p>
            <p className="bl-footer__tagline">{t('footer.tagline')}</p>
          </div>

          <div>
            <h2 className="bl-footer__heading">{t('footer.quickLinks')}</h2>
            <ul className="bl-footer__links">
              {links.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="bl-footer__link">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h2 className="bl-footer__heading">{t('footer.connect')}</h2>
            <div className="bl-footer__social">
              {social.map((s) => (
                <Link
                  key={s.href}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={s.label}
                  className="bl-footer__link"
                >
                  <FontAwesomeIcon icon={s.icon} className="text-2xl" />
                </Link>
              ))}
            </div>
          </div>
        </div>

        <div className="bl-footer__base">
          {t('footer.copyright', { year: currentYear })}
        </div>
      </div>
    </footer>
  )
}
