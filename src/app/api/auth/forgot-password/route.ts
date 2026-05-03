import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'
import { prisma } from '@/lib/prisma'
import { sendEmail } from '@/lib/email/send'
import { passwordResetEmail } from '@/lib/email/templates'
import { ErrorCode, createErrorResponse } from '@/lib/errors'
import { checkRateLimit, strictLimiter } from '@/lib/rate-limit'

const RESET_TOKEN_TTL_MS = 60 * 60 * 1000
const RESET_IDENTIFIER_PREFIX = 'password-reset:'

export async function POST(request: NextRequest) {
  const rateLimitError = await checkRateLimit(request, strictLimiter)
  if (rateLimitError) return rateLimitError

  let body: { email?: unknown }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json(createErrorResponse(ErrorCode.BAD_REQUEST, 'Invalid JSON body'), { status: 400 })
  }

  const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : ''
  if (!email) {
    return NextResponse.json(createErrorResponse(ErrorCode.INVALID_INPUT, 'Email is required'), { status: 400 })
  }

  const user = await prisma.user.findUnique({ where: { email }, select: { id: true, password: true } })

  if (user && user.password) {
    const token = crypto.randomBytes(32).toString('hex')
    const expires = new Date(Date.now() + RESET_TOKEN_TTL_MS)
    await prisma.verificationToken.create({
      data: {
        identifier: `${RESET_IDENTIFIER_PREFIX}${email}`,
        token,
        expires,
      },
    })

    const baseUrl = process.env.NEXTAUTH_URL || new URL(request.url).origin
    const resetUrl = `${baseUrl}/auth/reset-password?token=${encodeURIComponent(token)}`
    const host = new URL(baseUrl).host
    const { subject, html, text } = passwordResetEmail(resetUrl, host)

    try {
      await sendEmail({ to: email, subject, html, text })
    } catch (error) {
      console.error('Failed to send password reset email:', error)
    }
  }

  return NextResponse.json({ ok: true })
}
