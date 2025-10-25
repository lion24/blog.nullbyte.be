import { GET } from '../route'
import { prisma } from '@/lib/prisma'

// Mock Prisma client
jest.mock('@/lib/prisma', () => ({
  prisma: {
    tag: {
      findMany: jest.fn(),
    },
  },
}))

// Mock NextResponse
jest.mock('next/server', () => ({
  NextResponse: {
    json: jest.fn((data, init) => ({
      json: async () => data,
      status: init?.status || 200,
    })),
  },
}))

describe('GET /api/tags', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should return formatted tags with post counts', async () => {
    // Mock data
    const mockTags = [
      {
        id: '1',
        name: 'JavaScript',
        slug: 'javascript',
        createdAt: new Date(),
        updatedAt: new Date(),
        _count: {
          posts: 5,
        },
      },
      {
        id: '2',
        name: 'TypeScript',
        slug: 'typescript',
        createdAt: new Date(),
        updatedAt: new Date(),
        _count: {
          posts: 3,
        },
      },
    ]

    // Setup mock
    ;(prisma.tag.findMany as jest.Mock).mockResolvedValue(mockTags)

    // Call the API
    const response = await GET()
    const data = await response.json()

    // Assertions
    expect(prisma.tag.findMany).toHaveBeenCalledWith({
      orderBy: { name: 'asc' },
      include: {
        _count: {
          select: {
            posts: {
              where: {
                published: true,
              },
            },
          },
        },
      },
    })

    expect(data).toEqual([
      {
        id: '1',
        name: 'JavaScript',
        slug: 'javascript',
        postCount: 5,
      },
      {
        id: '2',
        name: 'TypeScript',
        slug: 'typescript',
        postCount: 3,
      },
    ])
  })

  it('should return empty array when no tags exist', async () => {
    // Setup mock
    ;(prisma.tag.findMany as jest.Mock).mockResolvedValue([])

    // Call the API
    const response = await GET()
    const data = await response.json()

    // Assertions
    expect(data).toEqual([])
  })

  it('should return 500 error when database fails', async () => {
    // Setup mock to throw error
    const dbError = new Error('Database connection failed')
    ;(prisma.tag.findMany as jest.Mock).mockRejectedValue(dbError)

    // Spy on console.error
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation()

    // Call the API
    const response = await GET()

    // Assertions
    expect(response.status).toBe(500)
    expect(consoleSpy).toHaveBeenCalledWith('Error fetching tags:', dbError)

    consoleSpy.mockRestore()
  })

  it('should order tags alphabetically by name', async () => {
    const mockTags = [
      {
        id: '1',
        name: 'Zebra',
        slug: 'zebra',
        createdAt: new Date(),
        updatedAt: new Date(),
        _count: { posts: 1 },
      },
      {
        id: '2',
        name: 'Apple',
        slug: 'apple',
        createdAt: new Date(),
        updatedAt: new Date(),
        _count: { posts: 2 },
      },
    ]

    ;(prisma.tag.findMany as jest.Mock).mockResolvedValue(mockTags)

    await GET()

    expect(prisma.tag.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        orderBy: { name: 'asc' },
      })
    )
  })

  it('should only count published posts', async () => {
    await GET()

    expect(prisma.tag.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        include: {
          _count: {
            select: {
              posts: {
                where: {
                  published: true,
                },
              },
            },
          },
        },
      })
    )
  })
})
