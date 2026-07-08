'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from '@/lib/auth-client'
import { PanelShell } from '@/components/panel/panel-shell'
import { Spinner } from '@/components/ui/spinner'
import type { Role } from '@/lib/types'

const ALLOWED_ROLES: Role[] = ['admin', 'instrutor']

const PanelLayout = ({ children }: { children: React.ReactNode }) => {
  const { data, isPending } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (isPending) return
    if (!data) {
      router.replace('/login')
      return
    }
    const role = (data.user as { role?: Role }).role
    if (!role || !ALLOWED_ROLES.includes(role)) router.replace('/dashboard')
  }, [isPending, data, router])

  if (isPending) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Spinner className="size-8 text-blue-600" />
      </div>
    )
  }

  if (!data) return null
  const role = (data.user as { role?: Role }).role
  if (!role || !ALLOWED_ROLES.includes(role)) return null

  const u = data.user as { name: string; email: string; image?: string | null; role?: Role }
  return <PanelShell user={u}>{children}</PanelShell>
}

export default PanelLayout
