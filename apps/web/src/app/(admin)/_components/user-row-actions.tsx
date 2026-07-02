'use client'

import { useState } from 'react'
import { MoreHorizontal } from 'lucide-react'
import { apiFetch, ApiError } from '@/lib/api'
import type { Role, UserListItem } from '@/lib/types'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Spinner } from '@/components/ui/spinner'
import { ROLE_OPTIONS } from './role-badge'

type Patch = { role?: Role; active?: boolean }

export const UserRowActions = ({
  user,
  onView,
  onUpdated,
  onError,
}: {
  user: UserListItem
  onView: () => void
  onUpdated: (updated: Partial<UserListItem> & { id: string }) => void
  onError: (message: string) => void
}) => {
  const [saving, setSaving] = useState(false)

  const patch = async (body: Patch) => {
    setSaving(true)
    try {
      const updated = await apiFetch<Partial<UserListItem> & { id: string }>(`/users/${user.id}`, {
        method: 'PATCH',
        body: JSON.stringify(body),
      })
      onUpdated(updated)
    } catch (e) {
      onError(e instanceof ApiError ? e.message : 'Não foi possível atualizar o usuário.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          aria-label="Ações do usuário"
          disabled={saving}
          className="inline-flex size-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-brand-navy focus-visible:ring-2 focus-visible:ring-brand-blue focus-visible:outline-none disabled:opacity-50"
        >
          {saving ? <Spinner className="size-4" /> : <MoreHorizontal className="size-4" />}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuItem onSelect={onView}>Ver detalhes</DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuLabel>Papel</DropdownMenuLabel>
        <DropdownMenuRadioGroup
          value={user.role ?? ''}
          onValueChange={(role) => role !== user.role && patch({ role: role as Role })}
        >
          {ROLE_OPTIONS.map(({ value, label }) => (
            <DropdownMenuRadioItem key={value} value={value}>
              {label}
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          variant={user.active ? 'destructive' : 'default'}
          onSelect={() => patch({ active: !user.active })}
        >
          {user.active ? 'Desativar' : 'Ativar'}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
