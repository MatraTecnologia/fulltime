import {
  Award,
  BarChart3,
  FileStack,
  FolderOpen,
  GraduationCap,
  LayoutDashboard,
  MessageSquare,
  School,
  Settings,
  Users,
  type LucideIcon,
} from 'lucide-react'

export type PanelNavItem = {
  href: string
  label: string
  Icon: LucideIcon
  children?: { href: string; label: string }[]
}

export const PANEL_NAV: PanelNavItem[] = [
  { href: '/painel', label: 'Visão Geral', Icon: LayoutDashboard },
  { href: '/painel/cursos', label: 'Meus Cursos', Icon: GraduationCap },
  {
    href: '/painel/conteudos',
    label: 'Conteúdos',
    Icon: FileStack,
    children: [
      { href: '/painel/conteudos/novo', label: 'Novo conteúdo' },
      { href: '/painel/conteudos', label: 'Biblioteca' },
    ],
  },
  { href: '/painel/turmas', label: 'Turmas', Icon: School },
  { href: '/painel/alunos', label: 'Alunos', Icon: Users },
  { href: '/painel/comentarios', label: 'Comentários', Icon: MessageSquare },
  { href: '/painel/certificados', label: 'Certificados', Icon: Award },
  { href: '/painel/relatorios', label: 'Relatórios', Icon: BarChart3 },
  { href: '/painel/recursos', label: 'Recursos', Icon: FolderOpen },
  { href: '/painel/configuracoes', label: 'Configurações', Icon: Settings },
]

export const isNavActive = (pathname: string, href: string) =>
  href === '/painel' ? pathname === '/painel' : pathname === href || pathname.startsWith(`${href}/`)

const ROUTE_LABELS: Record<string, string> = Object.fromEntries([
  ...PANEL_NAV.flatMap((i) => [
    [i.href, i.label] as const,
    ...(i.children?.map((c) => [c.href, c.label] as const) ?? []),
  ]),
  ['/painel/perfil', 'Meu Perfil'],
])

export type Crumb = { href: string; label: string }

export const getPanelBreadcrumb = (pathname: string): Crumb[] => {
  const crumbs: Crumb[] = []
  let acc = ''
  for (const seg of pathname.split('/').filter(Boolean)) {
    acc += `/${seg}`
    crumbs.push({ href: acc, label: ROUTE_LABELS[acc] ?? seg })
  }
  return crumbs
}
