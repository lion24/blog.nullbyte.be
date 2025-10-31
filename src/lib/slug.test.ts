import { slugify, generateUniqueSlug } from './slug'
import { prisma } from '@/lib/prisma'

// Mock prisma
jest.mock('@/lib/prisma', () => ({
  prisma: {
    post: {
      findUnique: jest.fn(),
    },
  },
}))

describe('slugify', () => {
  it('converts text to lowercase', () => {
    expect(slugify('Hello World')).toBe('hello-world')
  })

  it('replaces spaces with hyphens', () => {
    expect(slugify('my awesome post')).toBe('my-awesome-post')
  })

  it('removes special characters', () => {
    expect(slugify('Hello! @World#')).toBe('hello-world')
  })

  it('removes leading and trailing hyphens', () => {
    expect(slugify('  hello world  ')).toBe('hello-world')
  })

  it('replaces multiple spaces with single hyphen', () => {
    expect(slugify('hello    world')).toBe('hello-world')
  })

  it('handles unicode characters', () => {
    expect(slugify('Café Résumé')).toBe('caf-r-sum')
  })
})

describe('generateUniqueSlug', () => {
  const mockPrismaPost = prisma.post as jest.Mocked<typeof prisma.post>

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('returns base slug when it does not exist', async () => {
    mockPrismaPost.findUnique.mockResolvedValue(null)
    const slug = await generateUniqueSlug('My New Post')
    expect(slug).toBe('my-new-post')
    expect(mockPrismaPost.findUnique).toHaveBeenCalledTimes(1)
  })

  it('appends number when slug exists', async () => {
    mockPrismaPost.findUnique
      .mockResolvedValueOnce({ id: 'existing-id', slug: 'my-post' } satisfies { id: string; slug: string } as never)
      .mockResolvedValueOnce(null)
    
    const slug = await generateUniqueSlug('My Post')
    expect(slug).toBe('my-post-1')
    expect(mockPrismaPost.findUnique).toHaveBeenCalledTimes(2)
  })

  it('increments number until unique slug found', async () => {
    mockPrismaPost.findUnique
      .mockResolvedValueOnce({ id: 'id-1', slug: 'my-post' } satisfies { id: string; slug: string } as never)
      .mockResolvedValueOnce({ id: 'id-2', slug: 'my-post-1' } satisfies { id: string; slug: string } as never)
      .mockResolvedValueOnce({ id: 'id-3', slug: 'my-post-2' } satisfies { id: string; slug: string } as never)
      .mockResolvedValueOnce(null)
    
    const slug = await generateUniqueSlug('My Post')
    expect(slug).toBe('my-post-3')
    expect(mockPrismaPost.findUnique).toHaveBeenCalledTimes(4)
  })

  it('excludes specified post ID from uniqueness check', async () => {
    mockPrismaPost.findUnique
      .mockResolvedValueOnce({ id: 'current-id', slug: 'my-post' } satisfies { id: string; slug: string } as never)
    
    const slug = await generateUniqueSlug('My Post', 'current-id')
    expect(slug).toBe('my-post')
    expect(mockPrismaPost.findUnique).toHaveBeenCalledTimes(1)
  })

  it('continues checking when excluded ID matches but finds another duplicate', async () => {
    mockPrismaPost.findUnique
      .mockResolvedValueOnce({ id: 'current-id', slug: 'my-post' } satisfies { id: string; slug: string } as never)
      .mockResolvedValueOnce({ id: 'other-id', slug: 'my-post-1' } satisfies { id: string; slug: string } as never)
      .mockResolvedValueOnce(null)
    
    const slug = await generateUniqueSlug('My Post', 'current-id')
    expect(slug).toBe('my-post')
    expect(mockPrismaPost.findUnique).toHaveBeenCalledTimes(1)
  })
})
