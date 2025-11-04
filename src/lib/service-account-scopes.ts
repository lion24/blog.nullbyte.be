/**
 * Available scopes for service accounts
 */
export const AVAILABLE_SCOPES = [
  'posts:read',
  'posts:write',
  'posts:delete',
  'tags:read',
  'tags:write',
  'users:read',
  'admin:full',
] as const

export type ServiceAccountScope = (typeof AVAILABLE_SCOPES)[number]
