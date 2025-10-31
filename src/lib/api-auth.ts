/**
 * API Authentication utilities
 * Supports both session-based (browser) and API key (external tools) authentication
 */

import { getServerSession } from 'next-auth'
import { authOptions } from './auth-options'
import { prisma } from './prisma'

export type AuthMethod = 'session' | 'api-key'

export interface AuthResult {
  userId: string
  email: string
  role: string
  method: AuthMethod
}

/**
 * Authenticate a request using either session or API key
 * Returns user info if authenticated, null otherwise
 */
export async function authenticateRequest(request: Request): Promise<AuthResult | null> {
  // Try session authentication first (for browser requests)
  const session = await getServerSession(authOptions)
  if (session?.user?.email) {
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true, email: true, role: true }
    })
    
    if (user && user.email) {
      return {
        userId: user.id,
        email: user.email,
        role: user.role,
        method: 'session'
      }
    }
  }
  
  // Try API key authentication (for external tools)
  const apiKey = request.headers.get('x-api-key') || request.headers.get('authorization')?.replace('Bearer ', '')
  
  if (apiKey) {
    // TODO: Implement API key lookup in database
    // For now, check against environment variable
    const validApiKey = process.env.API_KEY
    
    if (validApiKey && apiKey === validApiKey) {
      // Get admin user for API key requests
      const adminUser = await prisma.user.findFirst({
        where: { role: 'ADMIN' },
        select: { id: true, email: true, role: true }
      })
      
      if (adminUser && adminUser.email) {
        return {
          userId: adminUser.id,
          email: adminUser.email,
          role: adminUser.role,
          method: 'api-key'
        }
      }
    }
  }
  
  return null
}

/**
 * Require authentication (any method)
 * Throws 401 if not authenticated
 */
export async function requireAuth(request: Request): Promise<AuthResult> {
  const auth = await authenticateRequest(request)
  
  if (!auth) {
    throw new Error('Unauthorized')
  }
  
  return auth
}

/**
 * Require admin role
 * Throws 401 if not authenticated, 403 if not admin
 */
export async function requireAdminAuth(request: Request): Promise<AuthResult> {
  const auth = await requireAuth(request)
  
  if (auth.role !== 'ADMIN') {
    throw new Error('Forbidden')
  }
  
  return auth
}
