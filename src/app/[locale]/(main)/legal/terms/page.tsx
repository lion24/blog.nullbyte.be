import { getTranslations, setRequestLocale } from 'next-intl/server'
import type { Metadata } from 'next'
import LegalPage from '@/components/LegalPage'

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'legal.terms' })
  return { title: t('title'), description: t('intro') }
}

export default async function TermsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  setRequestLocale(locale)
  const t = await getTranslations('legal.terms')
  const tCommon = await getTranslations('legal.common')

  return (
    <LegalPage
      title={t('title')}
      updated={tCommon.rich('lastUpdated', {
        date: '2026-05-03',
        time: (chunks) => <time className="bl-mono" dateTime="2026-05-03">{chunks}</time>,
      })}
    >
      <p>{t('intro')}</p>
      <h2>{t('useTitle')}</h2>
      <p>{t('useBody')}</p>
      <h2>{t('contentTitle')}</h2>
      <p>{t('contentBody')}</p>
      <h2>{t('disclaimerTitle')}</h2>
      <p>{t('disclaimerBody')}</p>
      <h2>{t('changesTitle')}</h2>
      <p>{t('changesBody')}</p>
      <h2>{t('contactTitle')}</h2>
      <p>{t.rich('contactBody', { email: (chunks) => <a href="mailto:sharkonet@protonmail.com">{chunks}</a> })}</p>
    </LegalPage>
  )
}
