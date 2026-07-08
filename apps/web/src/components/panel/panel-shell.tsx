'use client'

import type { Role } from '@/lib/types'
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar'
import { PanelSidebar } from './panel-sidebar'
import { PanelHeader } from './panel-header'

type ShellUser = { name: string; email: string; image?: string | null; role?: Role }

export const PanelShell = ({
  user,
  children,
  defaultSidebarOpen = true,
}: {
  user: ShellUser
  children: React.ReactNode
  defaultSidebarOpen?: boolean
}) => (
  <SidebarProvider defaultOpen={defaultSidebarOpen}>
    <PanelSidebar />
    <SidebarInset className="min-w-0">
      <PanelHeader user={user} />
      <div className="flex-1 p-4 sm:p-6 lg:p-8">{children}</div>
    </SidebarInset>
  </SidebarProvider>
)
