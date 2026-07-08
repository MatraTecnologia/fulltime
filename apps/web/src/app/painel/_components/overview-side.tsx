import Link from 'next/link'
import {
  Award,
  BarChart3,
  MessageSquare,
  MessageSquarePlus,
  PlusCircle,
  Star,
  Upload,
  UserPlus,
} from 'lucide-react'
import { SectionCard } from '@/components/panel/primitives'
import { Button } from '@/components/ui/button'
import { recentActivities, type Activity } from '@/lib/panel/data'

const actions = [
  { href: '/painel/conteudos/novo', label: 'Enviar novo conteúdo', hint: 'Faça upload de aulas e materiais', Icon: Upload },
  { href: '/painel/cursos', label: 'Criar novo curso', hint: 'Comece um curso do zero', Icon: PlusCircle },
  { href: '/painel/comentarios', label: 'Ver comentários', hint: 'Responda seus alunos', Icon: MessageSquare },
  { href: '/painel/relatorios', label: 'Ver relatórios', hint: 'Acompanhe seu desempenho', Icon: BarChart3 },
]

const activityIcon: Record<Activity['kind'], typeof Star> = {
  comment: MessageSquarePlus,
  student: UserPlus,
  rating: Star,
  certificate: Award,
}

const activityTone: Record<Activity['kind'], string> = {
  comment: 'bg-blue-50 text-blue-600',
  student: 'bg-green-50 text-brand-green',
  rating: 'bg-amber-50 text-brand-amber',
  certificate: 'bg-purple-50 text-brand-purple',
}

export const QuickActions = () => (
  <SectionCard title="Ações rápidas" bodyClassName="p-3">
    <ul className="space-y-1">
      {actions.map(({ href, label, hint, Icon }) => (
        <li key={href}>
          <Link
            href={href}
            className="flex items-center gap-3 rounded-lg p-2.5 transition-colors hover:bg-secondary/60"
          >
            <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
              <Icon className="size-[1.15rem]" />
            </span>
            <span className="min-w-0">
              <span className="block text-sm font-medium text-brand-navy">{label}</span>
              <span className="block truncate text-xs text-muted-foreground">{hint}</span>
            </span>
          </Link>
        </li>
      ))}
    </ul>

    <div className="mt-3 rounded-lg border border-dashed border-border bg-secondary/30 p-4 text-center">
      <p className="text-sm font-medium text-brand-navy">Enviar conteúdo</p>
      <p className="mt-0.5 text-xs text-muted-foreground">Vídeos, áudios, PDFs e documentos</p>
      <Button asChild size="sm" className="mt-3 bg-brand-purple text-white hover:bg-brand-purple/90">
        <Link href="/painel/conteudos/novo">Selecionar arquivo</Link>
      </Button>
    </div>
  </SectionCard>
)

export const RecentActivities = () => (
  <SectionCard title="Atividades recentes" bodyClassName="p-3">
    <ul className="space-y-1">
      {recentActivities.map((a, i) => {
        const Icon = activityIcon[a.kind]
        return (
          <li key={i} className="flex items-start gap-3 rounded-lg p-2.5 hover:bg-secondary/50">
            <span className={`flex size-8 shrink-0 items-center justify-center rounded-lg ${activityTone[a.kind]}`}>
              <Icon className="size-4" />
            </span>
            <span className="min-w-0">
              <span className="block text-sm text-brand-navy">{a.text}</span>
              <span className="block text-xs text-muted-foreground">{a.time}</span>
            </span>
          </li>
        )
      })}
    </ul>
  </SectionCard>
)
