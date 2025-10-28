import { NextRequest } from 'next/server'
import { PUT, DELETE } from './route'
import { prisma } from '@/lib/prisma'
import { requireAdmin, UnauthorizedError, ForbiddenError } from '@/lib/auth'
import { Role } from '@prisma/client'
import { ErrorCode } from '@/lib/errors'

// Mock dependencies
jest.mock('@/lib/prisma', () => ({
  prisma: {
    post: {
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
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
const mockPrismaPostFindUnique = prisma.post.findUnique as jest.MockedFunction<typeof prisma.post.findUnique>
const mockPrismaPostUpdate = prisma.post.update as jest.MockedFunction<typeof prisma.post.update>
const mockPrismaPostDelete = prisma.post.delete as jest.MockedFunction<typeof prisma.post.delete>

describe('PUT /api/posts/[id]', () => {
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

  const mockParams = Promise.resolve({ id: 'post-123' })

  const mockSession = {
    user: {
      id: 'user-123',
      email: 'admin@example.com',
      name: 'Admin User',
      role: Role.ADMIN,
    },
    expires: '2024-12-31',
  }

  const mockPost = {
    id: 'post-123',
    title: 'Original Title',
    slug: 'original-title',
    content: 'Original content',
    excerpt: 'Original excerpt',
    featuredImage: null,
    published: false,
    views: 10,
    createdAt: new Date(),
    updatedAt: new Date(),
    authorId: 'user-123',
    author: {
      id: 'user-123',
      email: 'admin@example.com',
      name: 'Admin User',
    },
  }

  const updateData = {
    title: 'Updated Title',
    content: 'Updated content',
    excerpt: 'Updated excerpt',
    featuredImage: 'https://example.com/new-image.jpg',
    published: true,
    tags: ['tag1', 'tag2'],
    categories: ['category1'],
  }

  const mockUpdatedPost = {
    ...mockPost,
    ...updateData,
    slug: 'updated-title',
    tags: [
      { id: 'tag-1', name: 'tag1', slug: 'tag1' },
      { id: 'tag-2', name: 'tag2', slug: 'tag2' },
    ],
    categories: [{ id: 'cat-1', name: 'category1', slug: 'category1' }],
  }

  it('should update a post successfully when user is admin', async () => {
    mockRequireAdmin.mockResolvedValue(mockSession)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    mockPrismaPostFindUnique.mockResolvedValue(mockPost as any)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    mockPrismaPostUpdate.mockResolvedValue(mockUpdatedPost as any)

    const request = createMockRequest(updateData)
    const response = await PUT(request, { params: mockParams })
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.title).toBe('Updated Title')
    expect(data.slug).toBe('updated-title')
    expect(mockRequireAdmin).toHaveBeenCalledTimes(1)
    expect(mockPrismaPostFindUnique).toHaveBeenCalledWith({
      where: { id: 'post-123' },
      include: { author: true },
    })
    // Should be called twice: first to clear tags/categories, then to update
    expect(mockPrismaPostUpdate).toHaveBeenCalledTimes(2)
  })

  it('should return 401 when user is not authenticated', async () => {
    mockRequireAdmin.mockRejectedValue(new UnauthorizedError())

    const request = createMockRequest(updateData)
    const response = await PUT(request, { params: mockParams })
    const data = await response.json()

    expect(response.status).toBe(401)
    expect(data.error.code).toBe(ErrorCode.UNAUTHORIZED)
    expect(data.error.message).toBeDefined()
    expect(mockPrismaPostFindUnique).not.toHaveBeenCalled()
    expect(mockPrismaPostUpdate).not.toHaveBeenCalled()
  })

  it('should return 403 when user is not admin', async () => {
    mockRequireAdmin.mockRejectedValue(new ForbiddenError('Required role: ADMIN'))

    const request = createMockRequest(updateData)
    const response = await PUT(request, { params: mockParams })
    const data = await response.json()

    expect(response.status).toBe(403)
    expect(data.error.code).toBe(ErrorCode.FORBIDDEN)
    expect(data.error.message).toBeDefined()
    expect(mockPrismaPostFindUnique).not.toHaveBeenCalled()
    expect(mockPrismaPostUpdate).not.toHaveBeenCalled()
  })

  it('should return 404 when post is not found', async () => {
    mockRequireAdmin.mockResolvedValue(mockSession)
    mockPrismaPostFindUnique.mockResolvedValue(null)

    const request = createMockRequest(updateData)
    const response = await PUT(request, { params: mockParams })
    const data = await response.json()

    expect(response.status).toBe(404)
    expect(data.error.code).toBe(ErrorCode.POST_NOT_FOUND)
    expect(data.error.message).toBeDefined()
    expect(mockPrismaPostUpdate).not.toHaveBeenCalled()
  })

  it('should return 500 when database operation fails', async () => {
    mockRequireAdmin.mockResolvedValue(mockSession)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    mockPrismaPostFindUnique.mockResolvedValue(mockPost as any)
    mockPrismaPostUpdate.mockRejectedValue(new Error('Database error'))

    const request = createMockRequest(updateData)
    const response = await PUT(request, { params: mockParams })
    const data = await response.json()

    expect(response.status).toBe(500)
    expect(data.error.code).toBe(ErrorCode.INTERNAL_ERROR)
    expect(data.error.message).toBeDefined()
  })

  it('should clear existing tags and categories before updating', async () => {
    mockRequireAdmin.mockResolvedValue(mockSession)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    mockPrismaPostFindUnique.mockResolvedValue(mockPost as any)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    mockPrismaPostUpdate.mockResolvedValue(mockUpdatedPost as any)

    const request = createMockRequest(updateData)
    await PUT(request, { params: mockParams })

    // First call should clear tags and categories
    expect(mockPrismaPostUpdate).toHaveBeenNthCalledWith(1, {
      where: { id: 'post-123' },
      data: {
        tags: { set: [] },
        categories: { set: [] },
      },
    })

    // Second call should update with new data
    expect(mockPrismaPostUpdate).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({
        where: { id: 'post-123' },
        data: expect.objectContaining({
          title: 'Updated Title',
        }),
      })
    )
  })
})

describe('DELETE /api/posts/[id]', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  const createMockRequest = () => {
    return {
      nextUrl: {
        searchParams: new URLSearchParams(),
      },
    } as unknown as NextRequest
  }

  const mockParams = Promise.resolve({ id: 'post-123' })

  const mockSession = {
    user: {
      id: 'user-123',
      email: 'admin@example.com',
      name: 'Admin User',
      role: Role.ADMIN,
    },
    expires: '2024-12-31',
  }

  const mockPost = {
    id: 'post-123',
    title: 'Test Post',
    slug: 'test-post',
    content: 'Content',
    excerpt: 'Excerpt',
    featuredImage: null,
    published: true,
    views: 10,
    createdAt: new Date(),
    updatedAt: new Date(),
    authorId: 'user-123',
    author: {
      id: 'user-123',
      email: 'admin@example.com',
      name: 'Admin User',
    },
  }

  it('should delete a post successfully when user is admin', async () => {
    mockRequireAdmin.mockResolvedValue(mockSession)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    mockPrismaPostFindUnique.mockResolvedValue(mockPost as any)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    mockPrismaPostDelete.mockResolvedValue(mockPost as any)

    const request = createMockRequest()
    const response = await DELETE(request, { params: mockParams })
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.message).toBeDefined()
    expect(mockRequireAdmin).toHaveBeenCalledTimes(1)
    expect(mockPrismaPostFindUnique).toHaveBeenCalledWith({
      where: { id: 'post-123' },
      include: { author: true },
    })
    expect(mockPrismaPostDelete).toHaveBeenCalledWith({
      where: { id: 'post-123' },
    })
  })

  it('should return 401 when user is not authenticated', async () => {
    mockRequireAdmin.mockRejectedValue(new UnauthorizedError())

    const request = createMockRequest()
    const response = await DELETE(request, { params: mockParams })
    const data = await response.json()

    expect(response.status).toBe(401)
    expect(data.error.code).toBe(ErrorCode.UNAUTHORIZED)
    expect(data.error.message).toBeDefined()
    expect(mockPrismaPostFindUnique).not.toHaveBeenCalled()
    expect(mockPrismaPostDelete).not.toHaveBeenCalled()
  })

  it('should return 403 when user is not admin', async () => {
    mockRequireAdmin.mockRejectedValue(new ForbiddenError('Required role: ADMIN'))

    const request = createMockRequest()
    const response = await DELETE(request, { params: mockParams })
    const data = await response.json()

    expect(response.status).toBe(403)
    expect(data.error.code).toBe(ErrorCode.FORBIDDEN)
    expect(data.error.message).toBeDefined()
    expect(mockPrismaPostFindUnique).not.toHaveBeenCalled()
    expect(mockPrismaPostDelete).not.toHaveBeenCalled()
  })

  it('should return 404 when post is not found', async () => {
    mockRequireAdmin.mockResolvedValue(mockSession)
    mockPrismaPostFindUnique.mockResolvedValue(null)

    const request = createMockRequest()
    const response = await DELETE(request, { params: mockParams })
    const data = await response.json()

    expect(response.status).toBe(404)
    expect(data.error.code).toBe(ErrorCode.POST_NOT_FOUND)
    expect(data.error.message).toBeDefined()
    expect(mockPrismaPostDelete).not.toHaveBeenCalled()
  })

  it('should return 500 when database operation fails', async () => {
    mockRequireAdmin.mockResolvedValue(mockSession)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    mockPrismaPostFindUnique.mockResolvedValue(mockPost as any)
    mockPrismaPostDelete.mockRejectedValue(new Error('Database error'))

    const request = createMockRequest()
    const response = await DELETE(request, { params: mockParams })
    const data = await response.json()

    expect(response.status).toBe(500)
    expect(data.error.code).toBe(ErrorCode.INTERNAL_ERROR)
    expect(data.error.message).toBeDefined()
  })
})
