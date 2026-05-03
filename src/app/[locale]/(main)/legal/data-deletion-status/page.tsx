import { getTranslations, setRequestLocale } from 'next-intl/server'
import type { Metadata } from 'next'

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
    <article className="container mx-auto max-w-3xl px-4 py-12 prose prose-neutral dark:prose-invert">
      <h1>{t('title')}</h1>
      <p>{t('body')}</p>
      {code && (
        <p>
          <strong>{t('codeLabel')}</strong> <code>{code}</code>
        </p>
      )}
      <p>{t.rich('contact', { email: (chunks) => <a href="mailto:sharkonet@protonmail.com">{chunks}</a> })}</p>
    </article>
  )
}
