import { NextRequest, NextResponse } from 'next/server'
import { requireAdminAuth } from '@/lib/api-auth'
import { prisma } from '@/lib/prisma'
import { generateServiceAccountToken } from '@/lib/service-account-tokens'
import { AVAILABLE_SCOPES } from '@/lib/service-account-scopes'
import { z } from 'zod'

const createServiceAccountSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
  scopes: z.array(z.enum(AVAILABLE_SCOPES)).min(1),
})

/**
 * GET /api/admin/service-accounts
 * List all service accounts (without token hashes)
 */
export async function GET(request: NextRequest) {
  try {
    // Require admin authentication
    await requireAdminAuth(request)

    const serviceAccounts = await prisma.serviceAccount.findMany({
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
      orderBy: {
        createdAt: 'desc',
      },
    })

    return NextResponse.json({
      serviceAccounts,
      availableScopes: AVAILABLE_SCOPES,
    })
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    if (error instanceof Error && error.message === 'Forbidden') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }
    console.error('Error listing service accounts:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/admin/service-accounts
 * Create a new service account and return the token (only shown once!)
 */
export async function POST(request: NextRequest) {
  try {
    // Require admin authentication
    const auth = await requireAdminAuth(request)

    // Parse and validate request body
    const body = await request.json()
    const validation = createServiceAccountSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid request', details: validation.error.issues },
        { status: 400 }
      )
    }

    const { name, description, scopes } = validation.data

    // Generate token
    const { token, tokenHash } = await generateServiceAccountToken()

    // Create service account
    const serviceAccount = await prisma.serviceAccount.create({
      data: {
        name,
        description,
        tokenHash,
        scopes,
        createdById: auth.userId,
      },
      select: {
        id: true,
        name: true,
        description: true,
        scopes: true,
        revoked: true,
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

    // Return the service account details AND the plain-text token
    // IMPORTANT: This is the only time the token is shown!
    return NextResponse.json(
      {
        serviceAccount,
        token, // Plain-text token - user must save this!
        warning: 'This token will not be shown again. Save it securely.',
      },
      { status: 201 }
    )
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    if (error instanceof Error && error.message === 'Forbidden') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }
    console.error('Error creating service account:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
