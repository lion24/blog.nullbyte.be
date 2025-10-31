import { prisma } from '@/lib/prisma'

/**
 * Generates a URL-friendly slug from a string
 * @param text The text to convert to a slug
 * @returns A slugified version of the text
 */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '')
}

/**
 * Generates a unique slug for a post
 * If the slug already exists, appends a number to make it unique
 * @param title The post title to generate slug from
 * @param excludeId Optional post ID to exclude from uniqueness check (for updates)
 * @returns A unique slug
 */
export async function generateUniqueSlug(
  title: string,
  excludeId?: string
): Promise<string> {
  const baseSlug = slugify(title)
  
  // Ensure slug is unique by checking existing posts
  let slug = baseSlug
  let slugSuffix = 1
  let existingPost = await prisma.post.findUnique({ where: { slug } })
  
  while (existingPost && existingPost.id !== excludeId) {
    slug = `${baseSlug}-${slugSuffix}`
    existingPost = await prisma.post.findUnique({ where: { slug } })
    slugSuffix++
  }
  
  return slug
}
