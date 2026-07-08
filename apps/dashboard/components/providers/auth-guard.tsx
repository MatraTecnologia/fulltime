"use client"

import * as React from "react"
import { usePathname, useRouter } from "next/navigation"
import { Loader2 } from "lucide-react"
import { useSession } from "@/lib/auth-client"
import { Logo } from "@/components/layout/logo"

export const AuthGuard = ({ children }: { children: React.ReactNode }) => {
  const { data: session, isPending } = useSession()
  const router = useRouter()
  const pathname = usePathname()

  React.useEffect(() => {
    if (!isPending && !session) {
      router.replace(`/login?next=${encodeURIComponent(pathname)}`)
    }
  }, [isPending, session, pathname, router])

  if (isPending || !session) {
    return (
      <div className="flex min-h-svh w-full flex-col items-center justify-center gap-5">
        <Logo />
        <Loader2 className="size-6 animate-spin text-primary" />
      </div>
    )
  }

  return <>{children}</>
}
