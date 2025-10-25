import 'server-only'

/**
 * Get the base URL for the application
 *
 * **Server-only function** - This function accesses process.env and must only be used
 * in server contexts (Server Components, generateMetadata, API routes, etc.)
 *
 * Returns the appropriate URL based on the current environment:
 * - Production: Returns the production URL (custom domain if available)
 * - Preview/Development: Returns the preview deployment URL
 * - Local: Returns localhost
 *
 * Priority:
 * 1. NEXT_PUBLIC_SITE_URL (explicit override for any environment)
 * 2. VERCEL_ENV === 'production' → VERCEL_PROJECT_PRODUCTION_URL (production custom domain)
 * 3. VERCEL_URL (current preview deployment URL)
 * 4. NEXTAUTH_URL (custom deployment)
 * 5. http://localhost:3000 (local development fallback)
 *
 * @returns The base URL for the current environment
 */
export function getBaseUrl(): string {
  // Allow explicit override for any environment
  if (process.env.NEXT_PUBLIC_SITE_URL) {
    return process.env.NEXT_PUBLIC_SITE_URL
  }

  // In production, use the production URL (custom domain or shortest vercel.app domain)
  if (process.env.VERCEL_ENV === 'production') {
    const productionUrl = process.env.VERCEL_PROJECT_PRODUCTION_URL
    if (productionUrl) {
      return `https://${productionUrl}`
    }
  }

  // For preview/development deployments, use the current deployment URL
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
