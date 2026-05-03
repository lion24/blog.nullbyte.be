import bcrypt from 'bcrypt'

const SALT_ROUNDS = 12
const MIN_PASSWORD_LENGTH = 8

export function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, SALT_ROUNDS)
}

export function verifyPassword(plain: string, hash: string): Promise<boolean> {
  return bcrypt.compare(plain, hash)
}

export function isPasswordStrongEnough(plain: string): boolean {
  return typeof plain === 'string' && plain.length >= MIN_PASSWORD_LENGTH
}

export { MIN_PASSWORD_LENGTH }
