'use client'

import { Suspense, useState } from 'react'
import { useTranslations, useLocale } from 'next-intl'
import { useRouter, useSearchParams } from 'next/navigation'

function ResetPasswordForm() {
  const t = useTranslations('auth')
  const locale = useLocale()
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get('token') || ''

  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    setError(null)
    const res = await fetch('/api/auth/reset-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, password }),
    })
    setSubmitting(false)
    if (!res.ok) {
      const data = await res.json().catch(() => null)
      setError(data?.error?.message || t('resetFailed'))
      return
    }
    router.push(`/${locale}/auth/signin?reset=1`)
  }

  if (!token) {
    return <p style={{ color: 'var(--text-secondary)' }}>{t('invalidResetLink')}</p>
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <input
        type="password"
        required
        minLength={8}
        placeholder={t('newPasswordPlaceholder')}
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className="w-full px-3 py-2 rounded-md border"
        style={{ backgroundColor: 'var(--background)', color: 'var(--text-primary)', borderColor: 'var(--border)' }}
      />
      {error && <p className="text-sm" style={{ color: '#dc2626' }}>{error}</p>}
      <button
        type="submit"
        disabled={submitting}
        onMouseEnter={(e) => { if (!e.currentTarget.disabled) e.currentTarget.style.backgroundColor = 'var(--text-secondary)' }}
        onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'var(--text-primary)' }}
        className="cursor-pointer disabled:cursor-not-allowed w-full px-4 py-2 rounded-md font-medium transition-colors disabled:opacity-60"
        style={{ backgroundColor: 'var(--text-primary)', color: 'var(--background)' }}
      >
        {submitting ? t('saving') : t('setNewPassword')}
      </button>
    </form>
  )
}

export default function ResetPasswordPage() {
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
      <h1 className="text-2xl font-bold mb-6" style={{ color: 'var(--text-primary)' }}>{t('resetPasswordTitle')}</h1>
      <Suspense fallback={null}>
        <ResetPasswordForm />
      </Suspense>
    </div>
  )
}
