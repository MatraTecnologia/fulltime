import { createAuthClient } from 'better-auth/react'

export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3333',
  basePath: '/auth',
})

export const { signIn, signUp, signOut } = authClient
export const useSession: typeof authClient.useSession = authClient.useSession
