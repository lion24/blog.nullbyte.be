/**
 * Get the base URL for the application
 * Handles different environments: Vercel, custom NEXTAUTH_URL, or localhost
 */
export function getBaseUrl(): string {
  const vercelUrl = process.env.VERCEL_URL

  if (vercelUrl) {
    return `https://${vercelUrl}`
  }

  if (process.env.NEXTAUTH_URL) {
    return process.env.NEXTAUTH_URL
  }

  return 'http://localhost:3000'
}

/**
 * Construct a full URL from a path
 * @param path - The path to append to the base URL (should start with /)
 */
export function getFullUrl(path: string): string {
  const baseUrl = getBaseUrl()
  return `${baseUrl}${path}`
}
