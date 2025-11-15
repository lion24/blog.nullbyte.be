import { prisma } from '@/lib/prisma'

/**
 * Generates a URL-friendly slug from a string
 * Properly handles accented characters by transliterating them to ASCII equivalents
 * @param text The text to convert to a slug
 * @returns A slugified version of the text
 */
export function slugify(text: string): string {
  // Map of accented characters to their ASCII equivalents
  const charMap: Record<string, string> = {
    // Lowercase
    'à': 'a', 'á': 'a', 'â': 'a', 'ã': 'a', 'ä': 'a', 'å': 'a', 'æ': 'ae',
    'ç': 'c',
    'è': 'e', 'é': 'e', 'ê': 'e', 'ë': 'e',
    'ì': 'i', 'í': 'i', 'î': 'i', 'ï': 'i',
    'ñ': 'n',
    'ò': 'o', 'ó': 'o', 'ô': 'o', 'õ': 'o', 'ö': 'o', 'ø': 'o', 'œ': 'oe',
    'ù': 'u', 'ú': 'u', 'û': 'u', 'ü': 'u',
    'ý': 'y', 'ÿ': 'y',
    // Uppercase (will be lowercased later)
    'À': 'A', 'Á': 'A', 'Â': 'A', 'Ã': 'A', 'Ä': 'A', 'Å': 'A', 'Æ': 'AE',
    'Ç': 'C',
    'È': 'E', 'É': 'E', 'Ê': 'E', 'Ë': 'E',
    'Ì': 'I', 'Í': 'I', 'Î': 'I', 'Ï': 'I',
    'Ñ': 'N',
    'Ò': 'O', 'Ó': 'O', 'Ô': 'O', 'Õ': 'O', 'Ö': 'O', 'Ø': 'O', 'Œ': 'OE',
    'Ù': 'U', 'Ú': 'U', 'Û': 'U', 'Ü': 'U',
    'Ý': 'Y', 'Ÿ': 'Y',
  }

  // Replace accented characters with ASCII equivalents
  let result = text
  for (const [accented, ascii] of Object.entries(charMap)) {
    result = result.replace(new RegExp(accented, 'g'), ascii)
  }

  // Convert to lowercase, replace non-alphanumeric with hyphens, remove leading/trailing hyphens
  return result
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
