import { NextRequest } from 'next/server'
import { POST } from './route'
import { prisma } from '@/lib/prisma'
import { hashPassword } from '@/lib/password'
import { checkRateLimit } from '@/lib/rate-limit'

jest.mock('@/lib/prisma', () => ({
  prisma: {
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
    },
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

const mockFindUnique = prisma.user.findUnique as jest.MockedFunction<typeof prisma.user.findUnique>
const mockCreate = prisma.user.create as jest.MockedFunction<typeof prisma.user.create>
const mockHashPassword = hashPassword as jest.MockedFunction<typeof hashPassword>
const mockCheckRateLimit = checkRateLimit as jest.MockedFunction<typeof checkRateLimit>

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const makeRequest = (body: any) => ({ json: jest.fn().mockResolvedValue(body) }) as unknown as NextRequest

describe('POST /api/auth/register', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockCheckRateLimit.mockResolvedValue(null)
  })

  it('creates a user with hashed password', async () => {
    mockFindUnique.mockResolvedValue(null)
    mockHashPassword.mockResolvedValue('hashed')
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    mockCreate.mockResolvedValue({ id: 'u1', email: 'a@b.co' } as any)

    const res = await POST(makeRequest({ email: 'a@b.co', password: 'password123', name: 'A' }))
    const data = await res.json()

    expect(res.status).toBe(201)
    expect(data).toEqual({ id: 'u1', email: 'a@b.co' })
    expect(mockHashPassword).toHaveBeenCalledWith('password123')
    expect(mockCreate).toHaveBeenCalledWith({
      data: {
        email: 'a@b.co',
        password: 'hashed',
        name: 'A',
        image: expect.stringMatching(/^https:\/\/www\.gravatar\.com\/avatar\/[a-f0-9]{32}\?d=identicon/),
      },
      select: { id: true, email: true },
    })
  })

  it('rejects weak passwords', async () => {
    const res = await POST(makeRequest({ email: 'a@b.co', password: 'short' }))
    expect(res.status).toBe(400)
    expect(mockCreate).not.toHaveBeenCalled()
  })

  it('rejects invalid emails', async () => {
    const res = await POST(makeRequest({ email: 'not-an-email', password: 'password123' }))
    expect(res.status).toBe(400)
  })

  it('returns 409 when email already has a password', async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    mockFindUnique.mockResolvedValue({ id: 'u1', password: 'existing' } as any)
    const res = await POST(makeRequest({ email: 'a@b.co', password: 'password123' }))
    expect(res.status).toBe(409)
  })

  it('returns 409 when email belongs to OAuth-only user', async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    mockFindUnique.mockResolvedValue({ id: 'u1', password: null } as any)
    const res = await POST(makeRequest({ email: 'a@b.co', password: 'password123' }))
    expect(res.status).toBe(409)
    const data = await res.json()
    expect(data.error.message).toMatch(/social/i)
  })

  it('respects rate limiting', async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    mockCheckRateLimit.mockResolvedValue({ status: 429 } as any)
    const res = await POST(makeRequest({ email: 'a@b.co', password: 'password123' }))
    expect(res.status).toBe(429)
    expect(mockFindUnique).not.toHaveBeenCalled()
  })
})
