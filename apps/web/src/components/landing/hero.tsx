import Image from 'next/image'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export const LandingHero = () => (
  <section className="relative overflow-hidden bg-primary px-6 pb-28 pt-20">
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      <div className="absolute -right-40 -top-40 h-[600px] w-[600px] rounded-full bg-accent/8 blur-3xl" />
      <div className="absolute -bottom-40 -left-40 h-[500px] w-[500px] rounded-full bg-chart-3/8 blur-3xl" />
      <div className="absolute left-1/2 top-1/2 h-[400px] w-[400px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-chart-4/8 blur-3xl" />
    </div>

    <div className="relative mx-auto max-w-4xl text-center">
      <Image
        src="/logo.svg"
        alt="Full Time"
        width={88}
        height={88}
        priority
        className="mx-auto mb-6 drop-shadow-lg"
      />
      <p className="mb-4 text-sm font-semibold tracking-widest text-accent uppercase">
        Acolher · Desenvolver · Incluir
      </p>
      <h1 className="text-4xl font-extrabold text-primary-foreground sm:text-5xl lg:text-6xl lg:leading-tight">
        Capacite quem transforma a vida de{' '}
        <span className="text-accent">crianças atípicas</span>
      </h1>
      <p className="mx-auto mt-6 max-w-2xl text-lg text-primary-foreground/70 leading-relaxed">
        Formação especializada em TEA e TDAH para psicólogos, terapeutas ABA,
        terapeutas ocupacionais, pedagogos e famílias que querem fazer a
        diferença.
      </p>
      <div className="mt-10 flex flex-wrap justify-center gap-4">
        <Button
          asChild
          size="lg"
          className="bg-accent px-8 text-base text-accent-foreground hover:bg-accent/90"
        >
          <Link href="/cursos">Explorar cursos</Link>
        </Button>
        <Button asChild size="lg" variant="inverse" className="px-8 text-base">
          <Link href="/cadastro">Criar conta grátis</Link>
        </Button>
      </div>
    </div>
  </section>
)
