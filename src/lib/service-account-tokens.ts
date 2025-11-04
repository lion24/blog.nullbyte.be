import { randomBytes } from 'crypto'
import bcrypt from 'bcrypt'

const TOKEN_PREFIX = 'sa_'
const TOKEN_LENGTH = 32 // bytes, results in 64 hex characters
const SALT_ROUNDS = 12

export interface GeneratedToken {
  token: string // The plain-text token to give to the user (only shown once)
  tokenHash: string // The hashed version to store in the database
}

/**
 * Generate a new service account token
 * Returns both the plain-text token (to show to user) and hash (to store in DB)
 * 
 * Format: sa_<64_hex_chars>
 * Example: sa_a1b2c3d4e5f6789...
 */
export async function generateServiceAccountToken(): Promise<GeneratedToken> {
  // Generate cryptographically secure random bytes
  const randomBuffer = randomBytes(TOKEN_LENGTH)
  const randomHex = randomBuffer.toString('hex')
  
  // Add prefix for easy identification
  const token = `${TOKEN_PREFIX}${randomHex}`
  
  // Hash the token for storage
  const tokenHash = await bcrypt.hash(token, SALT_ROUNDS)
  
  return {
    token,
    tokenHash,
  }
}

/**
 * Verify a provided token against a stored hash
 * 
 * @param providedToken - The token from the Authorization header
 * @param storedHash - The hash from the database
 * @returns true if the token is valid
 */
export async function verifyServiceAccountToken(
  providedToken: string,
  storedHash: string
): Promise<boolean> {
  try {
    return await bcrypt.compare(providedToken, storedHash)
  } catch (error) {
    console.error('Error verifying service account token:', error)
    return false
  }
}

/**
 * Extract bearer token from Authorization header
 * 
 * @param authHeader - The Authorization header value
 * @returns The token without the "Bearer " prefix, or null if invalid
 */
export function extractBearerToken(authHeader: string | null): string | null {
  if (!authHeader) {
    return null
  }
  
  const parts = authHeader.split(' ')
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    return null
  }
  
  const token = parts[1]
  
  // Validate token format
  if (!token.startsWith(TOKEN_PREFIX)) {
    return null
  }
  
  return token
}

/**
 * Validate token format without checking against database
 * Useful for quick validation before database lookup
 */
export function isValidTokenFormat(token: string): boolean {
  if (!token.startsWith(TOKEN_PREFIX)) {
    return false
  }
  
  // Remove prefix and check if remaining is valid hex of correct length
  const withoutPrefix = token.slice(TOKEN_PREFIX.length)
  const expectedLength = TOKEN_LENGTH * 2 // hex encoding doubles the length
  
  if (withoutPrefix.length !== expectedLength) {
    return false
  }
  
  // Check if it's valid hex
  return /^[0-9a-f]+$/i.test(withoutPrefix)
}
