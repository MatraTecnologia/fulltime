import { randomBytes } from 'node:crypto'

const BASE32_ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567'

export const generateCertificateCode = (): string => {
  const bytes = randomBytes(5)
  let n = BigInt('0x' + bytes.toString('hex'))
  let suffix = ''
  for (let i = 0; i < 8; i++) {
    suffix = BASE32_ALPHABET[Number(n & 31n)] + suffix
    n >>= 5n
  }
  return `FT-${suffix}`
}
