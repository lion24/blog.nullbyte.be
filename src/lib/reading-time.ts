/**
 * Calculate estimated reading time for content
 * Based on average reading speed of 200 words per minute
 *
 * @param content - The post content (PlateJS JSON or plain text)
 * @returns Estimated reading time in minutes
 */
export function calculateReadingTime(content: string | object): number {
  let text = ''

  if (typeof content === 'string') {
    // If content is a string, use it directly
    text = content
  } else {
    // If content is PlateJS JSON, extract text from it
    text = extractTextFromPlateJS(content)
  }

  // Remove extra whitespace and count words
  const words = text.trim().split(/\s+/).length

  // Average reading speed: 200 words per minute
  const wordsPerMinute = 200
  const minutes = Math.ceil(words / wordsPerMinute)

  // Minimum 1 minute
  return Math.max(1, minutes)
}

/**
 * PlateJS node types
 */
type PlateNode = string | {
  text?: string
  children?: PlateNode[]
} | PlateNode[]

/**
 * Extract plain text from PlateJS JSON structure
 */
function extractTextFromPlateJS(node: PlateNode): string {
  if (!node) return ''

  // If it's a text node
  if (typeof node === 'string') return node

  // If it's an array, process each item
  if (Array.isArray(node)) {
    return node.map(extractTextFromPlateJS).join(' ')
  }

  // If it's an object with text or children
  if (typeof node === 'object') {
    if (node.text) return node.text
    if (node.children) {
      return extractTextFromPlateJS(node.children)
    }
  }

  return ''
}

/**
 * Word count for post content (PlateJS JSON or plain/Markdown text).
 */
export function countWords(content: string | object): number {
  const text = typeof content === 'string' ? content : extractTextFromPlateJS(content as PlateNode)
  const trimmed = text.trim()
  return trimmed ? trimmed.split(/\s+/).length : 0
}

/**
 * Number of code blocks in post content: `code_block` nodes in PlateJS JSON,
 * or fenced (```) blocks in a Markdown string.
 */
export function countCodeBlocks(content: string | object): number {
  if (typeof content === 'string') {
    const fences = content.match(/^\s*```/gm)
    return fences ? Math.floor(fences.length / 2) : 0
  }
  let count = 0
  const walk = (node: unknown) => {
    if (Array.isArray(node)) {
      node.forEach(walk)
    } else if (node && typeof node === 'object') {
      const n = node as { type?: string; children?: unknown }
      if (n.type === 'code_block') count++
      if (n.children) walk(n.children)
    }
  }
  walk(content)
  return count
}
