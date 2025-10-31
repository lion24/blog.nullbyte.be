import { NextRequest } from 'next/server'
import { GET, PATCH } from './route'
import { prisma } from '@/lib/prisma'
import { requireAdmin, UnauthorizedError, ForbiddenError } from '@/lib/auth'
import { Role } from '@prisma/client'
import { ErrorCode } from '@/lib/errors'

// Mock dependencies
jest.mock('@/lib/prisma', () => ({
  prisma: {
    user: {
      findMany: jest.fn(),
      update: jest.fn(),
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

const mockRequireAdmin = requireAdmin as jest.MockedFunction<typeof requireAdmin>
const mockPrismaUserFindMany = prisma.user.findMany as jest.MockedFunction<typeof prisma.user.findMany>
const mockPrismaUserUpdate = prisma.user.update as jest.MockedFunction<typeof prisma.user.update>

describe('GET /api/admin/users', () => {
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

  const mockUsers = [
    {
      id: 'user-1',
      email: 'admin@example.com',
      name: 'Admin User',
      image: 'https://example.com/admin.jpg',
      role: Role.ADMIN,
      emailVerified: new Date(),
      _count: { posts: 5 },
    },
    {
      id: 'user-2',
      email: 'reader@example.com',
      name: 'Reader User',
      image: null,
      role: Role.READER,
      emailVerified: null,
      _count: { posts: 0 },
    },
  ]

  it('should return all users when user is admin', async () => {
    mockRequireAdmin.mockResolvedValue(mockSession)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    mockPrismaUserFindMany.mockResolvedValue(mockUsers as any)

    const response = await GET()
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data).toHaveLength(2)
    expect(data[0].email).toBe('admin@example.com')
    expect(data[1].email).toBe('reader@example.com')
    expect(mockRequireAdmin).toHaveBeenCalledTimes(1)
    expect(mockPrismaUserFindMany).toHaveBeenCalledWith({
      select: {
        id: true,
        email: true,
        name: true,
        image: true,
        role: true,
        emailVerified: true,
        _count: {
          select: { posts: true },
        },
      },
      orderBy: { email: 'asc' },
    })
  })

  it('should return 401 when user is not authenticated', async () => {
    mockRequireAdmin.mockRejectedValue(new UnauthorizedError())

    const response = await GET()
    const data = await response.json()

    expect(response.status).toBe(401)
    expect(data.error.code).toBe(ErrorCode.UNAUTHORIZED)
    expect(data.error.message).toBeDefined()
    expect(mockPrismaUserFindMany).not.toHaveBeenCalled()
  })

  it('should return 403 when user is not admin', async () => {
    mockRequireAdmin.mockRejectedValue(new ForbiddenError('Required role: ADMIN'))

    const response = await GET()
    const data = await response.json()

    expect(response.status).toBe(403)
    expect(data.error.code).toBe(ErrorCode.FORBIDDEN)
    expect(data.error.message).toBeDefined()
    expect(mockPrismaUserFindMany).not.toHaveBeenCalled()
  })

  it('should return 500 when database operation fails', async () => {
    mockRequireAdmin.mockResolvedValue(mockSession)
    mockPrismaUserFindMany.mockRejectedValue(new Error('Database error'))

    const response = await GET()
    const data = await response.json()

    expect(response.status).toBe(500)
    expect(data.error.code).toBe(ErrorCode.INTERNAL_ERROR)
    expect(data.error.message).toBeDefined()
  })
})

describe('PATCH /api/admin/users', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const createMockRequest = (body: any) => {
    return {
      json: jest.fn().mockResolvedValue(body),
      nextUrl: {
        searchParams: new URLSearchParams(),
      },
    } as unknown as NextRequest
  }

  const mockSession = {
    user: {
      id: 'user-123',
      email: 'admin@example.com',
      name: 'Admin User',
      role: Role.ADMIN,
    },
    expires: '2024-12-31',
  }

  const mockUpdatedUser = {
    id: 'user-123',
    email: 'reader@example.com',
    name: 'Reader User',
    role: Role.ADMIN,
  }

  it('should update user role successfully when user is admin', async () => {
    mockRequireAdmin.mockResolvedValue(mockSession)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    mockPrismaUserUpdate.mockResolvedValue(mockUpdatedUser as any)

    const request = createMockRequest({
      userId: 'user-123',
      role: Role.ADMIN,
    })

    const response = await PATCH(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.id).toBe('user-123')
    expect(data.role).toBe(Role.ADMIN)
    expect(mockRequireAdmin).toHaveBeenCalledTimes(1)
    expect(mockPrismaUserUpdate).toHaveBeenCalledWith({
      where: { id: 'user-123' },
      data: { role: Role.ADMIN },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
      },
    })
  })

  it('should return 401 when user is not authenticated', async () => {
    mockRequireAdmin.mockRejectedValue(new UnauthorizedError())

    const request = createMockRequest({
      userId: 'user-123',
      role: Role.ADMIN,
    })

    const response = await PATCH(request)
    const data = await response.json()

    expect(response.status).toBe(401)
    expect(data.error.code).toBe(ErrorCode.UNAUTHORIZED)
    expect(data.error.message).toBeDefined()
    expect(mockPrismaUserUpdate).not.toHaveBeenCalled()
  })

  it('should return 403 when user is not admin', async () => {
    mockRequireAdmin.mockRejectedValue(new ForbiddenError('Required role: ADMIN'))

    const request = createMockRequest({
      userId: 'user-123',
      role: Role.ADMIN,
    })

    const response = await PATCH(request)
    const data = await response.json()

    expect(response.status).toBe(403)
    expect(data.error.code).toBe(ErrorCode.FORBIDDEN)
    expect(data.error.message).toBeDefined()
    expect(mockPrismaUserUpdate).not.toHaveBeenCalled()
  })

  it('should return 400 when userId is missing', async () => {
    mockRequireAdmin.mockResolvedValue(mockSession)

    const request = createMockRequest({
      role: Role.ADMIN,
    })

    const response = await PATCH(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error.code).toBe(ErrorCode.MISSING_REQUIRED_FIELD)
    expect(data.error.message).toBeDefined()
    expect(mockPrismaUserUpdate).not.toHaveBeenCalled()
  })

  it('should return 400 when role is missing', async () => {
    mockRequireAdmin.mockResolvedValue(mockSession)

    const request = createMockRequest({
      userId: 'user-123',
    })

    const response = await PATCH(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error.code).toBe(ErrorCode.MISSING_REQUIRED_FIELD)
    expect(data.error.message).toBeDefined()
    expect(mockPrismaUserUpdate).not.toHaveBeenCalled()
  })

  it('should return 400 when role is invalid', async () => {
    mockRequireAdmin.mockResolvedValue(mockSession)

    const request = createMockRequest({
      userId: 'user-123',
      role: 'INVALID_ROLE',
    })

    const response = await PATCH(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error.code).toBe(ErrorCode.INVALID_ROLE)
    expect(data.error.message).toBeDefined()
    expect(mockPrismaUserUpdate).not.toHaveBeenCalled()
  })

  it('should accept READER role', async () => {
    mockRequireAdmin.mockResolvedValue(mockSession)
    mockPrismaUserUpdate.mockResolvedValue({
      ...mockUpdatedUser,
      role: Role.READER,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any)

    const request = createMockRequest({
      userId: 'user-123',
      role: Role.READER,
    })

    const response = await PATCH(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.role).toBe(Role.READER)
  })

  it('should return 500 when database operation fails', async () => {
    mockRequireAdmin.mockResolvedValue(mockSession)
    mockPrismaUserUpdate.mockRejectedValue(new Error('Database error'))

    const request = createMockRequest({
      userId: 'user-123',
      role: Role.ADMIN,
    })

    const response = await PATCH(request)
    const data = await response.json()

    expect(response.status).toBe(500)
    expect(data.error.code).toBe(ErrorCode.INTERNAL_ERROR)
    expect(data.error.message).toBeDefined()
  })
})
