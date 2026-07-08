'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ChevronRight } from 'lucide-react'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  useSidebar,
} from '@/components/ui/sidebar'
import { PANEL_NAV, isNavActive, type PanelNavItem } from '@/lib/panel/nav'

// Estado ativo em azul sólido — fiel às telas de referência (sobrepõe o accent padrão do sidebar).
const activeClass =
  'data-[active=true]:bg-blue-600 data-[active=true]:text-white data-[active=true]:hover:bg-blue-600 data-[active=true]:hover:text-white data-[active=true]:[&>svg]:text-white'

const NavCollapsible = ({ item, onNavigate }: { item: PanelNavItem; onNavigate?: () => void }) => {
  const pathname = usePathname()
  const active = isNavActive(pathname, item.href)

  return (
    <Collapsible asChild defaultOpen={active} className="group/collapsible">
      <SidebarMenuItem>
        <CollapsibleTrigger asChild>
          <SidebarMenuButton tooltip={item.label} isActive={active} className={activeClass}>
            <item.Icon />
            <span>{item.label}</span>
            <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
          </SidebarMenuButton>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <SidebarMenuSub>
            {item.children!.map((child) => (
              <SidebarMenuSubItem key={child.href}>
                <SidebarMenuSubButton asChild isActive={pathname === child.href}>
                  <Link href={child.href} onClick={onNavigate}>
                    <span>{child.label}</span>
                  </Link>
                </SidebarMenuSubButton>
              </SidebarMenuSubItem>
            ))}
          </SidebarMenuSub>
        </CollapsibleContent>
      </SidebarMenuItem>
    </Collapsible>
  )
}

export const PanelNav = ({ onNavigate }: { onNavigate?: () => void }) => {
  const pathname = usePathname()
  const { isMobile } = useSidebar()

  return (
    <SidebarGroup>
      <SidebarGroupLabel>Instrutor</SidebarGroupLabel>
      <SidebarMenu>
        {PANEL_NAV.map((item) =>
          item.children && !isMobile ? (
            <NavCollapsible key={item.href} item={item} onNavigate={onNavigate} />
          ) : (
            <SidebarMenuItem key={item.href}>
              <SidebarMenuButton
                asChild
                tooltip={item.label}
                isActive={isNavActive(pathname, item.href)}
                className={activeClass}
              >
                <Link href={item.href} onClick={onNavigate}>
                  <item.Icon />
                  <span>{item.label}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ),
        )}
      </SidebarMenu>
    </SidebarGroup>
  )
}
