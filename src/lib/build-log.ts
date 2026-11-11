/**
 * Shared rules of the "Build Log" world (home page, article page).
 * Keeping them in one place guarantees a topic has the same rail colour and a
 * post the same subject wherever it appears.
 */

/** The four busiest tags get their own lane; every other tag folds into lane 4. */
export const TOPIC_LANES = 4
export const OTHER_LANE = 4

type TaggedPost = {
  title: string
  createdAt: string
  tags: Array<{ id?: string; name: string; slug: string }>
}

export type TopicStat = { lane: number; slug: string; name: string; count: number; latest: string }

/** Short display id derived from the post id (FNV-1a). Not a git commit hash. */
export function shortId(id: string): string {
  let h = 0x811c9dc5
  for (let i = 0; i < id.length; i++) {
    h ^= id.charCodeAt(i)
    h = Math.imul(h, 0x01000193)
  }
  return (h >>> 0).toString(16).padStart(8, '0').slice(0, 7)
}

export const isoDate = (iso: string) => iso.slice(0, 10)

/** Rank tags by post count (ties: most recently used first) and assign lanes 0–3 to the top four. */
export function rankTopics(posts: TaggedPost[]) {
  const stats = new Map<string, TopicStat>()
  for (const post of posts) {
    for (const tag of post.tags) {
      const s = stats.get(tag.slug)
      if (s) {
        s.count++
        if (post.createdAt > s.latest) s.latest = post.createdAt
      } else {
        stats.set(tag.slug, { lane: OTHER_LANE, slug: tag.slug, name: tag.name, count: 1, latest: post.createdAt })
      }
    }
  }
  const topics = [...stats.values()]
    .sort((a, b) => b.count - a.count || b.latest.localeCompare(a.latest))
    .slice(0, TOPIC_LANES)
  topics.forEach((t, i) => (t.lane = i))
  const laneOf = new Map(topics.map((t) => [t.slug, t.lane]))
  return { topics, laneOf, stats }
}

/**
 * The post's own subject: a tag named in its title wins; otherwise its most
 * specific (least-used) topic tag; otherwise its first tag.
 */
export function subjectOf<T extends TaggedPost>(
  post: T,
  laneOf: Map<string, number>,
  stats: Map<string, TopicStat>,
) {
  const title = post.title.toLowerCase()
  const named = post.tags.find((tag) => title.includes(tag.name.toLowerCase()))
  const topical = post.tags
    .filter((tag) => laneOf.has(tag.slug))
    .sort((a, b) => (stats.get(a.slug)?.count ?? 0) - (stats.get(b.slug)?.count ?? 0))[0]
  const tag = named ?? topical ?? post.tags[0]
  return { tag, lane: tag ? laneOf.get(tag.slug) ?? OTHER_LANE : OTHER_LANE }
}
