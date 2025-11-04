import { NextRequest } from 'next/server'
import { GET, POST } from './route'
import { prisma } from '@/lib/prisma'
import { requireAdmin, UnauthorizedError, ForbiddenError } from '@/lib/auth'
import { Role } from '@prisma/client'
import { ErrorCode } from '@/lib/errors'

// Mock dependencies
jest.mock('@/lib/prisma', () => ({
  prisma: {
    post: {
      findMany: jest.fn(),
      create: jest.fn(),
      findUnique: jest.fn(),
    },
  },
}))

jest.mock('@/lib/auth', () => {
  const { ErrorCode } = jest.requireActual('@/lib/errors')
  return {
    requireAdmin: jest.fn(),
    UnauthorizedError: class UnauthorizedError extends Error {
      code = ErrorCode.UNAUTHORIZED
      constructor(message = 'Unauthorized - Authentication required') {
        super(message)
        this.name = 'UnauthorizedError'
      }
    },
    ForbiddenError: class ForbiddenError extends Error {
      code = ErrorCode.FORBIDDEN
      constructor(message = 'Forbidden - Insufficient permissions') {
        super(message)
        this.name = 'ForbiddenError'
      }
    },
  }
})

jest.mock('@/lib/slug', () => ({
  generateUniqueSlug: jest.fn(),
  slugify: jest.fn((text: string) => text.toLowerCase().replace(/\s+/g, '-')),
}))

jest.mock('@/lib/reading-time', () => ({
  calculateReadingTime: jest.fn(() => 5),
}))

const mockRequireAdmin = requireAdmin as jest.MockedFunction<typeof requireAdmin>
const mockPrismaPostFindMany = prisma.post.findMany as jest.MockedFunction<typeof prisma.post.findMany>
const mockPrismaPostCreate = prisma.post.create as jest.MockedFunction<typeof prisma.post.create>

describe('GET /api/admin/posts', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  const mockSession = {
    user: {
      id: 'user-123',
      email: 'admin@example.com',
      name: 'Admin User',
      role: Role.ADMIN,
    },
    expires: '2024-12-31',
  }

  const mockPosts = [
    {
      id: 'post-1',
      title: 'Test Post 1',
      slug: 'test-post-1',
      excerpt: 'Test excerpt',
      content: [{ type: 'p', children: [{ text: 'Test content' }] }],
      published: true,
      readingTime: 5,
      featuredImage: null,
      author: {
        id: 'user-1',
        name: 'Author 1',
        email: 'author1@example.com',
        image: null,
      },
      tags: [],
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01'),
      views: 100,
    },
  ]

  it('should return all posts when user is authenticated as admin', async () => {
    mockRequireAdmin.mockResolvedValue(mockSession)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    mockPrismaPostFindMany.mockResolvedValue(mockPosts as any)

    const request = {
      nextUrl: {
        searchParams: new URLSearchParams(),
      },
    } as NextRequest

    const response = await GET(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(Array.isArray(data)).toBe(true)
    expect(data).toHaveLength(1)
    expect(data[0].title).toBe('Test Post 1')
    expect(mockRequireAdmin).toHaveBeenCalledTimes(1)
    expect(mockPrismaPostFindMany).toHaveBeenCalledTimes(1)
  })

  it('should return 401 when user is not authenticated', async () => {
    mockRequireAdmin.mockRejectedValue(new UnauthorizedError())

    const request = {
      nextUrl: {
        searchParams: new URLSearchParams(),
      },
    } as NextRequest

    const response = await GET(request)
    const data = await response.json()

    expect(response.status).toBe(401)
    expect(data.error.code).toBe(ErrorCode.UNAUTHORIZED)
    expect(data.error.message).toBe('Unauthorized - Authentication required')
    expect(mockPrismaPostFindMany).not.toHaveBeenCalled()
  })

  it('should return 403 when user is not admin', async () => {
    mockRequireAdmin.mockRejectedValue(new ForbiddenError('Required role: ADMIN'))

    const request = {
      nextUrl: {
        searchParams: new URLSearchParams(),
      },
    } as NextRequest

    const response = await GET(request)
    const data = await response.json()

    expect(response.status).toBe(403)
    expect(data.error.code).toBe(ErrorCode.FORBIDDEN)
    expect(data.error.message).toBe('Required role: ADMIN')
    expect(mockPrismaPostFindMany).not.toHaveBeenCalled()
  })

  it('should filter by published status when query param provided', async () => {
    mockRequireAdmin.mockResolvedValue(mockSession)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    mockPrismaPostFindMany.mockResolvedValue(mockPosts as any)

    const searchParams = new URLSearchParams()
    searchParams.set('published', 'true')
    const request = {
      nextUrl: { searchParams },
    } as NextRequest

    await GET(request)

    expect(mockPrismaPostFindMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { published: true },
      })
    )
  })

  it('should limit results when limit query param provided', async () => {
    mockRequireAdmin.mockResolvedValue(mockSession)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    mockPrismaPostFindMany.mockResolvedValue(mockPosts as any)

    const searchParams = new URLSearchParams()
    searchParams.set('limit', '10')
    const request = {
      nextUrl: { searchParams },
    } as NextRequest

    await GET(request)

    expect(mockPrismaPostFindMany).toHaveBeenCalledWith(
      expect.objectContaining({
        take: 10,
      })
    )
  })
})

describe('POST /api/admin/posts', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should return 401 when user is not authenticated', async () => {
    mockRequireAdmin.mockRejectedValue(new UnauthorizedError())

    const request = {
      json: async () => ({
        title: 'Test Post',
        content: [{ type: 'p', children: [{ text: 'Test' }] }],
      }),
    } as NextRequest

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(401)
    expect(data.error.code).toBe(ErrorCode.UNAUTHORIZED)
    expect(mockPrismaPostCreate).not.toHaveBeenCalled()
  })

  it('should return 403 when user is not admin', async () => {
    mockRequireAdmin.mockRejectedValue(new ForbiddenError('Required role: ADMIN'))

    const request = {
      json: async () => ({
        title: 'Test Post',
        content: [{ type: 'p', children: [{ text: 'Test' }] }],
      }),
    } as NextRequest

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(403)
    expect(data.error.code).toBe(ErrorCode.FORBIDDEN)
    expect(mockPrismaPostCreate).not.toHaveBeenCalled()
  })
})
