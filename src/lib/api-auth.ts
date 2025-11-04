/**
 * API Authentication utilities
 * Supports both session-based (browser) and bearer token (external tools) authentication
 */

import { getServerSession } from 'next-auth'
import { authOptions } from './auth-options'
import { prisma } from './prisma'
import { verifyBearerToken } from './verify-bearer-token'

export type AuthMethod = 'session' | 'bearer-token'

export interface AuthResult {
  userId: string
  email: string
  role: string
  method: AuthMethod
  serviceAccountId?: string
  serviceAccountScopes?: string[]
}

/**
 * Authenticate a request using either session or bearer token
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
  
  // Try bearer token authentication (for external tools)
  const authHeader = request.headers.get('authorization')
  if (authHeader) {
    const serviceAccount = await verifyBearerToken(authHeader)
    
    if (serviceAccount) {
      // Get the user who created this service account
      const user = await prisma.user.findUnique({
        where: { id: serviceAccount.createdById },
        select: { id: true, email: true, role: true }
      })
      
      if (user && user.email) {
        return {
          userId: user.id,
          email: user.email,
          role: user.role,
          method: 'bearer-token',
          serviceAccountId: serviceAccount.serviceAccountId,
          serviceAccountScopes: serviceAccount.scopes,
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
