import { HeartHandshake, TrendingUp, Users } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'

type Pillar = {
  icon: LucideIcon
  title: string
  description: string
  iconClass: string
}

const pillars: Pillar[] = [
  {
    icon: HeartHandshake,
    title: 'Acolher',
    description:
      'Entendemos a jornada de quem cuida. Nossos cursos partem da empatia e do respeito às diferentes formas de aprender e de existir.',
    iconClass: 'bg-chart-2/15 text-chart-2',
  },
  {
    icon: TrendingUp,
    title: 'Desenvolver',
    description:
      'Conteúdo prático e baseado em evidências para ampliar competências técnicas com crianças que têm TEA, TDAH e outras condições do neurodesenvolvimento.',
    iconClass: 'bg-chart-3/15 text-chart-3',
  },
  {
    icon: Users,
    title: 'Incluir',
    description:
      'Formamos profissionais e famílias que criam ambientes verdadeiramente inclusivos, onde toda criança pode crescer com dignidade e pertencimento.',
    iconClass: 'bg-chart-4/15 text-chart-4',
  },
]

export const LandingPillars = () => (
  <section className="bg-background px-6 py-20">
    <div className="mx-auto max-w-6xl">
      <div className="mb-14 text-center">
        <h2 className="text-3xl font-extrabold text-foreground sm:text-4xl">
          O que guia tudo que criamos
        </h2>
        <p className="mt-4 text-muted-foreground">
          Três pilares que orientam cada curso, cada aula e cada decisão pedagógica
        </p>
      </div>
      <div className="grid gap-8 sm:grid-cols-3">
        {pillars.map(({ icon: Icon, title, description, iconClass }) => (
          <Card key={title} className="text-center">
            <CardContent className="pt-6 pb-6">
              <div
                className={cn(
                  'mx-auto mb-5 flex size-16 items-center justify-center rounded-2xl',
                  iconClass,
                )}
              >
                <Icon className="size-8" />
              </div>
              <h3 className="mb-3 text-xl font-bold text-foreground">{title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  </section>
)
