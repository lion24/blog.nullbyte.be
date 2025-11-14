import { prisma } from '@/lib/prisma'

type ViewCounterProps = {
  postId: string
  initialViews: number
}

/**
 * Server-side component that handles view count increment.
 * 
 * This component is responsible for:
 * 1. Incrementing the view count in the database (fire-and-forget)
 * 2. Displaying the current view count
 * 
 * The increment happens asynchronously and won't block page rendering.
 * The displayed count is the value before increment (eventual consistency).
 * 
 * @param postId - The ID of the post to increment views for
 * @param initialViews - The current view count to display
 */
export async function ViewCounter({ postId, initialViews }: ViewCounterProps) {
  // Increment view count atomically (fire-and-forget)
  // This won't update the post's updatedAt timestamp because we removed @updatedAt decorator
  incrementViewCount(postId)

  return (
    <span className="text-sm text-[var(--text-secondary)]">
      {initialViews.toLocaleString()} {initialViews === 1 ? 'view' : 'views'}
    </span>
  )
}

/**
 * Increment the view count for a post atomically.
 * Uses fire-and-forget pattern for non-blocking operation.
 * 
 * @param postId - The ID of the post to increment views for
 */
function incrementViewCount(postId: string) {
  prisma.post
    .update({
      where: { id: postId },
      data: { views: { increment: 1 } },
    })
    .catch(err => console.error('Failed to update view count:', err))
}
