'use client'

import Link from 'next/link'
import Image from 'next/image'
import { SessionProvider, useSession, signIn, signOut } from 'next-auth/react'
import { useTranslations } from 'next-intl'
import { Role } from '@prisma/client'

type Props = {
  locale: string
}

/**
 * Auth-aware nav cluster: admin link, avatar/name, sign-in/sign-out buttons.
 *
 * This is the only piece of the navigation that needs SessionProvider.
 * Wrapping it locally (instead of at [locale]/layout.tsx) keeps next-auth's
 * client context out of the public reader render tree.
 */
function AuthMenuInner({ locale }: Props) {
  const { data: session } = useSession()
  const t = useTranslations('common')

  return (
    <>
      {session && session.user.role === Role.ADMIN && (
        <Link
          href={`/${locale}/admin`}
          className="nav-link transition-colors text-sm"
          style={{ color: 'var(--text-secondary)' }}
        >
          {t('admin')}
        </Link>
      )}

      {session ? (
        <>
          <div className="flex items-center space-x-2">
            {session.user?.image && (
              <Image
                src={session.user.image}
                alt={session.user.name || 'User'}
                width={32}
                height={32}
                className="rounded-full"
              />
            )}
            <span
              className="text-sm font-medium"
              style={{ color: 'var(--text-primary)' }}
            >
              {session.user?.name}
            </span>
          </div>
          <button
            onClick={() => signOut()}
            className="nav-auth-button-secondary text-sm px-3 py-1.5 rounded-md transition-colors"
          >
            {t('signOut')}
          </button>
        </>
      ) : (
        <button
          onClick={() => signIn()}
          className="nav-auth-button-primary text-sm px-4 py-2 rounded-md transition-colors"
        >
          {t('signIn')}
        </button>
      )}
    </>
  )
}

export default function NavAuthMenu({ locale }: Props) {
  return (
    <SessionProvider>
      <AuthMenuInner locale={locale} />
    </SessionProvider>
  )
}
