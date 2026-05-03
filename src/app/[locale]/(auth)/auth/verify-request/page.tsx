import { getTranslations } from 'next-intl/server'

export default async function VerifyRequestPage() {
  const t = await getTranslations('auth')
  return (
    <div
      className="p-8"
      style={{
        backgroundColor: 'var(--background-secondary)',
        border: '1px solid var(--border)',
        borderRadius: '12px',
        boxShadow: 'var(--shadow-sm)',
      }}
    >
      <h1 className="text-2xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>{t('checkYourEmail')}</h1>
      <p style={{ color: 'var(--text-secondary)' }}>{t('magicLinkSent')}</p>
    </div>
  )
}
