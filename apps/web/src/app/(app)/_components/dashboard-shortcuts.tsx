import Link from 'next/link'
import { ArrowRight, Award, Baby, Compass } from 'lucide-react'

const SHORTCUTS = [
  {
    href: '/criancas',
    label: 'Crianças',
    desc: 'Gerencie registros e acompanhamento',
    Icon: Baby,
  },
  {
    href: '/certificados',
    label: 'Certificados',
    desc: 'Emita e consulte suas conquistas',
    Icon: Award,
  },
  {
    href: '/catalogo',
    label: 'Explorar cursos',
    desc: 'Descubra novas formações',
    Icon: Compass,
  },
] as const

export const DashboardShortcuts = () => (
  <div className="grid gap-4 sm:grid-cols-3">
    {SHORTCUTS.map(({ href, label, desc, Icon }) => (
      <Link
        key={href}
        href={href}
        className="group flex items-center gap-4 rounded-card bg-white p-5 shadow-card ring-1 ring-brand-navy/[0.06] transition-shadow hover:shadow-lifted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue"
      >
        <span className="inline-flex size-11 shrink-0 items-center justify-center rounded-xl bg-brand-navy-50 text-brand-navy [&_svg]:size-5">
          <Icon />
        </span>
        <div className="min-w-0 flex-1">
          <p className="font-display font-bold text-brand-navy">{label}</p>
          <p className="truncate text-xs text-muted-foreground">{desc}</p>
        </div>
        <ArrowRight className="size-4 shrink-0 text-brand-navy/30 transition-transform group-hover:translate-x-0.5 group-hover:text-brand-navy" />
      </Link>
    ))}
  </div>
)
