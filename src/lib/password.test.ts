import { hashPassword, verifyPassword, isPasswordStrongEnough, MIN_PASSWORD_LENGTH } from './password'

describe('password helpers', () => {
  it('hashes and verifies a password', async () => {
    const hash = await hashPassword('correct horse battery staple')
    expect(hash).not.toContain('correct horse')
    expect(await verifyPassword('correct horse battery staple', hash)).toBe(true)
    expect(await verifyPassword('wrong password', hash)).toBe(false)
  }, 15000)

  it('rejects passwords shorter than the minimum', () => {
    expect(isPasswordStrongEnough('a'.repeat(MIN_PASSWORD_LENGTH - 1))).toBe(false)
    expect(isPasswordStrongEnough('a'.repeat(MIN_PASSWORD_LENGTH))).toBe(true)
  })

  it('rejects non-string inputs', () => {
    expect(isPasswordStrongEnough(undefined as unknown as string)).toBe(false)
  })
})
