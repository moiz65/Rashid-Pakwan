import { randomBytes, randomUUID } from 'crypto'

/** Generic prefixed id (users, products, etc.). */
export function newId(prefix) {
  return `${prefix}_${Date.now()}_${randomUUID().slice(0, 8)}`
}

/** Short codes for the website Track box — easy to read and type (e.g. K7M2XP). */
const TRACK_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'

export function newOrderTrackId(length = 6) {
  const bytes = randomBytes(length)
  let code = ''
  for (let i = 0; i < length; i++) {
    code += TRACK_ALPHABET[bytes[i] % TRACK_ALPHABET.length]
  }
  return code
}
