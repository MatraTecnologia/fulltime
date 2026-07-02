import { randomBytes } from 'node:crypto'

export const generateShareToken = (): string => randomBytes(32).toString('base64url')
