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
 * Format reading time for display
 *
 * @param minutes - Reading time in minutes
 * @returns Formatted string (e.g., "5 min read")
 */
export function formatReadingTime(minutes: number): string {
  return `${minutes} min read`
}
