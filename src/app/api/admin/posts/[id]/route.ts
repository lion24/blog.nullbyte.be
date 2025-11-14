import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdmin, UnauthorizedError, ForbiddenError } from '@/lib/auth'
import { ErrorCode, createErrorResponse } from '@/lib/errors'
import { generateUniqueSlug, slugify } from '@/lib/slug'

/**
 * GET /api/admin/posts/[id]
 * Get a single post by ID - requires admin authentication
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Require admin authentication
    await requireAdmin()

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
      return NextResponse.json(
        createErrorResponse(ErrorCode.POST_NOT_FOUND, 'Post not found'),
        { status: 404 }
      )
    }

    return NextResponse.json(post)
  } catch (error) {
    // Handle authentication/authorization errors
    if (error instanceof UnauthorizedError) {
      return NextResponse.json(
        createErrorResponse(error.code, error.message),
        { status: 401 }
      )
    }
    if (error instanceof ForbiddenError) {
      return NextResponse.json(
        createErrorResponse(error.code, error.message),
        { status: 403 }
      )
    }

    return NextResponse.json(
      createErrorResponse(ErrorCode.INTERNAL_ERROR, 'Failed to fetch post'),
      { status: 500 }
    )
  }
}

/**
 * PUT /api/admin/posts/[id]
 * Update a post - requires admin authentication
 */
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
      return NextResponse.json(
        createErrorResponse(ErrorCode.POST_NOT_FOUND, 'Post not found'),
        { status: 404 }
      )
    }

    const body = await request.json()
    const { title, content, excerpt, featuredImage, published, tags, categories } = body

    // Generate unique slug from title (exclude current post from uniqueness check)
    const slug = await generateUniqueSlug(title, id)

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
        updatedAt: new Date(), // Manually set updatedAt on content changes
        tags: {
          connectOrCreate: tags?.map((tag: string) => ({
            where: { slug: slugify(tag) },  // Use slug for lookup (case-insensitive)
            create: {
              name: tag,
              slug: slugify(tag)
            }
          })) ?? []
        },
        categories: {
          connectOrCreate: categories?.map((category: string) => ({
            where: { slug: slugify(category) },  // Use slug for lookup (case-insensitive)
            create: {
              name: category,
              slug: slugify(category)
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
      return NextResponse.json(
        createErrorResponse(error.code, error.message),
        { status: 401 }
      )
    }
    if (error instanceof ForbiddenError) {
      return NextResponse.json(
        createErrorResponse(error.code, error.message),
        { status: 403 }
      )
    }

    console.error('Error updating post:', error)
    return NextResponse.json(
      createErrorResponse(ErrorCode.INTERNAL_ERROR, 'Failed to update post'),
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/admin/posts/[id]
 * Delete a post - requires admin authentication
 */
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
      return NextResponse.json(
        createErrorResponse(ErrorCode.POST_NOT_FOUND, 'Post not found'),
        { status: 404 }
      )
    }

    await prisma.post.delete({
      where: { id }
    })

    return NextResponse.json({ message: 'Post deleted successfully' })
  } catch (error) {
    // Handle authentication/authorization errors
    if (error instanceof UnauthorizedError) {
      return NextResponse.json(
        createErrorResponse(error.code, error.message),
        { status: 401 }
      )
    }
    if (error instanceof ForbiddenError) {
      return NextResponse.json(
        createErrorResponse(error.code, error.message),
        { status: 403 }
      )
    }

    console.error('Error deleting post:', error)
    return NextResponse.json(
      createErrorResponse(ErrorCode.INTERNAL_ERROR, 'Failed to delete post'),
      { status: 500 }
    )
  }
}
