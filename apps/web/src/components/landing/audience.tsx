import { CheckCircle2 } from 'lucide-react'

const audience = [
  'Psicólogos e analistas do comportamento (ABA/BCBA)',
  'Terapeutas ocupacionais',
  'Pedagogos e professores de educação inclusiva',
  'Fonoaudiólogos',
  'Famílias de crianças com TEA ou TDAH',
  'Profissionais de saúde que atendem crianças atípicas',
]

export const LandingAudience = () => (
  <section className="bg-secondary/30 px-6 py-20">
    <div className="mx-auto max-w-4xl">
      <div className="grid items-center gap-12 lg:grid-cols-2">
        <div>
          <h2 className="text-3xl font-extrabold text-foreground sm:text-4xl">
            Para quem é a Full Time?
          </h2>
          <p className="mt-4 leading-relaxed text-muted-foreground">
            Nossa plataforma foi criada para todos os profissionais e famílias
            comprometidos com o desenvolvimento pleno de crianças que aprendem
            de formas diferentes.
          </p>
        </div>
        <ul className="space-y-3">
          {audience.map((item) => (
            <li key={item} className="flex items-start gap-3">
              <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-chart-2" />
              <span className="text-foreground">{item}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  </section>
)
