import 'server-only'

import { prisma } from './prisma'
import { slugify } from './slug'

/**
 * Resolve free-form tag names to existing-or-newly-created Tag IDs.
 *
 * Matching is case-insensitive on `name` AND falls back to `slug`. So:
 * - "JavaScript", "javascript", "JAVASCRIPT" all map to the same tag.
 * - Legacy tags whose `name` and `slug` got out of sync still get reused
 *   instead of tripping a P2002 unique-constraint failure on `name`.
 *
 * Two-step (findFirst → create) instead of connectOrCreate because
 * connectOrCreate's `where` only accepts a single unique field, not the
 * OR predicate this normalization needs.
 */
export async function resolveTagIds(
  names: string[] | undefined
): Promise<{ id: string }[]> {
  if (!names?.length) return []
  const out: { id: string }[] = []
  const seen = new Set<string>()
  for (const raw of names) {
    const name = raw.trim()
    if (!name) continue
    const slug = slugify(name)
    if (!slug || seen.has(slug)) continue
    seen.add(slug)

    const existing = await prisma.tag.findFirst({
      where: {
        OR: [
          { name: { equals: name, mode: 'insensitive' } },
          { slug },
        ],
      },
      select: { id: true },
    })
    if (existing) {
      out.push({ id: existing.id })
    } else {
      const created = await prisma.tag.create({
        data: { name, slug },
        select: { id: true },
      })
      out.push({ id: created.id })
    }
  }
  return out
}

export async function resolveCategoryIds(
  names: string[] | undefined
): Promise<{ id: string }[]> {
  if (!names?.length) return []
  const out: { id: string }[] = []
  const seen = new Set<string>()
  for (const raw of names) {
    const name = raw.trim()
    if (!name) continue
    const slug = slugify(name)
    if (!slug || seen.has(slug)) continue
    seen.add(slug)

    const existing = await prisma.category.findFirst({
      where: {
        OR: [
          { name: { equals: name, mode: 'insensitive' } },
          { slug },
        ],
      },
      select: { id: true },
    })
    if (existing) {
      out.push({ id: existing.id })
    } else {
      const created = await prisma.category.create({
        data: { name, slug },
        select: { id: true },
      })
      out.push({ id: created.id })
    }
  }
  return out
}
