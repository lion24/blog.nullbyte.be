import {
  generateServiceAccountToken,
  verifyServiceAccountToken,
  extractBearerToken,
  isValidTokenFormat,
} from '../service-account-tokens'

describe('service-account-tokens', () => {
  describe('generateServiceAccountToken', () => {
    it('should generate a token with correct prefix', async () => {
      const { token, tokenHash } = await generateServiceAccountToken()
      
      expect(token).toMatch(/^sa_[0-9a-f]{64}$/)
      expect(tokenHash).toBeTruthy()
      expect(tokenHash).not.toBe(token)
    })

    it('should generate unique tokens', async () => {
      const token1 = await generateServiceAccountToken()
      const token2 = await generateServiceAccountToken()
      
      expect(token1.token).not.toBe(token2.token)
      expect(token1.tokenHash).not.toBe(token2.tokenHash)
    })
  })

  describe('verifyServiceAccountToken', () => {
    it('should verify a valid token', async () => {
      const { token, tokenHash } = await generateServiceAccountToken()
      
      const isValid = await verifyServiceAccountToken(token, tokenHash)
      expect(isValid).toBe(true)
    })

    it('should reject an invalid token', async () => {
      const { tokenHash } = await generateServiceAccountToken()
      const wrongToken = 'sa_' + '0'.repeat(64)
      
      const isValid = await verifyServiceAccountToken(wrongToken, tokenHash)
      expect(isValid).toBe(false)
    })

    it('should reject a token with wrong hash', async () => {
      const { token } = await generateServiceAccountToken()
      const { tokenHash: wrongHash } = await generateServiceAccountToken()
      
      const isValid = await verifyServiceAccountToken(token, wrongHash)
      expect(isValid).toBe(false)
    })
  })

  describe('extractBearerToken', () => {
    it('should extract token from valid Bearer header', () => {
      const token = 'sa_' + 'a'.repeat(64)
      const header = `Bearer ${token}`
      
      const extracted = extractBearerToken(header)
      expect(extracted).toBe(token)
    })

    it('should return null for null header', () => {
      const extracted = extractBearerToken(null)
      expect(extracted).toBeNull()
    })

    it('should return null for malformed header', () => {
      expect(extractBearerToken('InvalidHeader')).toBeNull()
      expect(extractBearerToken('Bearer')).toBeNull()
      expect(extractBearerToken('Bearer token1 token2')).toBeNull()
    })

    it('should return null for non-Bearer auth', () => {
      const extracted = extractBearerToken('Basic dXNlcjpwYXNz')
      expect(extracted).toBeNull()
    })

    it('should return null for token without sa_ prefix', () => {
      const header = 'Bearer invalid_token'
      const extracted = extractBearerToken(header)
      expect(extracted).toBeNull()
    })
  })

  describe('isValidTokenFormat', () => {
    it('should accept valid token format', () => {
      const token = 'sa_' + 'a'.repeat(64)
      expect(isValidTokenFormat(token)).toBe(true)
    })

    it('should accept uppercase hex', () => {
      const token = 'sa_' + 'A'.repeat(64)
      expect(isValidTokenFormat(token)).toBe(true)
    })

    it('should accept mixed case hex', () => {
      const token = 'sa_' + 'aAbBcC'.repeat(10) + 'aAbB'
      expect(isValidTokenFormat(token)).toBe(true)
    })

    it('should reject token without prefix', () => {
      const token = 'a'.repeat(64)
      expect(isValidTokenFormat(token)).toBe(false)
    })

    it('should reject token with wrong prefix', () => {
      const token = 'sk_' + 'a'.repeat(64)
      expect(isValidTokenFormat(token)).toBe(false)
    })

    it('should reject token with wrong length', () => {
      expect(isValidTokenFormat('sa_' + 'a'.repeat(32))).toBe(false)
      expect(isValidTokenFormat('sa_' + 'a'.repeat(128))).toBe(false)
    })

    it('should reject token with non-hex characters', () => {
      const token = 'sa_' + 'g'.repeat(64)
      expect(isValidTokenFormat(token)).toBe(false)
    })

    it('should reject empty string', () => {
      expect(isValidTokenFormat('')).toBe(false)
    })
  })
})
