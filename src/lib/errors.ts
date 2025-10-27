/**
 * Standard error codes for API responses
 * Similar to Go's error types - compare by code, not message
 */
export enum ErrorCode {
  // Authentication errors (401)
  UNAUTHORIZED = 'UNAUTHORIZED',

  // Authorization errors (403)
  FORBIDDEN = 'FORBIDDEN',
  INSUFFICIENT_PERMISSIONS = 'INSUFFICIENT_PERMISSIONS',

  // Resource errors (404)
  NOT_FOUND = 'NOT_FOUND',
  POST_NOT_FOUND = 'POST_NOT_FOUND',
  USER_NOT_FOUND = 'USER_NOT_FOUND',

  // Validation errors (400)
  BAD_REQUEST = 'BAD_REQUEST',
  INVALID_INPUT = 'INVALID_INPUT',
  MISSING_REQUIRED_FIELD = 'MISSING_REQUIRED_FIELD',
  INVALID_ROLE = 'INVALID_ROLE',

  // Server errors (500)
  INTERNAL_ERROR = 'INTERNAL_ERROR',
  DATABASE_ERROR = 'DATABASE_ERROR',
}

/**
 * Standard API error response format
 */
export interface ApiErrorResponse {
  error: {
    code: ErrorCode
    message: string
  }
}

/**
 * Helper to create consistent error responses
 */
export function createErrorResponse(code: ErrorCode, message: string): ApiErrorResponse {
  return {
    error: {
      code,
      message,
    },
  }
}
