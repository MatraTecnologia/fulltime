'use client'

import { useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { Award, Baby, BookOpen, LayoutDashboard, Shield, User } from 'lucide-react'
import { useSession } from '@/lib/auth-client'
import type { Role } from '@/lib/types'
import { Spinner } from '@/components/ui/spinner'
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from '@/components/ui/sidebar'
import { UserMenu } from './user-menu'

const NAV_LINKS = [
  { href: '/dashboard', label: 'Dashboard', Icon: LayoutDashboard },
  { href: '/catalogo', label: 'Cursos', Icon: BookOpen },
  { href: '/certificados', label: 'Certificados', Icon: Award },
  { href: '/criancas', label: 'Crianças', Icon: Baby },
  { href: '/perfil', label: 'Perfil', Icon: User },
]

const ADMIN_LINK = { href: '/admin/cursos', label: 'Admin', Icon: Shield }
const ADMIN_ROLES: Role[] = ['admin', 'instrutor']

const ACTIVE_CLS =
  'data-[active=true]:bg-sidebar-primary data-[active=true]:text-sidebar-primary-foreground data-[active=true]:hover:bg-sidebar-primary data-[active=true]:hover:text-sidebar-primary-foreground'

export const AppShell = ({ children }: { children: React.ReactNode }) => {
  const { data, isPending } = useSession()
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    if (!isPending && !data) router.replace('/login')
  }, [isPending, data, router])

  if (isPending || !data) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Spinner className="size-7 text-primary" />
      </div>
    )
  }

  const role = (data.user as { role?: Role } | null)?.role

  return (
    <SidebarProvider>
      <Sidebar variant="floating" collapsible="icon">
        <SidebarHeader className="border-b border-sidebar-border px-3 py-3 group-data-[collapsible=icon]:px-1">
          <Link href="/dashboard" className="flex items-center justify-center">
            <Image
              src="/logo.svg"
              alt="Full Time"
              width={48}
              height={48}
              priority
              className="size-12 group-data-[collapsible=icon]:size-8"
            />
          </Link>
        </SidebarHeader>

        <SidebarContent className="pt-2">
          <SidebarGroup>
            <SidebarGroupContent>
              <SidebarMenu>
                {NAV_LINKS.map(({ href, label, Icon }) => {
                  const active =
                    pathname === href || pathname.startsWith(`${href}/`)
                  return (
                    <SidebarMenuItem key={href}>
                      <SidebarMenuButton asChild isActive={active} tooltip={label} className={ACTIVE_CLS}>
                        <Link href={href} aria-current={active ? 'page' : undefined}>
                          <Icon />
                          <span>{label}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  )
                })}
                {role && ADMIN_ROLES.includes(role) && (
                  <SidebarMenuItem>
                    <SidebarMenuButton
                      asChild
                      isActive={pathname.startsWith('/admin')}
                      tooltip={ADMIN_LINK.label}
                      className={ACTIVE_CLS}
                    >
                      <Link
                        href={ADMIN_LINK.href}
                        aria-current={
                          pathname.startsWith('/admin') ? 'page' : undefined
                        }
                      >
                        <ADMIN_LINK.Icon />
                        <span>{ADMIN_LINK.label}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
      </Sidebar>

      <SidebarInset>
        <header className="flex h-14 shrink-0 items-center gap-3 border-b border-border bg-background px-4">
          <SidebarTrigger className="text-muted-foreground" />
          <div className="ml-auto">
            <UserMenu
              user={
                data.user as {
                  name: string
                  email: string
                  image?: string | null
                  role?: Role
                }
              }
            />
          </div>
        </header>
        <div className="flex-1 p-6">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  )
}
