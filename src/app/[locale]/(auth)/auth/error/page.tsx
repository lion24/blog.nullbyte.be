'use client'

import { Suspense } from 'react'
import { useTranslations, useLocale } from 'next-intl'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'

function AuthError() {
  const t = useTranslations('auth')
  const locale = useLocale()
  const searchParams = useSearchParams()
  const errorCode = searchParams.get('error') || 'Default'

  const message =
    errorCode === 'OAuthAccountNotLinked'
      ? t('errorAccountNotLinked')
      : errorCode === 'AccessDenied'
        ? t('errorAccessDenied')
        : t('errorGeneric')

  return (
    <>
      <p className="mb-4" style={{ color: 'var(--text-secondary)' }}>{message}</p>
      <Link href={`/${locale}/auth/signin`} className="underline" style={{ color: 'var(--text-primary)' }}>
        {t('backToSignIn')}
      </Link>
    </>
  )
}

export default function AuthErrorPage() {
  const t = useTranslations('auth')
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
      <h1 className="text-2xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>{t('errorTitle')}</h1>
      <Suspense fallback={null}>
        <AuthError />
      </Suspense>
    </div>
  )
}
