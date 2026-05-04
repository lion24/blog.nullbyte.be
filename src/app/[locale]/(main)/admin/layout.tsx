import AdminSessionProvider from './AdminSessionProvider'

/**
 * Provides next-auth's SessionProvider for the admin section. Public reader
 * pages no longer wrap the whole tree in SessionProvider, so admin pages
 * (which use useSession) need this scoped provider.
 *
 * The provider does its own /api/auth/session fetch on mount — we deliberately
 * don't pre-fetch with getServerSession() here. Pre-fetching makes the layout
 * dynamic, but Next.js's static analysis can still prerender the children with
 * a null session at build time; once cached, signed-in admins would be stuck
 * with that cached null. Letting the provider fetch is reliable and the cost
 * (one extra round-trip on admin pages only) is negligible.
 */
export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <AdminSessionProvider>{children}</AdminSessionProvider>
}
