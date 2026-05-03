import { NextRequest } from 'next/server'
import { POST } from './route'
import { prisma } from '@/lib/prisma'
import { sendEmail } from '@/lib/email/send'
import { checkRateLimit } from '@/lib/rate-limit'

jest.mock('@/lib/prisma', () => ({
  prisma: {
    user: { findUnique: jest.fn() },
    verificationToken: { create: jest.fn() },
  },
}))

jest.mock('@/lib/email/send', () => ({
  sendEmail: jest.fn(),
}))

jest.mock('@/lib/rate-limit', () => ({
  checkRateLimit: jest.fn(),
  strictLimiter: {},
}))

const mockFindUnique = prisma.user.findUnique as jest.MockedFunction<typeof prisma.user.findUnique>
const mockTokenCreate = prisma.verificationToken.create as jest.MockedFunction<typeof prisma.verificationToken.create>
const mockSendEmail = sendEmail as jest.MockedFunction<typeof sendEmail>
const mockCheckRateLimit = checkRateLimit as jest.MockedFunction<typeof checkRateLimit>

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const makeRequest = (body: any, url = 'https://example.com/api/auth/forgot-password') => ({
  json: jest.fn().mockResolvedValue(body),
  url,
}) as unknown as NextRequest

describe('POST /api/auth/forgot-password', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockCheckRateLimit.mockResolvedValue(null)
    process.env.NEXTAUTH_URL = 'https://example.com'
  })

  it('sends an email when the user exists with a password', async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    mockFindUnique.mockResolvedValue({ id: 'u1', password: 'hash' } as any)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    mockTokenCreate.mockResolvedValue({} as any)

    const res = await POST(makeRequest({ email: 'A@B.co' }))
    expect(res.status).toBe(200)
    expect(mockTokenCreate).toHaveBeenCalledWith(expect.objectContaining({
      data: expect.objectContaining({ identifier: 'password-reset:a@b.co' }),
    }))
    expect(mockSendEmail).toHaveBeenCalledTimes(1)
    const args = mockSendEmail.mock.calls[0][0]
    expect(args.to).toBe('a@b.co')
    expect(args.html).toContain('reset')
  })

  it('returns 200 without sending when user does not exist (no enumeration)', async () => {
    mockFindUnique.mockResolvedValue(null)
    const res = await POST(makeRequest({ email: 'unknown@example.com' }))
    expect(res.status).toBe(200)
    expect(mockTokenCreate).not.toHaveBeenCalled()
    expect(mockSendEmail).not.toHaveBeenCalled()
  })

  it('returns 200 without sending for OAuth-only users', async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    mockFindUnique.mockResolvedValue({ id: 'u1', password: null } as any)
    const res = await POST(makeRequest({ email: 'oauth@example.com' }))
    expect(res.status).toBe(200)
    expect(mockSendEmail).not.toHaveBeenCalled()
  })

  it('rejects empty email', async () => {
    const res = await POST(makeRequest({ email: '' }))
    expect(res.status).toBe(400)
  })

  it('respects rate limiting', async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    mockCheckRateLimit.mockResolvedValue({ status: 429 } as any)
    const res = await POST(makeRequest({ email: 'a@b.co' }))
    expect(res.status).toBe(429)
    expect(mockFindUnique).not.toHaveBeenCalled()
  })
})
