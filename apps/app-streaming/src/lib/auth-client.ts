import { createAuthClient } from 'better-auth/react'

export const authClient = createAuthClient({
  baseURL: import.meta.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3333',
  basePath: '/auth',
})

export const { signIn, signUp, signOut, useSession } = authClient
