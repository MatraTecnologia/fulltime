"use client"

import { Bell, Plus, Search } from "lucide-react"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/layout/theme-toggle"
import { UserMenu } from "@/components/layout/user-menu"
import type { InstructorProfile } from "@/types"

export const AppHeader = ({ profile }: { profile: InstructorProfile }) => {
  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b bg-background/80 px-4 backdrop-blur-md">
      <SidebarTrigger className="text-muted-foreground" />
      <Separator orientation="vertical" className="mx-1 hidden h-6 sm:block" />

      <div className="relative hidden max-w-md flex-1 items-center md:flex">
        <Search className="pointer-events-none absolute left-3 size-4 text-muted-foreground" />
        <input
          type="search"
          placeholder="Buscar alunos, cursos, conteúdos..."
          className="h-9 w-full rounded-lg border border-input bg-muted/40 pl-9 pr-14 text-sm outline-none transition-colors placeholder:text-muted-foreground focus:border-ring focus:bg-background"
        />
        <kbd className="pointer-events-none absolute right-2.5 hidden items-center gap-0.5 rounded border bg-muted px-1.5 font-mono text-[0.65rem] text-muted-foreground lg:inline-flex">
          Ctrl K
        </kbd>
      </div>

      <div className="ml-auto flex items-center gap-1.5">
        <Button className="hidden gap-1.5 sm:inline-flex">
          <Plus className="size-4" />
          Novo conteúdo
        </Button>
        <ThemeToggle />
        <Button variant="ghost" size="icon" className="relative text-muted-foreground" aria-label="Notificações">
          <Bell className="size-5" />
          <span className="absolute right-2 top-2 size-2 rounded-full bg-destructive ring-2 ring-background" />
        </Button>
        <Separator orientation="vertical" className="mx-1 h-6" />
        <UserMenu profile={profile} />
      </div>
    </header>
  )
}
