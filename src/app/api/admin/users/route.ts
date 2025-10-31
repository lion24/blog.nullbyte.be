import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdmin, UnauthorizedError, ForbiddenError } from '@/lib/auth'
import { Role } from '@prisma/client'
import { ErrorCode, createErrorResponse } from '@/lib/errors'

/**
 * GET /api/admin/users
 * List all users - requires admin authentication
 */
export async function GET() {
  try {
    // Check if user is admin (throws UnauthorizedError or ForbiddenError if not)
    await requireAdmin()

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
    // Handle authentication/authorization errors
    if (error instanceof UnauthorizedError) {
      return NextResponse.json(
        createErrorResponse(error.code, error.message),
        { status: 401 }
      )
    }
    if (error instanceof ForbiddenError) {
      return NextResponse.json(
        createErrorResponse(error.code, error.message),
        { status: 403 }
      )
    }

    console.error('Error fetching users:', error)
    return NextResponse.json(
      createErrorResponse(ErrorCode.INTERNAL_ERROR, 'Failed to fetch users'),
      { status: 500 }
    )
  }
}

/**
 * PATCH /api/admin/users
 * Update user role - requires admin authentication
 */
export async function PATCH(request: NextRequest) {
  try {
    // Check if user is admin (throws UnauthorizedError or ForbiddenError if not)
    await requireAdmin()

    const body = await request.json()
    const { userId, role } = body

    if (!userId || !role) {
      return NextResponse.json(
        createErrorResponse(ErrorCode.MISSING_REQUIRED_FIELD, 'User ID and role are required'),
        { status: 400 }
      )
    }

    if (!Object.values(Role).includes(role)) {
      return NextResponse.json(
        createErrorResponse(ErrorCode.INVALID_ROLE, 'Invalid role'),
        { status: 400 }
      )
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
    // Handle authentication/authorization errors
    if (error instanceof UnauthorizedError) {
      return NextResponse.json(
        createErrorResponse(error.code, error.message),
        { status: 401 }
      )
    }
    if (error instanceof ForbiddenError) {
      return NextResponse.json(
        createErrorResponse(error.code, error.message),
        { status: 403 }
      )
    }

    console.error('Error updating user role:', error)
    return NextResponse.json(
      createErrorResponse(ErrorCode.INTERNAL_ERROR, 'Failed to update user role'),
      { status: 500 }
    )
  }
}
