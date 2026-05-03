import { gravatarUrl } from './gravatar'

describe('gravatarUrl', () => {
  it('produces a stable URL for a given email', () => {
    const url = gravatarUrl('alice@example.com')
    // md5('alice@example.com') => c160f8cc69a4f0bf2b0362752353d060
    expect(url).toBe('https://www.gravatar.com/avatar/c160f8cc69a4f0bf2b0362752353d060?d=identicon&s=200')
  })

  it('lowercases and trims the email before hashing', () => {
    expect(gravatarUrl('  Alice@Example.COM  ')).toBe(gravatarUrl('alice@example.com'))
  })

  it('respects a custom size', () => {
    expect(gravatarUrl('a@b.co', 64)).toMatch(/&s=64$/)
  })

  it('always falls back to identicon when no Gravatar exists', () => {
    expect(gravatarUrl('a@b.co')).toContain('d=identicon')
  })
})
