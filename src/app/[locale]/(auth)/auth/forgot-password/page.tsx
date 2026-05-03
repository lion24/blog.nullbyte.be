'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'

const card: React.CSSProperties = {
  backgroundColor: 'var(--background-secondary)',
  border: '1px solid var(--border)',
  borderRadius: '12px',
  boxShadow: 'var(--shadow-sm)',
}

export default function ForgotPasswordPage() {
  const t = useTranslations('auth')
  const [email, setEmail] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    await fetch('/api/auth/forgot-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    })
    setSubmitting(false)
    setSubmitted(true)
  }

  if (submitted) {
    return (
      <div className="p-8" style={card}>
        <h1 className="text-2xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>{t('checkYourEmail')}</h1>
        <p style={{ color: 'var(--text-secondary)' }}>{t('resetEmailSent')}</p>
      </div>
    )
  }

  return (
    <div className="p-8" style={card}>
      <h1 className="text-2xl font-bold mb-6" style={{ color: 'var(--text-primary)' }}>{t('forgotPasswordTitle')}</h1>
      <form onSubmit={handleSubmit} className="space-y-3">
        <input
          type="email"
          required
          placeholder={t('emailPlaceholder')}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full px-3 py-2 rounded-md border"
          style={{ backgroundColor: 'var(--background)', color: 'var(--text-primary)', borderColor: 'var(--border)' }}
        />
        <button
          type="submit"
          disabled={submitting}
          onMouseEnter={(e) => { if (!e.currentTarget.disabled) e.currentTarget.style.backgroundColor = 'var(--text-secondary)' }}
          onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'var(--text-primary)' }}
          className="cursor-pointer disabled:cursor-not-allowed w-full px-4 py-2 rounded-md font-medium transition-colors disabled:opacity-60"
          style={{ backgroundColor: 'var(--text-primary)', color: 'var(--background)' }}
        >
          {submitting ? t('sending') : t('sendResetLink')}
        </button>
      </form>
    </div>
  )
}
