'use client'

import Link from 'next/link'
import { useSession, signIn, signOut } from 'next-auth/react'
import Image from 'next/image'
import ThemeToggle from './ThemeToggle'
import { Role } from '@prisma/client'

export default function Navigation() {
  const { data: session } = useSession()

  return (
    <nav style={{
      backgroundColor: 'var(--background-secondary)',
      borderBottom: '1px solid var(--border)',
      boxShadow: 'var(--shadow-sm)'
    }}>
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-8">
            <Link href="/" className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>
              Tech Blog
            </Link>
            <div className="hidden md:flex space-x-4">
              <Link 
                href="/" 
                className="transition-colors"
                style={{ color: 'var(--text-secondary)' }}
                onMouseEnter={(e) => e.currentTarget.style.color = 'var(--text-primary)'}
                onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-secondary)'}
              >
                Home
              </Link>
              <Link 
                href="/posts" 
                className="transition-colors"
                style={{ color: 'var(--text-secondary)' }}
                onMouseEnter={(e) => e.currentTarget.style.color = 'var(--text-primary)'}
                onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-secondary)'}
              >
                All Posts
              </Link>
              {session && session.user.role === Role.ADMIN && (
                <Link 
                  href="/admin" 
                  className="transition-colors"
                  style={{ color: 'var(--text-secondary)' }}
                  onMouseEnter={(e) => e.currentTarget.style.color = 'var(--text-primary)'}
                  onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-secondary)'}
                >
                  Admin
                </Link>
              )}
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <ThemeToggle />
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
                  <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{session.user?.name}</span>
                </div>
                <button
                  onClick={() => signOut()}
                  className="text-sm px-3 py-1.5 rounded-md transition-colors"
                  style={{
                    backgroundColor: 'var(--background-tertiary)',
                    color: 'var(--text-primary)',
                    border: '1px solid var(--border)'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'var(--border)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'var(--background-tertiary)';
                  }}
                >
                  Sign Out
                </button>
              </>
            ) : (
              <button
                onClick={() => signIn('github')}
                className="text-sm px-4 py-2 rounded-md transition-colors"
                style={{
                  backgroundColor: 'var(--text-primary)',
                  color: 'var(--background)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'var(--text-secondary)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'var(--text-primary)';
                }}
              >
                Sign In with GitHub
              </button>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}