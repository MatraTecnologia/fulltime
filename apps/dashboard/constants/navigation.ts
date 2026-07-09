import {
  Award,
  BarChart3,
  BookOpen,
  Film,
  LayoutDashboard,
  LayoutGrid,
  LifeBuoy,
  MessageSquare,
  Settings,
  Users,
  type LucideIcon,
} from "lucide-react"
import type { Role } from "@/types"

export interface NavItem {
  label: string
  href: string
  icon: LucideIcon
  roles: Role[]
}

export const instructorNav: NavItem[] = [
  { label: "Visão Geral", href: "/", icon: LayoutDashboard, roles: ["instrutor", "admin"] },
  { label: "Meus Cursos", href: "/cursos", icon: BookOpen, roles: ["instrutor", "admin"] },
  { label: "Vídeos", href: "/videos", icon: Film, roles: ["instrutor", "admin"] },
  { label: "Alunos", href: "/alunos", icon: Users, roles: ["instrutor", "admin"] },
  { label: "Comentários", href: "/comentarios", icon: MessageSquare, roles: ["instrutor", "admin"] },
  { label: "Certificados", href: "/certificados", icon: Award, roles: ["instrutor", "admin"] },
  { label: "Catálogo", href: "/catalogo", icon: LayoutGrid, roles: ["admin"] },
  { label: "Relatórios", href: "/relatorios", icon: BarChart3, roles: ["instrutor", "admin"] },
  { label: "Recursos", href: "/recursos", icon: LifeBuoy, roles: ["instrutor", "admin"] },
  { label: "Configurações", href: "/configuracoes", icon: Settings, roles: ["instrutor", "admin"] },
]
