'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useTranslations, useLocale } from 'next-intl'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'

export default function SignInPage() {
  const t = useTranslations('auth')
  const locale = useLocale()
  const searchParams = useSearchParams()
  const callbackUrl = searchParams.get('callbackUrl') || `/${locale}`

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [magicLinkMode, setMagicLinkMode] = useState(true)

  async function handleCredentials(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    setError(null)
    const res = await signIn('credentials', { email, password, redirect: false, callbackUrl })
    setSubmitting(false)
    if (res?.error) {
      setError(t('invalidCredentials'))
      return
    }
    if (res?.url) window.location.href = res.url
  }

  async function handleMagicLink(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    setError(null)
    await signIn('email', { email, callbackUrl })
    setSubmitting(false)
  }

  const card: React.CSSProperties = {
    backgroundColor: 'var(--background-secondary)',
    border: '1px solid var(--border)',
    borderRadius: '12px',
    boxShadow: 'var(--shadow-sm)',
  }

  const secondaryBtnStyle: React.CSSProperties = {
    backgroundColor: 'var(--background)',
    color: 'var(--text-primary)',
    borderColor: 'var(--border)',
  }
  const onSecondaryEnter = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.currentTarget.style.backgroundColor = 'var(--background-tertiary)'
    e.currentTarget.style.borderColor = 'var(--border-hover)'
  }
  const onSecondaryLeave = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.currentTarget.style.backgroundColor = 'var(--background)'
    e.currentTarget.style.borderColor = 'var(--border)'
  }

  const primaryBtnStyle: React.CSSProperties = {
    backgroundColor: 'var(--text-primary)',
    color: 'var(--background)',
  }
  const onPrimaryEnter = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (e.currentTarget.disabled) return
    e.currentTarget.style.backgroundColor = 'var(--text-secondary)'
  }
  const onPrimaryLeave = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.currentTarget.style.backgroundColor = 'var(--text-primary)'
  }

  const inputStyle: React.CSSProperties = {
    backgroundColor: 'var(--background)',
    color: 'var(--text-primary)',
    borderColor: 'var(--border)',
  }

  return (
    <div className="p-8" style={card}>
      <h1 className="text-2xl font-bold mb-6" style={{ color: 'var(--text-primary)' }}>
        {t('signInTitle')}
      </h1>

      <div className="grid grid-cols-3 gap-2 mb-3">
        <button
          type="button"
          onClick={() => signIn('github', { callbackUrl })}
          onMouseEnter={onSecondaryEnter}
          onMouseLeave={onSecondaryLeave}
          className="cursor-pointer flex items-center justify-center gap-2 px-2 py-2 rounded-md border text-sm font-medium truncate transition-colors"
          style={secondaryBtnStyle}
        >
          <GitHubIcon />
          <span>GitHub</span>
        </button>
        <button
          type="button"
          onClick={() => signIn('google', { callbackUrl })}
          onMouseEnter={onSecondaryEnter}
          onMouseLeave={onSecondaryLeave}
          className="cursor-pointer flex items-center justify-center gap-2 px-2 py-2 rounded-md border text-sm font-medium truncate transition-colors"
          style={secondaryBtnStyle}
        >
          <GoogleIcon />
          <span>Google</span>
        </button>
        <button
          type="button"
          onClick={() => signIn('facebook', { callbackUrl })}
          onMouseEnter={onSecondaryEnter}
          onMouseLeave={onSecondaryLeave}
          className="cursor-pointer flex items-center justify-center gap-2 px-2 py-2 rounded-md border text-sm font-medium truncate transition-colors"
          style={secondaryBtnStyle}
        >
          <FacebookIcon />
          <span>Facebook</span>
        </button>
      </div>

      <button
        type="button"
        onClick={() => { setMagicLinkMode((v) => !v); setError(null); setPassword('') }}
        onMouseEnter={onSecondaryEnter}
        onMouseLeave={onSecondaryLeave}
        className="cursor-pointer w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-md border text-sm font-medium mb-2 transition-colors"
        style={secondaryBtnStyle}
      >
        <LockIcon />
        {magicLinkMode ? t('continueWithPassword') : t('continueWithSSO')}
      </button>

      <div className="flex items-center gap-3 my-5" style={{ color: 'var(--text-tertiary)' }}>
        <div className="flex-1 h-px" style={{ backgroundColor: 'var(--border)' }} />
        <span className="text-xs uppercase">{t('or')}</span>
        <div className="flex-1 h-px" style={{ backgroundColor: 'var(--border)' }} />
      </div>

      <form onSubmit={magicLinkMode ? handleMagicLink : handleCredentials} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-primary)' }}>
            {t('emailPlaceholder')}
          </label>
          <input
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-3 py-2 rounded-md border outline-none"
            style={inputStyle}
          />
        </div>

        {!magicLinkMode && (
          <div>
            <div className="flex items-baseline justify-between mb-1">
              <label className="block text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                {t('passwordPlaceholder')}
              </label>
              <Link
                href={`/${locale}/auth/forgot-password`}
                className="text-xs underline hover:no-underline"
                style={{ color: 'var(--text-secondary)' }}
              >
                {t('forgotPassword')}
              </Link>
            </div>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 pr-10 rounded-md border outline-none"
                style={inputStyle}
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                className="cursor-pointer absolute inset-y-0 right-0 px-3 flex items-center transition-opacity hover:opacity-70"
                style={{ color: 'var(--text-tertiary)' }}
              >
                {showPassword ? <EyeOffIcon /> : <EyeIcon />}
              </button>
            </div>
          </div>
        )}

        {error && (
          <p className="text-sm" style={{ color: '#dc2626' }}>{error}</p>
        )}

        <button
          type="submit"
          disabled={submitting}
          onMouseEnter={onPrimaryEnter}
          onMouseLeave={onPrimaryLeave}
          className="cursor-pointer disabled:cursor-not-allowed w-full px-4 py-2.5 rounded-md font-medium transition-colors disabled:opacity-60"
          style={primaryBtnStyle}
        >
          {submitting
            ? (magicLinkMode ? t('sending') : t('signingIn'))
            : (magicLinkMode ? t('sendMagicLink') : t('signInButton'))}
        </button>
      </form>

      <p className="text-sm text-center mt-6" style={{ color: 'var(--text-secondary)' }}>
        {t('dontHaveAccount')}{' '}
        <Link href={`/${locale}/auth/register`} className="underline" style={{ color: 'var(--text-primary)' }}>
          {t('signUp')}
        </Link>
      </p>
    </div>
  )
}

function GitHubIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 .5a12 12 0 0 0-3.79 23.39c.6.11.82-.26.82-.58v-2.05c-3.34.73-4.04-1.6-4.04-1.6-.55-1.39-1.34-1.76-1.34-1.76-1.09-.74.08-.73.08-.73 1.21.09 1.85 1.24 1.85 1.24 1.07 1.84 2.81 1.31 3.5 1 .11-.78.42-1.31.76-1.61-2.66-.3-5.47-1.33-5.47-5.93 0-1.31.47-2.39 1.24-3.23-.13-.3-.54-1.52.11-3.17 0 0 1.01-.32 3.3 1.23a11.5 11.5 0 0 1 6 0c2.29-1.55 3.3-1.23 3.3-1.23.65 1.65.24 2.87.12 3.17.77.84 1.24 1.92 1.24 3.23 0 4.61-2.81 5.62-5.49 5.92.43.37.81 1.1.81 2.22v3.29c0 .32.21.7.83.58A12 12 0 0 0 12 .5Z" />
    </svg>
  )
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
      <path fill="#4285F4" d="M23.49 12.27c0-.79-.07-1.54-.19-2.27H12v4.51h6.45c-.28 1.4-1.1 2.59-2.34 3.39v2.85h3.79c2.22-2.05 3.6-5.07 3.6-8.48z"/>
      <path fill="#34A853" d="M12 24c3.18 0 5.84-1.05 7.79-2.85l-3.79-2.85c-1.05.7-2.4 1.12-4 1.12-3.07 0-5.67-2.07-6.6-4.85H1.5v3.05A11.99 11.99 0 0 0 12 24z"/>
      <path fill="#FBBC05" d="M5.4 14.57a7.2 7.2 0 0 1 0-4.6V6.92H1.5a12 12 0 0 0 0 10.16l3.9-2.51z"/>
      <path fill="#EA4335" d="M12 4.75c1.73 0 3.28.6 4.5 1.77l3.36-3.36C17.83 1.18 15.17 0 12 0 7.39 0 3.4 2.74 1.5 6.92l3.9 3.05C6.33 6.82 8.93 4.75 12 4.75z"/>
    </svg>
  )
}

function FacebookIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="#1877F2" aria-hidden="true">
      <path d="M24 12a12 12 0 1 0-13.88 11.85V15.47H7.08V12h3.04V9.36c0-3 1.79-4.67 4.53-4.67 1.31 0 2.69.24 2.69.24v2.96h-1.52c-1.49 0-1.96.93-1.96 1.88V12h3.33l-.53 3.47h-2.8v8.38A12 12 0 0 0 24 12Z" />
    </svg>
  )
}

function EyeIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7S1 12 1 12Z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  )
}

function LockIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="3" y="11" width="18" height="11" rx="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  )
}

function EyeOffIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <path d="M17.94 17.94A10.94 10.94 0 0 1 12 19c-7 0-11-7-11-7a18.45 18.45 0 0 1 5.06-5.94" />
      <path d="M9.9 4.24A10.94 10.94 0 0 1 12 4c7 0 11 7 11 7a18.5 18.5 0 0 1-2.16 3.19" />
      <path d="M14.12 14.12a3 3 0 1 1-4.24-4.24" />
      <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
  )
}
