import crypto from 'crypto'
import { NextRequest } from 'next/server'
import { POST } from './route'

const SECRET = 'test-facebook-secret'

function base64Url(input: Buffer | string): string {
  const buf = typeof input === 'string' ? Buffer.from(input) : input
  return buf.toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

function makeSignedRequest(payload: object, secret: string = SECRET): string {
  const encodedPayload = base64Url(JSON.stringify(payload))
  const sig = crypto.createHmac('sha256', secret).update(encodedPayload).digest()
  return `${base64Url(sig)}.${encodedPayload}`
}

function makeRequest(signedRequest: string | null, url = 'https://example.com/api/facebook/data-deletion'): NextRequest {
  const formData = new Map<string, FormDataEntryValue>()
  if (signedRequest !== null) formData.set('signed_request', signedRequest)
  return {
    formData: jest.fn().mockResolvedValue({ get: (k: string) => formData.get(k) ?? null }),
    url,
  } as unknown as NextRequest
}

describe('POST /api/facebook/data-deletion', () => {
  beforeEach(() => {
    process.env.FACEBOOK_CLIENT_SECRET = SECRET
    process.env.NEXTAUTH_URL = 'https://example.com'
  })

  it('returns confirmation URL and code for valid signed_request', async () => {
    const signed = makeSignedRequest({
      algorithm: 'HMAC-SHA256',
      user_id: '123456',
      issued_at: Math.floor(Date.now() / 1000),
    })
    const res = await POST(makeRequest(signed))
    expect(res.status).toBe(200)
    const data = await res.json()
    expect(data.url).toContain('/legal/data-deletion-status?code=')
    expect(data.confirmation_code).toMatch(/^[a-f0-9]{32}$/)
  })

  it('rejects when signed_request is missing', async () => {
    const res = await POST(makeRequest(null))
    expect(res.status).toBe(400)
  })

  it('rejects when signature is wrong', async () => {
    const signed = makeSignedRequest({ algorithm: 'HMAC-SHA256', user_id: '1' }, 'wrong-secret')
    const res = await POST(makeRequest(signed))
    expect(res.status).toBe(400)
  })

  it('rejects when algorithm is unexpected', async () => {
    const signed = makeSignedRequest({ algorithm: 'PLAIN', user_id: '1' })
    const res = await POST(makeRequest(signed))
    expect(res.status).toBe(400)
  })

  it('rejects when user_id is missing', async () => {
    const signed = makeSignedRequest({ algorithm: 'HMAC-SHA256' })
    const res = await POST(makeRequest(signed))
    expect(res.status).toBe(400)
  })

  it('returns 500 when FACEBOOK_CLIENT_SECRET is not set', async () => {
    delete process.env.FACEBOOK_CLIENT_SECRET
    const res = await POST(makeRequest('anything'))
    expect(res.status).toBe(500)
  })
})
