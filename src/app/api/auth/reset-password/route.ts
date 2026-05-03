import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { hashPassword, isPasswordStrongEnough, MIN_PASSWORD_LENGTH } from '@/lib/password'
import { ErrorCode, createErrorResponse } from '@/lib/errors'
import { checkRateLimit, strictLimiter } from '@/lib/rate-limit'

const RESET_IDENTIFIER_PREFIX = 'password-reset:'

export async function POST(request: NextRequest) {
  const rateLimitError = await checkRateLimit(request, strictLimiter)
  if (rateLimitError) return rateLimitError

  let body: { token?: unknown; password?: unknown }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json(createErrorResponse(ErrorCode.BAD_REQUEST, 'Invalid JSON body'), { status: 400 })
  }

  const token = typeof body.token === 'string' ? body.token : ''
  const password = typeof body.password === 'string' ? body.password : ''

  if (!token) {
    return NextResponse.json(createErrorResponse(ErrorCode.INVALID_INPUT, 'Token is required'), { status: 400 })
  }
  if (!isPasswordStrongEnough(password)) {
    return NextResponse.json(
      createErrorResponse(ErrorCode.INVALID_INPUT, `Password must be at least ${MIN_PASSWORD_LENGTH} characters`),
      { status: 400 },
    )
  }

  const record = await prisma.verificationToken.findUnique({ where: { token } })
  if (!record || !record.identifier.startsWith(RESET_IDENTIFIER_PREFIX) || record.expires < new Date()) {
    return NextResponse.json(
      createErrorResponse(ErrorCode.INVALID_INPUT, 'This reset link is invalid or has expired'),
      { status: 400 },
    )
  }

  const email = record.identifier.slice(RESET_IDENTIFIER_PREFIX.length)
  const hash = await hashPassword(password)

  await prisma.$transaction([
    prisma.user.update({ where: { email }, data: { password: hash } }),
    prisma.verificationToken.delete({ where: { token } }),
  ])

  return NextResponse.json({ ok: true })
}
