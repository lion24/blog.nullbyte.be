import { getTranslations, setRequestLocale } from 'next-intl/server'
import type { Metadata } from 'next'
import LegalPage from '@/components/LegalPage'

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'legal.dataDeletionStatus' })
  return { title: t('title'), description: t('body') }
}

export default async function DataDeletionStatusPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>
  searchParams: Promise<{ code?: string }>
}) {
  const { locale } = await params
  const { code } = await searchParams
  setRequestLocale(locale)
  const t = await getTranslations('legal.dataDeletionStatus')

  return (
    <LegalPage title={t('title')}>
      <p>{t('body')}</p>
      {code && (
        <p>
          <strong>{t('codeLabel')}</strong> <code>{code}</code>
        </p>
      )}
      <p>{t.rich('contact', { email: (chunks) => <a href="mailto:sharkonet@protonmail.com">{chunks}</a> })}</p>
    </LegalPage>
  )
}
