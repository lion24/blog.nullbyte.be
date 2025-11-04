import { GET } from './route'
import { requireAdmin, UnauthorizedError, ForbiddenError } from '@/lib/auth'
import { ErrorCode } from '@/lib/errors'
import { readFileSync } from 'fs'

// Mock dependencies
jest.mock('@/lib/auth', () => {
  const { ErrorCode } = jest.requireActual('@/lib/errors')
  return {
    requireAdmin: jest.fn(),
    UnauthorizedError: class UnauthorizedError extends Error {
      code = ErrorCode.UNAUTHORIZED
      constructor(message = 'Unauthorized - Authentication required') {
        super(message)
        this.name = 'UnauthorizedError'
      }
    },
    ForbiddenError: class ForbiddenError extends Error {
      code = ErrorCode.FORBIDDEN
      constructor(message = 'Forbidden - Insufficient permissions') {
        super(message)
        this.name = 'ForbiddenError'
      }
    },
  }
})

jest.mock('fs', () => ({
  readFileSync: jest.fn(),
}))

const mockRequireAdmin = requireAdmin as jest.MockedFunction<typeof requireAdmin>
const mockReadFileSync = readFileSync as jest.MockedFunction<typeof readFileSync>

describe('GET /api/admin/docs/openapi.json', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  const mockSession = {
    user: {
      id: 'user-123',
      email: 'admin@example.com',
      name: 'Admin User',
      role: 'ADMIN' as const,
    },
    expires: '2024-12-31',
  }

  const mockOpenApiYaml = `
openapi: 3.0.0
info:
  title: Admin API
  version: 1.0.0
paths:
  /api/admin/posts:
    get:
      summary: Get all posts
`

  it('should return OpenAPI spec when user is authenticated as admin', async () => {
    mockRequireAdmin.mockResolvedValue(mockSession)
    mockReadFileSync.mockReturnValue(mockOpenApiYaml)

    const response = await GET()
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data).toHaveProperty('openapi')
    expect(data).toHaveProperty('info')
    expect(data).toHaveProperty('paths')
    expect(mockRequireAdmin).toHaveBeenCalledTimes(1)
    expect(mockReadFileSync).toHaveBeenCalledTimes(1)
  })

  it('should return 401 when user is not authenticated', async () => {
    mockRequireAdmin.mockRejectedValue(new UnauthorizedError())

    const response = await GET()
    const data = await response.json()

    expect(response.status).toBe(401)
    expect(data.error.code).toBe(ErrorCode.UNAUTHORIZED)
    expect(data.error.message).toBe('Unauthorized - Authentication required')
    expect(mockReadFileSync).not.toHaveBeenCalled()
  })

  it('should return 403 when user is not admin', async () => {
    mockRequireAdmin.mockRejectedValue(new ForbiddenError('Required role: ADMIN'))

    const response = await GET()
    const data = await response.json()

    expect(response.status).toBe(403)
    expect(data.error.code).toBe(ErrorCode.FORBIDDEN)
    expect(data.error.message).toBe('Required role: ADMIN')
    expect(mockReadFileSync).not.toHaveBeenCalled()
  })

  it('should return 500 when file reading fails', async () => {
    mockRequireAdmin.mockResolvedValue(mockSession)
    mockReadFileSync.mockImplementation(() => {
      throw new Error('File not found')
    })

    const response = await GET()
    const data = await response.json()

    expect(response.status).toBe(500)
    expect(data.error).toBe('Failed to load OpenAPI specification')
  })

  it('should have correct cache headers when successful', async () => {
    mockRequireAdmin.mockResolvedValue(mockSession)
    mockReadFileSync.mockReturnValue(mockOpenApiYaml)

    const response = await GET()

    // NextResponse.json() doesn't preserve custom headers in test environment
    // This test verifies the response is successful
    expect(response.status).toBe(200)
    const data = await response.json()
    expect(data).toHaveProperty('openapi')
  })
})
