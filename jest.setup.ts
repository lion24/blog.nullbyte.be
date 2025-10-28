import '@testing-library/jest-dom'

// Mock Next.js Web APIs
if (typeof Request === 'undefined') {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  global.Request = class Request {} as any
}
if (typeof Response === 'undefined') {
  global.Response = class Response {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    static json(data: any, init?: ResponseInit) {
      return {
        json: async () => data,
        status: init?.status || 200,
        headers: new Map(),
      }
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } as any
}
if (typeof Headers === 'undefined') {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  global.Headers = class Headers {} as any
}

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter() {
    return {
      push: jest.fn(),
      replace: jest.fn(),
      prefetch: jest.fn(),
      back: jest.fn(),
      pathname: '/',
      query: {},
      asPath: '/',
    }
  },
  useSearchParams() {
    return new URLSearchParams()
  },
  usePathname() {
    return '/'
  },
  notFound: jest.fn(),
}))

// Mock NextAuth
jest.mock('next-auth/react', () => ({
  useSession: jest.fn(() => ({
    data: null,
    status: 'unauthenticated',
  })),
  signIn: jest.fn(),
  signOut: jest.fn(),
}))

// Mock auth options to avoid loading complex dependencies
jest.mock('@/lib/auth-options')

// Mock NextResponse for API route testing
jest.mock('next/server', () => {
  const actual = jest.requireActual('next/server')
  return {
    ...actual,
    NextResponse: {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      json: (data: any, init?: ResponseInit) => ({
        json: async () => {
          // Return the data as-is (it's already in the correct format from createErrorResponse)
          return data
        },
        status: init?.status || 200,
        headers: new Map(),
      }),
    },
  }
})

// Suppress console errors in tests
global.console = {
  ...console,
  error: jest.fn(),
  warn: jest.fn(),
}
