import { getServerSession } from "next-auth"
import { Role } from "@prisma/client"
import { authOptions } from "@/lib/auth-options"

/**
 * Custom error for unauthorized access (401)
 */
export class UnauthorizedError extends Error {
  constructor(message: string = 'Unauthorized - Authentication required') {
    super(message)
    this.name = 'UnauthorizedError'
  }
}

/**
 * Custom error for forbidden access (403)
 */
export class ForbiddenError extends Error {
  constructor(message: string = 'Forbidden - Insufficient permissions') {
    super(message)
    this.name = 'ForbiddenError'
  }
}

/**
 * Require authentication - throws UnauthorizedError if not authenticated
 */
export async function requireAuth() {
  const session = await getServerSession(authOptions)

  if (!session || !session.user?.email) {
    throw new UnauthorizedError()
  }

  return session
}

/**
 * Require specific role(s) - throws UnauthorizedError or ForbiddenError
 */
export async function requireRole(roles: Role[]) {
  const session = await getServerSession(authOptions)

  if (!session || !session.user?.email) {
    throw new UnauthorizedError()
  }

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