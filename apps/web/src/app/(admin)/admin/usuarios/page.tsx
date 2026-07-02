'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Search } from 'lucide-react'
import { apiFetch, ApiError } from '@/lib/api'
import type { Role, UserListItem, UserListResponse } from '@/lib/types'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Spinner } from '@/components/ui/spinner'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Empty, EmptyDescription, EmptyHeader, EmptyTitle } from '@/components/ui/empty'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { PageHeader } from '../../_components/page-header'
import { RoleBadge, ROLE_OPTIONS, StatusBadge } from '../../_components/role-badge'
import { UserRowActions } from '../../_components/user-row-actions'
import { UserDetailDrawer } from '../../_components/user-detail-drawer'
import { useAdminOnly } from '../../_components/use-admin-only'

const PAGE_SIZE = 10
const ALL_ROLES = 'all'

const getInitials = (name: string) =>
  name.split(' ').slice(0, 2).map((w) => w[0]).join('').toUpperCase()

const UsuariosPage = () => {
  const router = useRouter()
  const { isAllowed } = useAdminOnly()
  const [q, setQ] = useState('')
  const [debouncedQ, setDebouncedQ] = useState('')
  const [role, setRole] = useState<Role | typeof ALL_ROLES>(ALL_ROLES)
  const [page, setPage] = useState(1)
  const [data, setData] = useState<UserListResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [detailId, setDetailId] = useState<string | null>(null)

  useEffect(() => {
    const id = setTimeout(() => setDebouncedQ(q.trim()), 350)
    return () => clearTimeout(id)
  }, [q])

  useEffect(() => {
    setPage(1)
  }, [debouncedQ, role])

  useEffect(() => {
    if (!isAllowed) return
    const params = new URLSearchParams({ page: String(page), pageSize: String(PAGE_SIZE) })
    if (debouncedQ) params.set('q', debouncedQ)
    if (role !== ALL_ROLES) params.set('role', role)
    setLoading(true)
    apiFetch<UserListResponse>(`/users?${params.toString()}`)
      .then((res) => {
        setData(res)
        setError(null)
      })
      .catch((e) => {
        if (e instanceof ApiError && e.status === 401) router.replace('/login')
        else setError(e instanceof ApiError ? e.message : 'Não foi possível carregar os usuários.')
      })
      .finally(() => setLoading(false))
  }, [isAllowed, debouncedQ, role, page, router])

  const applyUpdate = (updated: Partial<UserListItem> & { id: string }) =>
    setData((prev) =>
      prev
        ? {
            ...prev,
            items: prev.items.map((u) => (u.id === updated.id ? { ...u, ...updated } : u)),
          }
        : prev,
    )

  const totalPages = useMemo(
    () => (data ? Math.max(1, Math.ceil(data.total / data.pageSize)) : 1),
    [data],
  )

  if (!isAllowed) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Spinner className="size-8 text-primary" />
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <PageHeader title="Usuários" description="Gerencie papéis e acesso dos usuários da plataforma." />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Buscar por nome ou e-mail"
            aria-label="Buscar usuários"
            className="pl-9"
          />
        </div>
        <Select value={role} onValueChange={(v) => setRole(v as Role | typeof ALL_ROLES)}>
          <SelectTrigger className="w-full sm:w-48" aria-label="Filtrar por papel">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL_ROLES}>Todos os papéis</SelectItem>
            {ROLE_OPTIONS.map(({ value, label }) => (
              <SelectItem key={value} value={value}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {error && (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      )}

      <div className="overflow-hidden rounded-card bg-white shadow-card ring-1 ring-brand-navy/[0.06]">
        {loading && !data ? (
          <div className="flex h-64 items-center justify-center">
            <Spinner className="size-7 text-primary" />
          </div>
        ) : data && data.items.length === 0 ? (
          <Empty className="py-16">
            <EmptyHeader>
              <EmptyTitle>Nenhum usuário encontrado</EmptyTitle>
              <EmptyDescription>Ajuste a busca ou o filtro de papel.</EmptyDescription>
            </EmptyHeader>
          </Empty>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Usuário</TableHead>
                <TableHead>Papel</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-12" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {data?.items.map((user) => (
                <TableRow
                  key={user.id}
                  className="cursor-pointer"
                  onClick={() => setDetailId(user.id)}
                >
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar size="sm">
                        {user.image && <AvatarImage src={user.image} alt={user.name} />}
                        <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
                      </Avatar>
                      <div className="min-w-0">
                        <p className="truncate font-medium text-brand-navy">{user.name}</p>
                        <p className="truncate text-xs text-muted-foreground">{user.email}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <RoleBadge role={user.role} />
                  </TableCell>
                  <TableCell>
                    <StatusBadge active={user.active} />
                  </TableCell>
                  <TableCell onClick={(e) => e.stopPropagation()}>
                    <UserRowActions
                      user={user}
                      onView={() => setDetailId(user.id)}
                      onUpdated={applyUpdate}
                      onError={setError}
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>

      {data && data.total > 0 && (
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>
            {data.total} {data.total === 1 ? 'usuário' : 'usuários'}
          </span>
          <div className="flex items-center gap-3">
            <span>
              Página {data.page} de {totalPages}
            </span>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={page <= 1 || loading}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                Anterior
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={page >= totalPages || loading}
                onClick={() => setPage((p) => p + 1)}
              >
                Próxima
              </Button>
            </div>
          </div>
        </div>
      )}

      <UserDetailDrawer userId={detailId} onClose={() => setDetailId(null)} />
    </div>
  )
}

export default UsuariosPage
