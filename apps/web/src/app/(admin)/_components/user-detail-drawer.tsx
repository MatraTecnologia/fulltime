'use client'

import { useEffect, useState } from 'react'
import { Baby, BookOpen, GraduationCap } from 'lucide-react'
import { apiFetch, ApiError } from '@/lib/api'
import type { UserDetail } from '@/lib/types'
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/drawer'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Spinner } from '@/components/ui/spinner'
import { RoleBadge, StatusBadge } from './role-badge'

const getInitials = (name: string) =>
  name.split(' ').slice(0, 2).map((w) => w[0]).join('').toUpperCase()

const STATUS_LABELS = { DRAFT: 'Rascunho', PUBLISHED: 'Publicado' } as const

const CountTile = ({
  icon,
  value,
  label,
}: {
  icon: React.ReactNode
  value: number
  label: string
}) => (
  <div className="flex flex-col gap-1 rounded-xl bg-surface p-4">
    <span className="text-brand-navy [&_svg]:size-4">{icon}</span>
    <span className="font-display text-xl font-extrabold text-brand-navy">{value}</span>
    <span className="text-xs text-muted-foreground">{label}</span>
  </div>
)

export const UserDetailDrawer = ({
  userId,
  onClose,
}: {
  userId: string | null
  onClose: () => void
}) => {
  const [detail, setDetail] = useState<UserDetail | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setDetail(null)
    setError(null)
    if (!userId) return
    apiFetch<UserDetail>(`/users/${userId}`)
      .then(setDetail)
      .catch((e) =>
        setError(e instanceof ApiError ? e.message : 'Não foi possível carregar o usuário.'),
      )
  }, [userId])

  return (
    <Drawer open={!!userId} onOpenChange={(open) => !open && onClose()} direction="right">
      <DrawerContent className="ml-auto h-full w-full max-w-md">
        {!detail && (
          <DrawerHeader className="sr-only">
            <DrawerTitle>Detalhes do usuário</DrawerTitle>
          </DrawerHeader>
        )}
        {!detail && !error ? (
          <div className="flex h-64 items-center justify-center">
            <Spinner className="size-7 text-primary" />
          </div>
        ) : error ? (
          <div className="p-6">
            <p className="text-sm text-destructive" role="alert">
              {error}
            </p>
          </div>
        ) : (
          <div className="flex h-full flex-col overflow-y-auto">
            <DrawerHeader className="border-b border-border">
              <div className="flex items-center gap-3">
                <Avatar>
                  {detail!.image && <AvatarImage src={detail!.image} alt={detail!.name} />}
                  <AvatarFallback>{getInitials(detail!.name)}</AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1 text-left">
                  <DrawerTitle className="truncate text-brand-navy">{detail!.name}</DrawerTitle>
                  <DrawerDescription className="truncate">{detail!.email}</DrawerDescription>
                </div>
              </div>
              <div className="mt-3 flex items-center gap-2">
                <RoleBadge role={detail!.role} />
                <StatusBadge active={detail!.active} />
              </div>
            </DrawerHeader>

            <div className="space-y-6 p-6">
              <div className="grid grid-cols-3 gap-3">
                <CountTile
                  icon={<GraduationCap />}
                  value={detail!.counts.courses}
                  label="Cursos"
                />
                <CountTile icon={<BookOpen />} value={detail!.counts.enrollments} label="Matrículas" />
                <CountTile icon={<Baby />} value={detail!.counts.children} label="Crianças" />
              </div>

              <section className="space-y-3">
                <h3 className="text-sm font-semibold text-brand-navy">Cursos como instrutor</h3>
                {detail!.courses.length === 0 ? (
                  <p className="text-sm text-muted-foreground">Nenhum curso.</p>
                ) : (
                  <ul className="space-y-2">
                    {detail!.courses.map((c) => (
                      <li
                        key={c.id}
                        className="flex items-center justify-between gap-2 rounded-lg border border-border px-3 py-2"
                      >
                        <span className="truncate text-sm text-brand-navy">{c.title}</span>
                        <span className="shrink-0 text-xs text-muted-foreground">
                          {STATUS_LABELS[c.status]}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </section>

              <section className="space-y-3">
                <h3 className="text-sm font-semibold text-brand-navy">Crianças vinculadas</h3>
                {detail!.children.length === 0 ? (
                  <p className="text-sm text-muted-foreground">Nenhuma criança.</p>
                ) : (
                  <ul className="space-y-2">
                    {detail!.children.map((child) => (
                      <li
                        key={child.id}
                        className="rounded-lg border border-border px-3 py-2 text-sm text-brand-navy"
                      >
                        {child.name}
                      </li>
                    ))}
                  </ul>
                )}
              </section>
            </div>
          </div>
        )}
      </DrawerContent>
    </Drawer>
  )
}
