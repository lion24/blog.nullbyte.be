import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { calculateReadingTime } from '@/lib/reading-time'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params
    
    if (!slug) {
      return NextResponse.json({ error: 'Slug is required' }, { status: 400 })
    }

    const post = await prisma.post.findUnique({
      where: { slug },
      include: {
        author: true,
        tags: true,
        categories: true,
      },
    })

    if (!post || !post.published) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 })
    }

    // Increment view count asynchronously (non-blocking)
    prisma.post.update({
      where: { id: post.id },
      data: { views: post.views + 1 },
    }).catch(err => console.error('Failed to update view count:', err))

    return NextResponse.json({
      ...post,
      views: post.views + 1, // Return updated view count
      readingTime: calculateReadingTime(post.content),
    })
  } catch (error) {
    console.error('Error fetching post:', error)
    return NextResponse.json({ error: 'Failed to fetch post' }, { status: 500 })
  }
}