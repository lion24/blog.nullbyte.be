import { getServerSession } from "next-auth"
import { Role } from "@prisma/client"
import { authOptions } from "@/lib/auth-options"
import { ErrorCode } from "@/lib/errors"
import { verifyBearerToken } from "@/lib/verify-bearer-token"
import { prisma } from "@/lib/prisma"
import { headers } from "next/headers"

/**
 * Custom error for unauthorized access (401)
 */
export class UnauthorizedError extends Error {
  public readonly code = ErrorCode.UNAUTHORIZED

  constructor(message: string = 'Unauthorized - Authentication required') {
    super(message)
    this.name = 'UnauthorizedError'
  }
}

/**
 * Custom error for forbidden access (403)
 */
export class ForbiddenError extends Error {
  public readonly code = ErrorCode.FORBIDDEN

  constructor(message: string = 'Forbidden - Insufficient permissions') {
    super(message)
    this.name = 'ForbiddenError'
  }
}

/**
 * Require authentication - throws UnauthorizedError if not authenticated
 * Supports both session (NextAuth) and bearer token authentication
 */
export async function requireAuth() {
  // Try session authentication first
  const session = await getServerSession(authOptions)

  if (session?.user?.email) {
    return session
  }

  // Try bearer token authentication
  const headersList = await headers()
  const authHeader = headersList.get('authorization')
  
  if (authHeader) {
    const serviceAccount = await verifyBearerToken(authHeader)
    
    if (serviceAccount) {
      // Get the user who created this service account
      const user = await prisma.user.findUnique({
        where: { id: serviceAccount.createdById },
        select: { id: true, email: true, role: true, name: true, image: true }
      })
      
      if (user) {
        // Return a session-like object for compatibility
        return {
          user: {
            id: user.id,
            email: user.email,
            role: user.role,
            name: user.name,
            image: user.image,
          },
          expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24h from now
          serviceAccount: {
            id: serviceAccount.serviceAccountId,
            name: serviceAccount.name,
            scopes: serviceAccount.scopes,
          }
        }
      }
    }
  }

  throw new UnauthorizedError()
}

/**
 * Require specific role(s) - throws UnauthorizedError or ForbiddenError
 * Supports both session (NextAuth) and bearer token authentication
 */
export async function requireRole(roles: Role[]) {
  const session = await requireAuth() // This now handles both auth methods

  if (!roles.includes(session.user.role)) {
    throw new ForbiddenError(`Required role: ${roles.join(' or ')}`)
  }

  return session
}

/**
 * Require admin role - throws UnauthorizedError or ForbiddenError
 */
export async function requireAdmin() {
  return requireRole([Role.ADMIN])
}

/**
 * Check if user has admin role
 */
export function isAdmin(role: Role | undefined): boolean {
  return role === Role.ADMIN
}
