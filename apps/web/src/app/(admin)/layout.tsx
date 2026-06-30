'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from '@/lib/auth-client'
import { AppShell } from '@/components/app-shell'
import { Spinner } from '@fulltime/ui'
import type { Role } from '@/lib/types'

const ALLOWED_ROLES: Role[] = ['admin', 'instrutor']

const AdminLayout = ({ children }: { children: React.ReactNode }) => {
  const { data, isPending } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (isPending) return
    if (!data) {
      router.replace('/login')
      return
    }
    const role = (data.user as { role?: Role }).role
    if (!role || !ALLOWED_ROLES.includes(role)) {
      router.replace('/dashboard')
    }
  }, [isPending, data, router])

  if (isPending) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Spinner />
      </div>
    )
  }

  if (!data) return null

  const role = (data.user as { role?: Role }).role
  if (!role || !ALLOWED_ROLES.includes(role)) return null

  return <AppShell>{children}</AppShell>
}

export default AdminLayout
