import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params
    
    // First, check if the tag exists
    const tag = await prisma.tag.findUnique({
      where: { slug },
    })
    
    if (!tag) {
      return NextResponse.json({ error: 'Tag not found' }, { status: 404 })
    }
    
    // Get all posts with this tag
    const posts = await prisma.post.findMany({
      where: {
        published: true,
        tags: {
          some: {
            slug: slug
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true
          }
        },
        tags: true,
        categories: true,
      },
    })
    
    return NextResponse.json({
      tag: {
        id: tag.id,
        name: tag.name,
        slug: tag.slug
      },
      posts,
      count: posts.length
    })
  } catch (error) {
    console.error('Error fetching posts by tag:', error)
    return NextResponse.json({ error: 'Failed to fetch posts' }, { status: 500 })
  }
}