'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from '@/lib/auth-client'
import type { Role } from '@/lib/types'

export const useAdminOnly = () => {
  const { data, isPending } = useSession()
  const router = useRouter()
  const role = (data?.user as { role?: Role } | undefined)?.role

  useEffect(() => {
    if (isPending) return
    if (role && role !== 'admin') router.replace('/admin/cursos')
  }, [isPending, role, router])

  return { isAllowed: role === 'admin', isPending }
}
