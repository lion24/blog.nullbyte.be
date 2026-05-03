import { NextRequest } from 'next/server'
import { POST } from './route'
import { prisma } from '@/lib/prisma'
import { hashPassword } from '@/lib/password'
import { checkRateLimit } from '@/lib/rate-limit'

jest.mock('@/lib/prisma', () => ({
  prisma: {
    verificationToken: { findUnique: jest.fn(), delete: jest.fn() },
    user: { update: jest.fn() },
    $transaction: jest.fn(),
  },
}))

jest.mock('@/lib/password', () => ({
  hashPassword: jest.fn(),
  isPasswordStrongEnough: (s: string) => typeof s === 'string' && s.length >= 8,
  MIN_PASSWORD_LENGTH: 8,
}))

jest.mock('@/lib/rate-limit', () => ({
  checkRateLimit: jest.fn(),
  strictLimiter: {},
}))

const mockTokenFind = prisma.verificationToken.findUnique as jest.MockedFunction<typeof prisma.verificationToken.findUnique>
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mockTransaction = prisma.$transaction as jest.MockedFunction<any>
const mockHashPassword = hashPassword as jest.MockedFunction<typeof hashPassword>
const mockCheckRateLimit = checkRateLimit as jest.MockedFunction<typeof checkRateLimit>

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const makeRequest = (body: any) => ({ json: jest.fn().mockResolvedValue(body) }) as unknown as NextRequest

describe('POST /api/auth/reset-password', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockCheckRateLimit.mockResolvedValue(null)
  })

  it('updates password and deletes token when valid', async () => {
    mockTokenFind.mockResolvedValue({
      identifier: 'password-reset:a@b.co',
      token: 'tok',
      expires: new Date(Date.now() + 60_000),
    })
    mockHashPassword.mockResolvedValue('newhash')
    mockTransaction.mockResolvedValue([])

    const res = await POST(makeRequest({ token: 'tok', password: 'newpassword123' }))
    expect(res.status).toBe(200)
    expect(mockHashPassword).toHaveBeenCalledWith('newpassword123')
    expect(mockTransaction).toHaveBeenCalledTimes(1)
  })

  it('rejects expired tokens', async () => {
    mockTokenFind.mockResolvedValue({
      identifier: 'password-reset:a@b.co',
      token: 'tok',
      expires: new Date(Date.now() - 1000),
    })
    const res = await POST(makeRequest({ token: 'tok', password: 'newpassword123' }))
    expect(res.status).toBe(400)
    expect(mockTransaction).not.toHaveBeenCalled()
  })

  it('rejects unknown tokens', async () => {
    mockTokenFind.mockResolvedValue(null)
    const res = await POST(makeRequest({ token: 'tok', password: 'newpassword123' }))
    expect(res.status).toBe(400)
  })

  it('rejects tokens not scoped to password reset', async () => {
    mockTokenFind.mockResolvedValue({
      identifier: 'a@b.co',
      token: 'tok',
      expires: new Date(Date.now() + 60_000),
    })
    const res = await POST(makeRequest({ token: 'tok', password: 'newpassword123' }))
    expect(res.status).toBe(400)
    expect(mockTransaction).not.toHaveBeenCalled()
  })

  it('rejects weak passwords', async () => {
    const res = await POST(makeRequest({ token: 'tok', password: 'short' }))
    expect(res.status).toBe(400)
  })

  it('rejects missing token', async () => {
    const res = await POST(makeRequest({ password: 'newpassword123' }))
    expect(res.status).toBe(400)
  })

  it('respects rate limiting', async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    mockCheckRateLimit.mockResolvedValue({ status: 429 } as any)
    const res = await POST(makeRequest({ token: 'tok', password: 'newpassword123' }))
    expect(res.status).toBe(429)
  })
})
