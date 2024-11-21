import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/auth'
import { Role } from '@prisma/client'

export async function GET() {
  try {
    // Check if user is admin
    const authResult = await requireAdmin()
    if (authResult instanceof NextResponse) {
      return authResult
    }
    
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        image: true,
        role: true,
        emailVerified: true,
        _count: {
          select: { posts: true }
        }
      },
      orderBy: { email: 'asc' }
    })
    
    return NextResponse.json(users)
  } catch (error) {
    console.error('Error fetching users:', error)
    return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  try {
    // Check if user is admin
    const authResult = await requireAdmin()
    if (authResult instanceof NextResponse) {
      return authResult
    }
    
    const body = await request.json()
    const { userId, role } = body
    
    if (!userId || !role) {
      return NextResponse.json({ error: 'User ID and role are required' }, { status: 400 })
    }
    
    if (!Object.values(Role).includes(role)) {
      return NextResponse.json({ error: 'Invalid role' }, { status: 400 })
    }
    
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { role },
      select: {
        id: true,
        email: true,
        name: true,
        role: true
      }
    })
    
    return NextResponse.json(updatedUser)
  } catch (error) {
    console.error('Error updating user role:', error)
    return NextResponse.json({ error: 'Failed to update user role' }, { status: 500 })
  }
}