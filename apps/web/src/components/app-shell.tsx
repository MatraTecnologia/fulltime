'use client'

import { useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  Award,
  Baby,
  BookOpen,
  GraduationCap,
  LayoutDashboard,
  PieChart,
  User,
  Users,
  Video,
} from 'lucide-react'
import { useSession } from '@/lib/auth-client'
import type { Role } from '@/lib/types'
import { Spinner } from '@/components/ui/spinner'
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from '@/components/ui/sidebar'
import { UserMenu } from './user-menu'

type NavLink = { href: string; label: string; Icon: typeof LayoutDashboard; roles?: Role[] }

const NAV_LINKS: NavLink[] = [
  { href: '/dashboard', label: 'Dashboard', Icon: LayoutDashboard },
  { href: '/catalogo', label: 'Cursos', Icon: BookOpen },
  { href: '/certificados', label: 'Certificados', Icon: Award },
  { href: '/criancas', label: 'Crianças', Icon: Baby },
  { href: '/perfil', label: 'Perfil', Icon: User },
]

const ADMIN_LINKS: NavLink[] = [
  { href: '/admin', label: 'Visão geral', Icon: PieChart, roles: ['admin'] },
  { href: '/admin/cursos', label: 'Cursos', Icon: GraduationCap, roles: ['admin', 'instrutor'] },
  { href: '/admin/videos', label: 'Vídeos', Icon: Video, roles: ['admin', 'instrutor'] },
  { href: '/admin/usuarios', label: 'Usuários', Icon: Users, roles: ['admin'] },
]

const ACTIVE_CLS =
  'font-semibold data-[active=true]:bg-sidebar-primary data-[active=true]:text-sidebar-primary-foreground data-[active=true]:shadow-sm data-[active=true]:hover:bg-sidebar-primary data-[active=true]:hover:text-sidebar-primary-foreground focus-visible:ring-2 focus-visible:ring-brand-blue'

const isActive = (pathname: string, href: string) =>
  href === '/admin'
    ? pathname === '/admin'
    : pathname === href || pathname.startsWith(`${href}/`)

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
  const adminLinks = role ? ADMIN_LINKS.filter((l) => !l.roles || l.roles.includes(role)) : []

  const renderLink = ({ href, label, Icon }: NavLink) => {
    const active = isActive(pathname, href)
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
  }

  return (
    <SidebarProvider>
      <Sidebar variant="floating" collapsible="icon" className="border-none">
        <SidebarHeader className="border-b border-sidebar-border px-4 py-4 group-data-[collapsible=icon]:px-1">
          <Link href="/dashboard" className="flex items-center gap-2.5 group-data-[collapsible=icon]:justify-center">
            <Image
              src="/logo.svg"
              alt="Full Time"
              width={40}
              height={40}
              priority
              className="size-10 group-data-[collapsible=icon]:size-8"
            />
            <span className="font-display text-lg font-extrabold tracking-tight text-brand-navy group-data-[collapsible=icon]:hidden">
              Full Time
            </span>
          </Link>
        </SidebarHeader>

        <SidebarContent className="gap-1 px-2 pt-3">
          <SidebarGroup>
            <SidebarGroupContent>
              <SidebarMenu className="gap-1">{NAV_LINKS.map(renderLink)}</SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>

          {adminLinks.length > 0 && (
            <SidebarGroup>
              <SidebarGroupLabel className="text-[0.7rem] font-semibold tracking-wider text-muted-foreground uppercase">
                Administração
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu className="gap-1">{adminLinks.map(renderLink)}</SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          )}
        </SidebarContent>
      </Sidebar>

      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-3 border-b border-border bg-white/80 px-6 backdrop-blur-sm">
          <SidebarTrigger className="text-muted-foreground hover:text-brand-navy" />
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
        <div className="flex-1 p-6 lg:p-8">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  )
}
