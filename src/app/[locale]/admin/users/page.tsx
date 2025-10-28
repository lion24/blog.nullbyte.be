'use client'

import { useSession } from 'next-auth/react'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useTranslations, useLocale } from 'next-intl'
import Link from 'next/link'
import Image from 'next/image'
import { Role } from '@prisma/client'

type User = {
  id: string
  email: string | null
  name: string | null
  image: string | null
  role: Role
  emailVerified: Date | null
  _count: {
    posts: number
  }
}

export default function UsersPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState<string | null>(null)
  const t = useTranslations()
  const locale = useLocale()

  useEffect(() => {
    if (status === 'loading') return
    if (!session || session.user.role !== Role.ADMIN) {
      router.push('/')
      return
    }

    fetchUsers()
  }, [session, status, router])

  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/users')
      const data = await response.json()
      
      if (!response.ok) {
        console.error('Failed to fetch users:', data.error || 'Unknown error')
        setUsers([])
        return
      }
      
      // Ensure data is an array
      if (Array.isArray(data)) {
        setUsers(data)
      } else {
        console.error('Invalid response format:', data)
        setUsers([])
      }
    } catch (error) {
      console.error('Failed to fetch users:', error)
      setUsers([])
    } finally {
      setLoading(false)
    }
  }

  const updateUserRole = async (userId: string, newRole: Role) => {
    setUpdating(userId)
    try {
      const response = await fetch('/api/users', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          role: newRole,
        }),
      })

      if (response.ok) {
        const updatedUser = await response.json()
        setUsers(users.map(user => 
          user.id === userId ? { ...user, role: updatedUser.role } : user
        ))
      }
    } catch (error) {
      console.error('Failed to update user role:', error)
    } finally {
      setUpdating(null)
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
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>{t('admin.userManagement')}</h1>
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
              <th className="text-left p-4" style={{ color: 'var(--text-primary)' }}>{t('admin.user')}</th>
              <th className="text-left p-4" style={{ color: 'var(--text-primary)' }}>{t('admin.email')}</th>
              <th className="text-center p-4" style={{ color: 'var(--text-primary)' }}>{t('admin.postsCount')}</th>
              <th className="text-center p-4" style={{ color: 'var(--text-primary)' }}>{t('admin.verified')}</th>
              <th className="text-center p-4" style={{ color: 'var(--text-primary)' }}>{t('admin.role')}</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr 
                key={user.id} 
                className="border-b transition-colors"
                style={{ borderColor: 'var(--border)' }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--background-tertiary)'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
              >
                <td className="p-4">
                  <div className="flex items-center space-x-3">
                    {user.image && (
                      <Image
                        src={user.image}
                        alt={user.name || 'User'}
                        width={36}
                        height={36}
                        className="rounded-full"
                      />
                    )}
                    <span style={{ color: 'var(--text-primary)' }}>
                      {user.name || t('admin.anonymous')}
                    </span>
                  </div>
                </td>
                <td className="p-4" style={{ color: 'var(--text-secondary)' }}>
                  {user.email}
                </td>
                <td className="p-4 text-center" style={{ color: 'var(--text-secondary)' }}>
                  {user._count.posts}
                </td>
                <td className="p-4 text-center">
                  {user.emailVerified ? (
                    <span style={{ color: 'var(--success)' }}>✓</span>
                  ) : (
                    <span style={{ color: 'var(--error)' }}>✗</span>
                  )}
                </td>
                <td className="p-4 text-center">
                  <select
                    value={user.role}
                    onChange={(e) => updateUserRole(user.id, e.target.value as Role)}
                    disabled={updating === user.id || user.email === session.user.email}
                    className="px-3 py-1 rounded-md text-sm transition-colors"
                    style={{
                      backgroundColor: user.role === Role.ADMIN ? 'var(--primary)' : 'var(--background-tertiary)',
                      color: user.role === Role.ADMIN ? 'var(--text-inverse)' : 'var(--text-primary)',
                      border: '1px solid var(--border)',
                      opacity: updating === user.id ? 0.5 : 1,
                      cursor: (updating === user.id || user.email === session.user.email) ? 'not-allowed' : 'pointer'
                    }}
                  >
                    <option value={Role.READER}>{t('admin.reader')}</option>
                    <option value={Role.ADMIN}>{t('admin.admin')}</option>
                  </select>
                  {user.email === session.user.email && (
                    <div className="text-xs mt-1" style={{ color: 'var(--text-tertiary)' }}>
                      {t('admin.currentUser')}
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {users.length === 0 && (
          <div className="p-8 text-center" style={{ color: 'var(--text-tertiary)' }}>
            {t('admin.noUsers')}
          </div>
        )}
      </div>
    </div>
  )
}
