import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/auth'

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
      include: {
        author: true,
        tags: true,
        categories: true,
      },
    })

    return NextResponse.json(posts)
  } catch {
    return NextResponse.json({ error: 'Failed to fetch posts' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    // Check if user is admin
    const authResult = await requireAdmin()
    if (authResult instanceof NextResponse) {
      return authResult
    }
    const session = authResult
    
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
    console.error('Error creating post:', error)
    return NextResponse.json({ error: 'Failed to create post' }, { status: 500 })
  }
}