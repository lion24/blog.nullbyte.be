import { getServerSession } from "next-auth"
import { NextResponse } from "next/server"
import { Role } from "@prisma/client"
import { authOptions } from "@/lib/auth-options"

export async function requireAuth() {
  const session = await getServerSession(authOptions)
  
  if (!session || !session.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  
  return session
}

export async function requireRole(roles: Role[]) {
  const session = await getServerSession(authOptions)
  
  if (!session || !session.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  
  if (!roles.includes(session.user.role)) {
    return NextResponse.json({ error: 'Forbidden - Insufficient permissions' }, { status: 403 })
  }
  
  return session
}

export async function requireAdmin() {
  return requireRole([Role.ADMIN])
}

export function isAdmin(role: Role | undefined): boolean {
  return role === Role.ADMIN
}