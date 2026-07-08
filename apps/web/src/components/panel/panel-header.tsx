'use client'

import Link from 'next/link'
import { Bell, Plus } from 'lucide-react'
import type { Role } from '@/lib/types'
import { recentActivities } from '@/lib/panel/data'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { SidebarTrigger } from '@/components/ui/sidebar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { UserMenu } from '@/components/user-menu'
import { PanelBreadcrumb } from './panel-breadcrumb'
import { PanelSearch } from './panel-search'

type ShellUser = { name: string; email: string; image?: string | null; role?: Role }

const NotificationsBell = () => (
  <DropdownMenu>
    <DropdownMenuTrigger asChild>
      <button
        type="button"
        aria-label="Notificações"
        className="relative flex size-10 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-secondary hover:text-brand-navy focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
      >
        <Bell className="size-5" />
        <span className="absolute right-2.5 top-2.5 size-2 rounded-full bg-destructive ring-2 ring-white" />
      </button>
    </DropdownMenuTrigger>
    <DropdownMenuContent align="end" className="w-80">
      <DropdownMenuLabel className="text-sm font-semibold text-brand-navy">Notificações</DropdownMenuLabel>
      <DropdownMenuSeparator />
      <ul className="max-h-80 overflow-y-auto py-1">
        {recentActivities.map((a, i) => (
          <li key={i} className="flex flex-col gap-0.5 px-2 py-2 hover:bg-secondary/60">
            <span className="text-sm text-brand-navy">{a.text}</span>
            <span className="text-xs text-muted-foreground">{a.time}</span>
          </li>
        ))}
      </ul>
      <DropdownMenuSeparator />
      <Link
        href="/painel/comentarios"
        className="block px-2 py-1.5 text-center text-xs font-medium text-blue-600 hover:underline"
      >
        Ver todas
      </Link>
    </DropdownMenuContent>
  </DropdownMenu>
)

export const PanelHeader = ({ user }: { user: ShellUser }) => (
  <header className="sticky top-0 z-20 flex h-16 items-center gap-2 border-b border-border bg-white/85 px-4 backdrop-blur-sm lg:px-6">
    <SidebarTrigger className="-ml-1 size-9 text-muted-foreground hover:text-brand-navy" />
    <Separator orientation="vertical" className="mr-1 hidden h-6 sm:block" />
    <div className="hidden sm:block">
      <PanelBreadcrumb />
    </div>

    <div className="ml-auto flex items-center gap-1.5">
      <div className="hidden w-64 md:block xl:w-80">
        <PanelSearch />
      </div>
      <NotificationsBell />
      <Button asChild className="bg-blue-600 text-white hover:bg-blue-700">
        <Link href="/painel/conteudos/novo">
          <Plus className="size-4" />
          <span className="hidden sm:inline">Novo conteúdo</span>
        </Link>
      </Button>
      <div className="ml-1">
        <UserMenu user={user} />
      </div>
    </div>
  </header>
)
