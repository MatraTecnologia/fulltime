'use client'

import Image from 'next/image'
import Link from 'next/link'
import { LifeBuoy } from 'lucide-react'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  useSidebar,
} from '@/components/ui/sidebar'
import { Button } from '@/components/ui/button'
import { PanelNav } from './panel-nav'

const Logo = () => (
  <Link
    href="/painel"
    className="flex h-9 items-center gap-2.5 px-1 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-0"
  >
    <Image src="/logo.svg" alt="Full Time" width={32} height={32} priority className="size-8 shrink-0" />
    <span className="font-display text-lg font-extrabold tracking-tight text-brand-navy group-data-[collapsible=icon]:hidden">
      Full Time
    </span>
  </Link>
)

const TipCard = () => (
  <div className="rounded-xl border border-border bg-secondary/60 p-4 group-data-[collapsible=icon]:hidden">
    <p className="text-sm font-semibold text-brand-navy">Dica para instrutores</p>
    <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
      Complete seu perfil e aumente sua autoridade na plataforma.
    </p>
    <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-border">
      <div className="h-full w-[75%] rounded-full bg-blue-600" />
    </div>
    <p className="mt-1 text-[0.7rem] text-muted-foreground">75% completo</p>
    <Button asChild size="sm" className="mt-3 w-full bg-brand-purple text-white hover:bg-brand-purple/90">
      <Link href="/painel/perfil">Completar perfil</Link>
    </Button>
  </div>
)

export const PanelSidebar = ({ onNavigate }: { onNavigate?: () => void }) => {
  const { setOpenMobile } = useSidebar()
  const handleNavigate = onNavigate ?? (() => setOpenMobile(false))

  return (
    <Sidebar collapsible="icon" className="border-r border-border bg-white">
      <SidebarHeader className="h-16 justify-center border-b border-border px-4 group-data-[collapsible=icon]:px-0">
        <Logo />
      </SidebarHeader>

      <SidebarContent className="py-2">
        <PanelNav onNavigate={handleNavigate} />
      </SidebarContent>

      <SidebarFooter className="gap-3 border-t border-border p-3">
        <TipCard />
        <Link
          href="/painel/recursos"
          onClick={handleNavigate}
          className="flex items-center gap-2 rounded-md px-2 py-1.5 text-xs text-muted-foreground transition-colors hover:text-brand-navy group-data-[collapsible=icon]:justify-center"
        >
          <LifeBuoy className="size-4 shrink-0" />
          <span className="group-data-[collapsible=icon]:hidden">Precisa de ajuda? Acesse a Central</span>
        </Link>
      </SidebarFooter>
    </Sidebar>
  )
}
