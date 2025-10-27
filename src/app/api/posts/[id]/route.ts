import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdmin, UnauthorizedError, ForbiddenError } from '@/lib/auth'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const post = await prisma.post.findUnique({
      where: { id },
      include: {
        author: true,
        tags: true,
        categories: true,
      },
    })
    
    if (!post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 })
    }
    
    return NextResponse.json(post)
  } catch {
    return NextResponse.json({ error: 'Failed to fetch post' }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    // Check if user is admin (throws UnauthorizedError or ForbiddenError if not)
    await requireAdmin()

    const post = await prisma.post.findUnique({
      where: { id },
      include: { author: true }
    })

    if (!post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 })
    }

    const body = await request.json()
    const { title, content, excerpt, featuredImage, published, tags, categories } = body

    // Generate slug from title
    const slug = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '')

    // First, disconnect all existing tags and categories
    await prisma.post.update({
      where: { id },
      data: {
        tags: { set: [] },
        categories: { set: [] }
      }
    })

    // Then update with new data
    const updatedPost = await prisma.post.update({
      where: { id },
      data: {
        title,
        slug,
        content,
        excerpt,
        featuredImage: featuredImage || null,
        published,
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

    return NextResponse.json(updatedPost)
  } catch (error) {
    // Handle authentication/authorization errors
    if (error instanceof UnauthorizedError) {
      return NextResponse.json({ error: error.message }, { status: 401 })
    }
    if (error instanceof ForbiddenError) {
      return NextResponse.json({ error: error.message }, { status: 403 })
    }

    console.error('Error updating post:', error)
    return NextResponse.json({ error: 'Failed to update post' }, { status: 500 })
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    // Check if user is admin (throws UnauthorizedError or ForbiddenError if not)
    await requireAdmin()

    const post = await prisma.post.findUnique({
      where: { id },
      include: { author: true }
    })

    if (!post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 })
    }

    await prisma.post.delete({
      where: { id }
    })

    return NextResponse.json({ message: 'Post deleted successfully' })
  } catch (error) {
    // Handle authentication/authorization errors
    if (error instanceof UnauthorizedError) {
      return NextResponse.json({ error: error.message }, { status: 401 })
    }
    if (error instanceof ForbiddenError) {
      return NextResponse.json({ error: error.message }, { status: 403 })
    }

    console.error('Error deleting post:', error)
    return NextResponse.json({ error: 'Failed to delete post' }, { status: 500 })
  }
}