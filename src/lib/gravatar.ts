import crypto from 'crypto'

const DEFAULT_SIZE = 200

/**
 * Gravatar URL with deterministic identicon fallback.
 * Returns the user's Gravatar if registered, otherwise a stable identicon.
 */
export function gravatarUrl(email: string, size: number = DEFAULT_SIZE): string {
  const hash = crypto.createHash('md5').update(email.trim().toLowerCase()).digest('hex')
  return `https://www.gravatar.com/avatar/${hash}?d=identicon&s=${size}`
}
