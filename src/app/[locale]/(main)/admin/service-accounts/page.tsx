'use client'

import { useSession } from 'next-auth/react'
import { useState, useEffect, FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import { useTranslations, useLocale } from 'next-intl'
import Link from 'next/link'
import { Role } from '@prisma/client'
import { toast, Toaster } from 'sonner'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

type ServiceAccount = {
  id: string
  name: string
  description: string | null
  scopes: string[]
  revoked: boolean
  lastUsedAt: string | null
  createdAt: string
  updatedAt: string
  createdBy: {
    id: string
    name: string | null
    email: string | null
  }
}

type ListResponse = {
  serviceAccounts: ServiceAccount[]
  availableScopes: string[]
}

const emptyForm = { name: '', description: '', scopes: new Set<string>() }

export default function ServiceAccountsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const t = useTranslations()
  const locale = useLocale()

  const [serviceAccounts, setServiceAccounts] = useState<ServiceAccount[]>([])
  const [availableScopes, setAvailableScopes] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [formOpen, setFormOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [mutatingId, setMutatingId] = useState<string | null>(null)
  const [formData, setFormData] = useState(emptyForm)
  const [revealToken, setRevealToken] = useState<string | null>(null)

  useEffect(() => {
    if (status === 'loading') return
    if (!session || session.user.role !== Role.ADMIN) {
      router.push('/')
      return
    }

    const fetchData = async () => {
      try {
        const response = await fetch('/api/admin/service-accounts')
        const data: ListResponse = await response.json()
        if (!response.ok) {
          setServiceAccounts([])
          setAvailableScopes([])
          return
        }
        setServiceAccounts(data.serviceAccounts ?? [])
        setAvailableScopes(data.availableScopes ?? [])
      } catch (error) {
        console.error('Failed to fetch service accounts:', error)
        setServiceAccounts([])
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [session, status, router])

  const refresh = async () => {
    const response = await fetch('/api/admin/service-accounts')
    if (!response.ok) return
    const data: ListResponse = await response.json()
    setServiceAccounts(data.serviceAccounts ?? [])
  }

  const toggleScope = (scope: string) => {
    setFormData(prev => {
      const next = new Set(prev.scopes)
      if (next.has(scope)) {
        next.delete(scope)
      } else {
        next.add(scope)
      }
      return { ...prev, scopes: next }
    })
  }

  const handleCreate = async (e: FormEvent) => {
    e.preventDefault()
    if (formData.scopes.size === 0) {
      toast.error(t('admin.selectAtLeastOneScope'))
      return
    }

    setSubmitting(true)
    try {
      const response = await fetch('/api/admin/service-accounts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          description: formData.description || undefined,
          scopes: Array.from(formData.scopes),
        }),
      })

      const data = await response.json()
      if (!response.ok) {
        toast.error(data.error || t('admin.tokenCreateFailed'))
        return
      }

      setRevealToken(data.token)
      setFormData(emptyForm)
      setFormOpen(false)
      toast.success(t('admin.tokenCreated'))
      await refresh()
    } catch (error) {
      console.error('Failed to create service account:', error)
      toast.error(t('admin.tokenCreateFailed'))
    } finally {
      setSubmitting(false)
    }
  }

  const handleRevoke = async (id: string) => {
    if (!window.confirm(t('admin.confirmRevoke'))) return
    setMutatingId(id)
    try {
      const response = await fetch(`/api/admin/service-accounts/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ revoked: true }),
      })

      if (!response.ok) {
        const data = await response.json()
        toast.error(data.error || t('admin.tokenRevokeFailed'))
        return
      }

      const { serviceAccount } = await response.json()
      setServiceAccounts(prev =>
        prev.map(sa => (sa.id === id ? serviceAccount : sa))
      )
      toast.success(t('admin.tokenRevoked'))
    } catch (error) {
      console.error('Failed to revoke service account:', error)
      toast.error(t('admin.tokenRevokeFailed'))
    } finally {
      setMutatingId(null)
    }
  }

  const handleDelete = async (id: string) => {
    if (!window.confirm(t('admin.confirmDeleteToken'))) return
    setMutatingId(id)
    try {
      const response = await fetch(`/api/admin/service-accounts/${id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const data = await response.json()
        toast.error(data.error || t('admin.tokenDeleteFailed'))
        return
      }

      setServiceAccounts(prev => prev.filter(sa => sa.id !== id))
      toast.success(t('admin.tokenDeleted'))
    } catch (error) {
      console.error('Failed to delete service account:', error)
      toast.error(t('admin.tokenDeleteFailed'))
    } finally {
      setMutatingId(null)
    }
  }

  const handleCopy = async () => {
    if (!revealToken) return
    try {
      await navigator.clipboard.writeText(revealToken)
      toast.success(t('admin.tokenCopied'))
    } catch {
      toast.error(t('admin.copyFailed'))
    }
  }

  if (status === 'loading' || loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div style={{ color: 'var(--text-secondary)' }}>{t('common.loading')}</div>
      </div>
    )
  }

  if (!session || session.user.role !== Role.ADMIN) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center" style={{ color: 'var(--text-secondary)' }}>
          <h1 className="text-2xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>{t('auth.accessDenied')}</h1>
          <p>{t('auth.accessDeniedMessage')}</p>
          <Link
            href={`/${locale}`}
            className="inline-block mt-4 px-4 py-2 rounded-lg transition-colors"
            style={{
              backgroundColor: 'var(--primary)',
              color: 'var(--text-inverse)'
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--primary-hover)'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'var(--primary)'}
          >
            {t('common.goHome')}
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Toaster />

      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>{t('admin.serviceAccountManagement')}</h1>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => setFormOpen(open => !open)}
            className="text-sm px-4 py-2 rounded-lg transition-colors"
            style={{
              backgroundColor: 'var(--primary)',
              color: 'var(--text-inverse)'
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--primary-hover)'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'var(--primary)'}
          >
            {formOpen ? t('common.cancel') : t('admin.newToken')}
          </button>
          <Link
            href={`/${locale}/admin`}
            className="text-sm px-4 py-2 rounded-lg transition-colors"
            style={{
              backgroundColor: 'var(--background-tertiary)',
              color: 'var(--text-primary)',
              border: '1px solid var(--border)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = 'var(--border-hover)';
              e.currentTarget.style.backgroundColor = 'var(--background-secondary)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'var(--border)';
              e.currentTarget.style.backgroundColor = 'var(--background-tertiary)';
            }}
          >
            {t('admin.backToAdmin')}
          </Link>
        </div>
      </div>

      {formOpen && (
        <form
          onSubmit={handleCreate}
          className="rounded-lg mb-8 p-6"
          style={{
            backgroundColor: 'var(--background-secondary)',
            boxShadow: 'var(--shadow-md)',
            border: '1px solid var(--border)'
          }}
        >
          <div className="mb-4">
            <label
              htmlFor="sa-name"
              className="block text-sm font-medium mb-1"
              style={{ color: 'var(--text-primary)' }}
            >
              {t('admin.tokenName')}
            </label>
            <input
              id="sa-name"
              type="text"
              required
              maxLength={100}
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder={t('admin.tokenNamePlaceholder')}
              className="w-full px-3 py-2 rounded-md"
              style={{
                backgroundColor: 'var(--background)',
                color: 'var(--text-primary)',
                border: '1px solid var(--border)'
              }}
            />
          </div>

          <div className="mb-4">
            <label
              htmlFor="sa-description"
              className="block text-sm font-medium mb-1"
              style={{ color: 'var(--text-primary)' }}
            >
              {t('admin.tokenDescription')}
            </label>
            <textarea
              id="sa-description"
              maxLength={500}
              rows={2}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder={t('admin.tokenDescriptionPlaceholder')}
              className="w-full px-3 py-2 rounded-md"
              style={{
                backgroundColor: 'var(--background)',
                color: 'var(--text-primary)',
                border: '1px solid var(--border)'
              }}
            />
          </div>

          <fieldset className="mb-4">
            <legend className="block text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
              {t('admin.scopes')}
            </legend>
            <div className="flex flex-wrap gap-2">
              {availableScopes.map(scope => {
                const checked = formData.scopes.has(scope)
                return (
                  <label
                    key={scope}
                    className="flex items-center gap-2 px-3 py-1 rounded-md cursor-pointer text-sm"
                    style={{
                      backgroundColor: checked ? 'var(--primary)' : 'var(--background-tertiary)',
                      color: checked ? 'var(--text-inverse)' : 'var(--text-primary)',
                      border: '1px solid var(--border)'
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => toggleScope(scope)}
                      className="sr-only"
                    />
                    <code style={{ fontFamily: 'inherit' }}>{scope}</code>
                  </label>
                )
              })}
            </div>
          </fieldset>

          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => {
                setFormData(emptyForm)
                setFormOpen(false)
              }}
              className="text-sm px-4 py-2 rounded-lg transition-colors"
              style={{
                backgroundColor: 'var(--background-tertiary)',
                color: 'var(--text-primary)',
                border: '1px solid var(--border)'
              }}
            >
              {t('common.cancel')}
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="text-sm px-4 py-2 rounded-lg transition-colors"
              style={{
                backgroundColor: 'var(--primary)',
                color: 'var(--text-inverse)',
                opacity: submitting ? 0.5 : 1,
                cursor: submitting ? 'not-allowed' : 'pointer'
              }}
            >
              {submitting ? t('admin.creatingToken') : t('admin.create')}
            </button>
          </div>
        </form>
      )}

      <div className="rounded-lg overflow-hidden" style={{
        backgroundColor: 'var(--background-secondary)',
        boxShadow: 'var(--shadow-md)',
        border: '1px solid var(--border)'
      }}>
        <table className="w-full">
          <thead>
            <tr style={{
              backgroundColor: 'var(--background-tertiary)',
              borderBottom: '1px solid var(--border)'
            }}>
              <th className="text-left p-4" style={{ color: 'var(--text-primary)' }}>{t('admin.tokenName')}</th>
              <th className="text-left p-4" style={{ color: 'var(--text-primary)' }}>{t('admin.scopes')}</th>
              <th className="text-left p-4" style={{ color: 'var(--text-primary)' }}>{t('admin.createdBy')}</th>
              <th className="text-left p-4" style={{ color: 'var(--text-primary)' }}>{t('admin.createdAt')}</th>
              <th className="text-left p-4" style={{ color: 'var(--text-primary)' }}>{t('admin.lastUsed')}</th>
              <th className="text-center p-4" style={{ color: 'var(--text-primary)' }}>{t('admin.status')}</th>
              <th className="text-right p-4" style={{ color: 'var(--text-primary)' }}>{t('admin.actions')}</th>
            </tr>
          </thead>
          <tbody>
            {serviceAccounts.map(sa => (
              <tr
                key={sa.id}
                className="border-b transition-colors"
                style={{ borderColor: 'var(--border)' }}
              >
                <td className="p-4">
                  <div style={{ color: 'var(--text-primary)' }}>{sa.name}</div>
                  {sa.description && (
                    <div className="text-xs mt-1" style={{ color: 'var(--text-tertiary)' }}>
                      {sa.description}
                    </div>
                  )}
                </td>
                <td className="p-4">
                  <div className="flex flex-wrap gap-1">
                    {sa.scopes.map(scope => (
                      <span
                        key={scope}
                        className="text-xs px-2 py-0.5 rounded"
                        style={{
                          backgroundColor: 'var(--background-tertiary)',
                          color: 'var(--text-secondary)',
                          border: '1px solid var(--border)'
                        }}
                      >
                        {scope}
                      </span>
                    ))}
                  </div>
                </td>
                <td className="p-4 text-sm" style={{ color: 'var(--text-secondary)' }}>
                  {sa.createdBy.name || sa.createdBy.email || '—'}
                </td>
                <td className="p-4 text-sm" style={{ color: 'var(--text-secondary)' }}>
                  {new Date(sa.createdAt).toLocaleDateString(locale)}
                </td>
                <td className="p-4 text-sm" style={{ color: 'var(--text-secondary)' }}>
                  {sa.lastUsedAt
                    ? new Date(sa.lastUsedAt).toLocaleString(locale)
                    : t('admin.never')}
                </td>
                <td className="p-4 text-center">
                  <span
                    className="text-xs px-2 py-1 rounded"
                    style={{
                      backgroundColor: sa.revoked ? 'var(--background-tertiary)' : 'var(--success)',
                      color: sa.revoked ? 'var(--text-secondary)' : 'var(--text-inverse)',
                      border: sa.revoked ? '1px solid var(--border)' : 'none'
                    }}
                  >
                    {sa.revoked ? t('admin.revoked') : t('admin.active')}
                  </span>
                </td>
                <td className="p-4 text-right">
                  <div className="flex justify-end gap-2">
                    {!sa.revoked && (
                      <button
                        type="button"
                        onClick={() => handleRevoke(sa.id)}
                        disabled={mutatingId === sa.id}
                        className="text-sm px-3 py-1 rounded-md transition-colors"
                        style={{
                          backgroundColor: 'var(--background-tertiary)',
                          color: 'var(--text-primary)',
                          border: '1px solid var(--border)',
                          opacity: mutatingId === sa.id ? 0.5 : 1,
                          cursor: mutatingId === sa.id ? 'not-allowed' : 'pointer'
                        }}
                      >
                        {mutatingId === sa.id ? t('admin.revoking') : t('admin.revoke')}
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => handleDelete(sa.id)}
                      disabled={mutatingId === sa.id}
                      className="text-sm px-3 py-1 rounded-md transition-colors"
                      style={{
                        backgroundColor: 'var(--error)',
                        color: 'var(--text-inverse)',
                        opacity: mutatingId === sa.id ? 0.5 : 1,
                        cursor: mutatingId === sa.id ? 'not-allowed' : 'pointer'
                      }}
                    >
                      {mutatingId === sa.id ? t('admin.deleting') : t('admin.delete')}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {serviceAccounts.length === 0 && (
          <div className="p-8 text-center" style={{ color: 'var(--text-tertiary)' }}>
            {t('admin.noServiceAccounts')}
          </div>
        )}
      </div>

      <Dialog
        open={revealToken !== null}
        onOpenChange={(open) => {
          if (!open) setRevealToken(null)
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('admin.tokenRevealTitle')}</DialogTitle>
            <DialogDescription>
              {t('admin.tokenRevealWarning')}
            </DialogDescription>
          </DialogHeader>
          <div
            className="rounded-md p-3 font-mono text-sm break-all"
            style={{
              backgroundColor: 'var(--background-tertiary)',
              color: 'var(--text-primary)',
              border: '1px solid var(--border)'
            }}
          >
            {revealToken}
          </div>
          <DialogFooter>
            <button
              type="button"
              onClick={handleCopy}
              className="text-sm px-4 py-2 rounded-lg transition-colors"
              style={{
                backgroundColor: 'var(--background-tertiary)',
                color: 'var(--text-primary)',
                border: '1px solid var(--border)'
              }}
            >
              {t('admin.copyToken')}
            </button>
            <button
              type="button"
              onClick={() => setRevealToken(null)}
              className="text-sm px-4 py-2 rounded-lg transition-colors"
              style={{
                backgroundColor: 'var(--primary)',
                color: 'var(--text-inverse)'
              }}
            >
              {t('admin.acknowledgeAndClose')}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
