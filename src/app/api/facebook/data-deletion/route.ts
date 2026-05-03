import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'

function base64UrlDecode(input: string): Buffer {
  const padded = input.replace(/-/g, '+').replace(/_/g, '/')
  const padding = '='.repeat((4 - (padded.length % 4)) % 4)
  return Buffer.from(padded + padding, 'base64')
}

interface SignedRequestPayload {
  user_id?: string
  algorithm?: string
  issued_at?: number
  [key: string]: unknown
}

function parseSignedRequest(signedRequest: string, secret: string): SignedRequestPayload | null {
  const [encodedSig, encodedPayload] = signedRequest.split('.')
  if (!encodedSig || !encodedPayload) return null

  const sig = base64UrlDecode(encodedSig)
  const expectedSig = crypto.createHmac('sha256', secret).update(encodedPayload).digest()

  if (sig.length !== expectedSig.length || !crypto.timingSafeEqual(sig, expectedSig)) {
    return null
  }

  try {
    const payload = JSON.parse(base64UrlDecode(encodedPayload).toString('utf8')) as SignedRequestPayload
    if (payload.algorithm !== 'HMAC-SHA256') return null
    return payload
  } catch {
    return null
  }
}

export async function POST(request: NextRequest) {
  const secret = process.env.FACEBOOK_CLIENT_SECRET
  if (!secret) {
    return NextResponse.json({ error: 'Server misconfigured' }, { status: 500 })
  }

  const formData = await request.formData().catch(() => null)
  const signedRequest = formData?.get('signed_request')
  if (typeof signedRequest !== 'string' || !signedRequest) {
    return NextResponse.json({ error: 'Missing signed_request' }, { status: 400 })
  }

  const payload = parseSignedRequest(signedRequest, secret)
  if (!payload || !payload.user_id) {
    return NextResponse.json({ error: 'Invalid signed_request' }, { status: 400 })
  }

  const confirmationCode = crypto.randomBytes(16).toString('hex')

  // Deletion is processed manually by the admin to avoid destructive cascades
  // on user-authored posts. The request is logged for review; users are also
  // directed to email the admin via the data-deletion instructions page.
  console.warn('[facebook-data-deletion] request received', {
    facebookUserId: payload.user_id,
    confirmationCode,
    issuedAt: payload.issued_at,
  })

  const baseUrl = process.env.NEXTAUTH_URL || new URL(request.url).origin
  const statusUrl = `${baseUrl}/en/legal/data-deletion-status?code=${confirmationCode}`

  return NextResponse.json({
    url: statusUrl,
    confirmation_code: confirmationCode,
  })
}
