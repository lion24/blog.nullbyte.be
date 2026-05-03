import { getTranslations, setRequestLocale } from 'next-intl/server'
import type { Metadata } from 'next'

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'legal.dataDeletion' })
  return { title: t('title'), description: t('intro') }
}

export default async function DataDeletionPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  setRequestLocale(locale)
  const t = await getTranslations('legal.dataDeletion')
  const tCommon = await getTranslations('legal.common')

  return (
    <article className="container mx-auto max-w-3xl px-4 py-12 prose prose-neutral dark:prose-invert">
      <h1>{t('title')}</h1>
      <p>{tCommon('lastUpdated', { date: '2026-05-03' })}</p>
      <p>{t('intro')}</p>

      <h2>{t('howTitle')}</h2>
      <ol>
        <li>{t.rich('howStep1', { email: (chunks) => <a href="mailto:sharkonet@protonmail.com">{chunks}</a> })}</li>
        <li>{t('howStep2')}</li>
        <li>{t('howStep3')}</li>
      </ol>

      <h2>{t('whatTitle')}</h2>
      <ul>
        <li>{t('whatItem1')}</li>
        <li>{t('whatItem2')}</li>
        <li>{t('whatItem3')}</li>
      </ul>
      <p>{t('whatNote')}</p>

      <h2>{t('timeframeTitle')}</h2>
      <p>{t('timeframeBody')}</p>

      <h2>{t('facebookTitle')}</h2>
      <p>{t('facebookBody')}</p>
    </article>
  )
}
