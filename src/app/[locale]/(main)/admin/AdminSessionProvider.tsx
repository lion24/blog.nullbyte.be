'use client'

import { SessionProvider } from 'next-auth/react'

/**
 * Thin client wrapper so admin/layout.tsx can stay a Server Component while
 * still mounting next-auth's SessionProvider for descendants.
 */
export default function AdminSessionProvider({
  children,
}: {
  children: React.ReactNode
}) {
  return <SessionProvider>{children}</SessionProvider>
}
