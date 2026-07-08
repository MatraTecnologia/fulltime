"use client"

import { useSession } from "@/lib/auth-client"

export const useCurrentUser = () => {
  const { data, isPending } = useSession()
  const user = data?.user

  return {
    isPending,
    user: user
      ? {
          name: user.name,
          email: user.email,
          avatarUrl: user.image ?? null,
          role: (user as { role?: string }).role ?? "instrutor",
        }
      : null,
  }
}
