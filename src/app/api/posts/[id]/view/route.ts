import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

/**
 * POST /api/posts/[id]/view
 * Increment the view counter for a published post. Called from the client
 * so the post page itself stays statically cacheable.
 */
export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  if (!id) {
    return NextResponse.json({ error: 'invalid id' }, { status: 400 })
  }
  try {
    await prisma.post.update({
      where: { id, published: true },
      data: { views: { increment: 1 } },
    })
  } catch {
    // Unknown id or unpublished post — silently ignore. The endpoint is best
    // effort and must never block the client.
    return NextResponse.json({ ok: false }, { status: 404 })
  }
  return NextResponse.json({ ok: true })
}
