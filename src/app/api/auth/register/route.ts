import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { hashPassword, isPasswordStrongEnough, MIN_PASSWORD_LENGTH } from '@/lib/password'
import { gravatarUrl } from '@/lib/gravatar'
import { ErrorCode, createErrorResponse } from '@/lib/errors'
import { checkRateLimit, strictLimiter } from '@/lib/rate-limit'

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export async function POST(request: NextRequest) {
  const rateLimitError = await checkRateLimit(request, strictLimiter)
  if (rateLimitError) return rateLimitError

  let body: { email?: unknown; password?: unknown; name?: unknown }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json(createErrorResponse(ErrorCode.BAD_REQUEST, 'Invalid JSON body'), { status: 400 })
  }

  const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : ''
  const password = typeof body.password === 'string' ? body.password : ''
  const name = typeof body.name === 'string' ? body.name.trim() : null

  if (!EMAIL_REGEX.test(email)) {
    return NextResponse.json(createErrorResponse(ErrorCode.INVALID_INPUT, 'Invalid email'), { status: 400 })
  }
  if (!isPasswordStrongEnough(password)) {
    return NextResponse.json(
      createErrorResponse(ErrorCode.INVALID_INPUT, `Password must be at least ${MIN_PASSWORD_LENGTH} characters`),
      { status: 400 },
    )
  }

  const existing = await prisma.user.findUnique({ where: { email }, select: { id: true, password: true } })
  if (existing) {
    if (existing.password) {
      return NextResponse.json(
        createErrorResponse(ErrorCode.INVALID_INPUT, 'An account with this email already exists'),
        { status: 409 },
      )
    }
    return NextResponse.json(
      createErrorResponse(
        ErrorCode.INVALID_INPUT,
        'This email is already linked to a social account. Please sign in with that provider.',
      ),
      { status: 409 },
    )
  }

  const hash = await hashPassword(password)
  const user = await prisma.user.create({
    data: { email, password: hash, name: name || null, image: gravatarUrl(email) },
    select: { id: true, email: true },
  })

  return NextResponse.json(user, { status: 201 })
}
