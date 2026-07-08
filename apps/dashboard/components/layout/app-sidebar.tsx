"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Sparkles, LifeBuoy } from "lucide-react"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { Logo } from "@/components/layout/logo"
import { instructorNav } from "@/constants/navigation"

const isActive = (pathname: string, href: string) =>
  href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`)

export const AppSidebar = () => {
  const pathname = usePathname()

  return (
    <Sidebar collapsible="icon" className="border-r">
      <SidebarHeader className="h-16 justify-center px-4 group-data-[collapsible=icon]:px-2">
        <Logo />
      </SidebarHeader>

      <SidebarContent className="px-2">
        <SidebarGroup>
          <SidebarGroupLabel className="text-[0.65rem] font-semibold tracking-widest text-muted-foreground/70">
            INSTRUTOR
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {instructorNav.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton
                    isActive={isActive(pathname, item.href)}
                    tooltip={item.label}
                    className="data-[active=true]:bg-sidebar-accent data-[active=true]:font-semibold data-[active=true]:text-sidebar-accent-foreground"
                    render={
                      <Link href={item.href}>
                        <item.icon className="size-4" />
                        <span>{item.label}</span>
                      </Link>
                    }
                  />
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="gap-3 p-3 group-data-[collapsible=icon]:hidden">
        <div className="rounded-xl border border-primary/15 bg-primary/5 p-4">
          <div className="mb-1 flex items-center gap-2 text-sm font-semibold text-foreground">
            <Sparkles className="size-4 text-primary" />
            Dica para instrutores
          </div>
          <p className="mb-3 text-xs leading-relaxed text-muted-foreground">
            Complete seu perfil e aumente sua autoridade na plataforma.
          </p>
          <Button size="sm" className="w-full">
            Completar perfil
          </Button>
        </div>
        <Link
          href="/recursos"
          className="flex items-center gap-2 px-1 text-xs text-muted-foreground transition-colors hover:text-foreground"
        >
          <LifeBuoy className="size-4" />
          Precisa de ajuda? Central de suporte
        </Link>
      </SidebarFooter>
    </Sidebar>
  )
}
