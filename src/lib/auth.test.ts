import { getServerSession } from 'next-auth'
import { Role } from '@prisma/client'
import { requireAuth, requireRole, requireAdmin, isAdmin, UnauthorizedError, ForbiddenError } from './auth'
import { ErrorCode } from './errors'

// Mock next-auth
jest.mock('next-auth', () => ({
  getServerSession: jest.fn(),
}))

const mockGetServerSession = getServerSession as jest.MockedFunction<typeof getServerSession>

describe('Auth Utilities', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('UnauthorizedError', () => {
    it('should create error with correct code and default message', () => {
      const error = new UnauthorizedError()
      expect(error.code).toBe(ErrorCode.UNAUTHORIZED)
      expect(error.message).toBeDefined()
    })

    it('should create error with custom message', () => {
      const error = new UnauthorizedError('Custom message')
      expect(error.name).toBe('UnauthorizedError')
      expect(error.code).toBe(ErrorCode.UNAUTHORIZED)
      expect(error.message).toBe('Custom message')
    })
  })

  describe('ForbiddenError', () => {
    it('should create error with correct code and default message', () => {
      const error = new ForbiddenError()
      expect(error.code).toBe(ErrorCode.FORBIDDEN)
      expect(error.message).toBeDefined()
    })

    it('should create error with custom message', () => {
      const error = new ForbiddenError('Custom message')
      expect(error.name).toBe('ForbiddenError')
      expect(error.code).toBe(ErrorCode.FORBIDDEN)
      expect(error.message).toBe('Custom message')
    })
  })

  describe('requireAuth', () => {
    it('should return session when user is authenticated', async () => {
      const mockSession = {
        user: {
          email: 'test@example.com',
          name: 'Test User',
          role: Role.READER,
        },
        expires: '2024-12-31',
      }

      mockGetServerSession.mockResolvedValue(mockSession)

      const result = await requireAuth()
      expect(result).toEqual(mockSession)
    })

    it('should throw UnauthorizedError when session is null', async () => {
      mockGetServerSession.mockResolvedValue(null)

      const error = await requireAuth().catch(e => e)
      expect(error).toBeInstanceOf(UnauthorizedError)
      expect(error.code).toBe(ErrorCode.UNAUTHORIZED)
      expect(error.message).toBeDefined()
    })

    it('should throw UnauthorizedError when user email is missing', async () => {
      const mockSession = {
        user: {
          name: 'Test User',
        },
        expires: '2024-12-31',
      }

      mockGetServerSession.mockResolvedValue(mockSession as any)

      await expect(requireAuth()).rejects.toThrow(UnauthorizedError)
    })
  })

  describe('requireRole', () => {
    it('should return session when user has required role', async () => {
      const mockSession = {
        user: {
          email: 'admin@example.com',
          name: 'Admin User',
          role: Role.ADMIN,
        },
        expires: '2024-12-31',
      }

      mockGetServerSession.mockResolvedValue(mockSession)

      const result = await requireRole([Role.ADMIN])
      expect(result).toEqual(mockSession)
    })

    it('should return session when user has one of multiple required roles', async () => {
      const mockSession = {
        user: {
          email: 'reader@example.com',
          name: 'Reader User',
          role: Role.READER,
        },
        expires: '2024-12-31',
      }

      mockGetServerSession.mockResolvedValue(mockSession)

      const result = await requireRole([Role.ADMIN, Role.READER])
      expect(result).toEqual(mockSession)
    })

    it('should throw UnauthorizedError when session is null', async () => {
      mockGetServerSession.mockResolvedValue(null)

      await expect(requireRole([Role.ADMIN])).rejects.toThrow(UnauthorizedError)
    })

    it('should throw ForbiddenError when user does not have required role', async () => {
      const mockSession = {
        user: {
          email: 'reader@example.com',
          name: 'Reader User',
          role: Role.READER,
        },
        expires: '2024-12-31',
      }

      mockGetServerSession.mockResolvedValue(mockSession)

      const error = await requireRole([Role.ADMIN]).catch(e => e)
      expect(error).toBeInstanceOf(ForbiddenError)
      expect(error.code).toBe(ErrorCode.FORBIDDEN)
      expect(error.message).toBeDefined()
    })

    it('should include multiple roles in error message', async () => {
      const mockSession = {
        user: {
          email: 'user@example.com',
          name: 'User',
          role: 'OTHER_ROLE' as Role,
        },
        expires: '2024-12-31',
      }

      mockGetServerSession.mockResolvedValue(mockSession)

      const error = await requireRole([Role.ADMIN, Role.READER]).catch(e => e)
      expect(error).toBeInstanceOf(ForbiddenError)
      expect(error.code).toBe(ErrorCode.FORBIDDEN)
      expect(error.message).toContain('ADMIN')
      expect(error.message).toContain('READER')
    })
  })

  describe('requireAdmin', () => {
    it('should return session when user is admin', async () => {
      const mockSession = {
        user: {
          email: 'admin@example.com',
          name: 'Admin User',
          role: Role.ADMIN,
        },
        expires: '2024-12-31',
      }

      mockGetServerSession.mockResolvedValue(mockSession)

      const result = await requireAdmin()
      expect(result).toEqual(mockSession)
    })

    it('should throw UnauthorizedError when session is null', async () => {
      mockGetServerSession.mockResolvedValue(null)

      await expect(requireAdmin()).rejects.toThrow(UnauthorizedError)
    })

    it('should throw ForbiddenError when user is not admin', async () => {
      const mockSession = {
        user: {
          email: 'reader@example.com',
          name: 'Reader User',
          role: Role.READER,
        },
        expires: '2024-12-31',
      }

      mockGetServerSession.mockResolvedValue(mockSession)

      const error = await requireAdmin().catch(e => e)
      expect(error).toBeInstanceOf(ForbiddenError)
      expect(error.code).toBe(ErrorCode.FORBIDDEN)
      expect(error.message).toBeDefined()
    })
  })

  describe('isAdmin', () => {
    it('should return true for admin role', () => {
      expect(isAdmin(Role.ADMIN)).toBe(true)
    })

    it('should return false for non-admin role', () => {
      expect(isAdmin(Role.READER)).toBe(false)
    })

    it('should return false for undefined', () => {
      expect(isAdmin(undefined)).toBe(false)
    })
  })
})
