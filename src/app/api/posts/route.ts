import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdmin, UnauthorizedError, ForbiddenError } from '@/lib/auth'
import { calculateReadingTime } from '@/lib/reading-time'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const published = searchParams.get('published')
    const limitParam = searchParams.get('limit')
    const limit = limitParam ? parseInt(limitParam, 10) : undefined

    const posts = await prisma.post.findMany({
      where: published === 'false' ? {} : { published: true },
      orderBy: { createdAt: 'desc' },
      take: limit,
      select: {
        id: true,
        title: true,
        slug: true,
        excerpt: true,
        featuredImage: true,
        published: true,
        createdAt: true,
        updatedAt: true,
        views: true,
        content: true, // Need content to calculate reading time
        author: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
        tags: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
        categories: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
    })

    // Add reading time and remove content before sending response
    const postsWithReadingTime = posts.map(post => {
      const { content, ...postWithoutContent } = post
      return {
        ...postWithoutContent,
        readingTime: calculateReadingTime(content),
      }
    })

    // Return empty array if no posts found (this is valid, not an error)
    return NextResponse.json(postsWithReadingTime || [])
  } catch (error) {
    console.error('Error fetching posts:', error)
    // Return empty array instead of error to prevent homepage from breaking
    // This handles cases where database might not be fully set up yet
    return NextResponse.json([])
  }
}

export async function POST(request: NextRequest) {
  try {
    // Check if user is admin (throws UnauthorizedError or ForbiddenError if not)
    const session = await requireAdmin()

    const user = await prisma.user.findUnique({
      where: { email: session.user.email! }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const body = await request.json()
    const { title, content, excerpt, featuredImage, published, tags, categories } = body

    // Generate slug from title
    const slug = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '')

    const post = await prisma.post.create({
      data: {
        title,
        slug,
        content,
        excerpt,
        featuredImage: featuredImage || null,
        published: published ?? false,
        authorId: user.id,
        tags: {
          connectOrCreate: tags?.map((tag: string) => ({
            where: { name: tag },
            create: {
              name: tag,
              slug: tag.toLowerCase().replace(/[^a-z0-9]+/g, '-')
            }
          })) ?? []
        },
        categories: {
          connectOrCreate: categories?.map((category: string) => ({
            where: { name: category },
            create: {
              name: category,
              slug: category.toLowerCase().replace(/[^a-z0-9]+/g, '-')
            }
          })) ?? []
        }
      },
      include: {
        author: true,
        tags: true,
        categories: true,
      }
    })

    return NextResponse.json(post)
  } catch (error) {
    // Handle authentication/authorization errors
    if (error instanceof UnauthorizedError) {
      return NextResponse.json({ error: error.message }, { status: 401 })
    }
    if (error instanceof ForbiddenError) {
      return NextResponse.json({ error: error.message }, { status: 403 })
    }

    console.error('Error creating post:', error)
    return NextResponse.json({ error: 'Failed to create post' }, { status: 500 })
  }
}
