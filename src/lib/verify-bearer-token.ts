import 'server-only'
import { prisma } from './prisma'
import {
  extractBearerToken,
  verifyServiceAccountToken,
  isValidTokenFormat,
} from './service-account-tokens'

export interface ServiceAccountAuth {
  serviceAccountId: string
  name: string
  scopes: string[]
  createdById: string
}

/**
 * Verify a bearer token from the Authorization header
 * Returns service account details if valid, null otherwise
 * 
 * Also updates the lastUsedAt timestamp for the service account
 */
export async function verifyBearerToken(
  authHeader: string | null
): Promise<ServiceAccountAuth | null> {
  // Extract token from header
  const token = extractBearerToken(authHeader)
  if (!token) {
    return null
  }
  
  // Quick format validation before database lookup
  if (!isValidTokenFormat(token)) {
    return null
  }
  
  try {
    // Find all non-revoked service accounts
    // We need to check all of them since we only store hashes
    const serviceAccounts = await prisma.serviceAccount.findMany({
      where: { revoked: false },
      select: {
        id: true,
        name: true,
        tokenHash: true,
        scopes: true,
        createdById: true,
      },
    })
    
    // Check each account's hash
    for (const account of serviceAccounts) {
      const isValid = await verifyServiceAccountToken(token, account.tokenHash)
      
      if (isValid) {
        // Update last used timestamp (fire-and-forget, non-blocking)
        prisma.serviceAccount
          .update({
            where: { id: account.id },
            data: { lastUsedAt: new Date() },
          })
          .catch((error) => {
            console.error('Failed to update service account lastUsedAt:', error)
          })
        
        return {
          serviceAccountId: account.id,
          name: account.name,
          scopes: account.scopes,
          createdById: account.createdById,
        }
      }
    }
    
    // No matching token found
    return null
  } catch (error) {
    console.error('Error verifying bearer token:', error)
    return null
  }
}

/**
 * Check if a service account has a specific scope
 */
export function hasScope(
  serviceAccount: ServiceAccountAuth,
  requiredScope: string
): boolean {
  return serviceAccount.scopes.includes(requiredScope)
}

/**
 * Check if a service account has all of the required scopes
 */
export function hasAllScopes(
  serviceAccount: ServiceAccountAuth,
  requiredScopes: string[]
): boolean {
  return requiredScopes.every((scope) => serviceAccount.scopes.includes(scope))
}

/**
 * Check if a service account has any of the required scopes
 */
export function hasAnyScope(
  serviceAccount: ServiceAccountAuth,
  requiredScopes: string[]
): boolean {
  return requiredScopes.some((scope) => serviceAccount.scopes.includes(scope))
}
