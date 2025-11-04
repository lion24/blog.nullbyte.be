import { NextRequest, NextResponse } from 'next/server'
import { requireAdminAuth } from '@/lib/api-auth'
import { prisma } from '@/lib/prisma'

interface RouteParams {
  params: Promise<{
    id: string
  }>
}

/**
 * GET /api/admin/service-accounts/[id]
 * Get a specific service account by ID
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    // Require admin authentication
    await requireAdminAuth(request)

    const { id } = await params

    const serviceAccount = await prisma.serviceAccount.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        description: true,
        scopes: true,
        revoked: true,
        lastUsedAt: true,
        createdAt: true,
        updatedAt: true,
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    })

    if (!serviceAccount) {
      return NextResponse.json(
        { error: 'Service account not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ serviceAccount })
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    if (error instanceof Error && error.message === 'Forbidden') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }
    console.error('Error fetching service account:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * PATCH /api/admin/service-accounts/[id]
 * Update a service account (currently only supports revoking)
 */
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    // Require admin authentication
    await requireAdminAuth(request)

    const { id } = await params
    const body = await request.json()

    // Only allow revoking for now
    if (body.revoked !== true) {
      return NextResponse.json(
        { error: 'Only revoking is supported. Set revoked: true' },
        { status: 400 }
      )
    }

    // Check if service account exists
    const existing = await prisma.serviceAccount.findUnique({
      where: { id },
    })

    if (!existing) {
      return NextResponse.json(
        { error: 'Service account not found' },
        { status: 404 }
      )
    }

    if (existing.revoked) {
      return NextResponse.json(
        { error: 'Service account is already revoked' },
        { status: 400 }
      )
    }

    // Revoke the service account
    const serviceAccount = await prisma.serviceAccount.update({
      where: { id },
      data: { revoked: true },
      select: {
        id: true,
        name: true,
        description: true,
        scopes: true,
        revoked: true,
        lastUsedAt: true,
        createdAt: true,
        updatedAt: true,
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    })

    return NextResponse.json({ serviceAccount })
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    if (error instanceof Error && error.message === 'Forbidden') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }
    console.error('Error updating service account:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/admin/service-accounts/[id]
 * Permanently delete a service account
 */
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    // Require admin authentication
    await requireAdminAuth(request)

    const { id } = await params

    // Check if service account exists
    const existing = await prisma.serviceAccount.findUnique({
      where: { id },
    })

    if (!existing) {
      return NextResponse.json(
        { error: 'Service account not found' },
        { status: 404 }
      )
    }

    // Delete the service account
    await prisma.serviceAccount.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    if (error instanceof Error && error.message === 'Forbidden') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }
    console.error('Error deleting service account:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
