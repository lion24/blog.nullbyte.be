import 'server-only'

/**
 * Get the base URL for the application
 *
 * **Server-only function** - This function accesses process.env and must only be used
 * in server contexts (Server Components, generateMetadata, API routes, etc.)
 *
 * Handles different environments:
 * - Vercel: Uses VERCEL_URL (available at runtime)
 * - Custom: Uses NEXTAUTH_URL if set
 * - Development: Falls back to localhost:3000
 *
 * @returns The base URL for the application
 */
export function getBaseUrl(): string {
  // VERCEL_URL is only available at runtime on Vercel, not at build time
  const vercelUrl = process.env.VERCEL_URL

  if (vercelUrl) {
    return `https://${vercelUrl}`
  }

  if (process.env.NEXTAUTH_URL) {
    return process.env.NEXTAUTH_URL
  }

  // Fallback for local development
  return 'http://localhost:3000'
}

/**
 * Construct a full URL from a path
 *
 * **Server-only function** - Must only be used in server contexts
 *
 * @param path - The path to append to the base URL (should start with /)
 * @returns The full absolute URL
 *
 * @example
 * getFullUrl('/posts/my-post') // => 'https://example.com/posts/my-post'
 */
export function getFullUrl(path: string): string {
  const baseUrl = getBaseUrl()
  return `${baseUrl}${path}`
}
