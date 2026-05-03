import { getTranslations, setRequestLocale } from 'next-intl/server'
import type { Metadata } from 'next'
import Link from 'next/link'

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'legal.privacy' })
  return { title: t('title'), description: t('intro') }
}

export default async function PrivacyPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  setRequestLocale(locale)
  const t = await getTranslations('legal.privacy')
  const tCommon = await getTranslations('legal.common')

  return (
    <article className="container mx-auto max-w-3xl px-4 py-12 prose prose-neutral dark:prose-invert">
      <h1>{t('title')}</h1>
      <p>{tCommon('lastUpdated', { date: '2026-05-03' })}</p>
      <p>{t('intro')}</p>

      <h2>{t('collectTitle')}</h2>
      <ul>
        <li>{t('collectAccount')}</li>
        <li>{t('collectAuth')}</li>
        <li>{t('collectAnalytics')}</li>
      </ul>

      <h2>{t('useTitle')}</h2>
      <p>{t('useBody')}</p>

      <h2>{t('sharingTitle')}</h2>
      <p>{t('sharingBody')}</p>

      <h2>{t('cookiesTitle')}</h2>
      <p>{t('cookiesBody')}</p>

      <h2>{t('rightsTitle')}</h2>
      <p>
        {t.rich('rightsBody', {
          link: (chunks) => <Link href={`/${locale}/legal/data-deletion`}>{chunks}</Link>,
        })}
      </p>

      <h2>{t('retentionTitle')}</h2>
      <p>{t('retentionBody')}</p>

      <h2>{t('contactTitle')}</h2>
      <p>{t.rich('contactBody', { email: (chunks) => <a href="mailto:sharkonet@protonmail.com">{chunks}</a> })}</p>
    </article>
  )
}
