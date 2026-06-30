import Link from 'next/link'
import { Button } from '@/components/ui/button'

export const LandingCtaFinal = () => (
  <section className="bg-accent px-6 py-24 text-center">
    <div className="mx-auto max-w-2xl">
      <h2 className="text-3xl font-extrabold text-accent-foreground sm:text-4xl">
        Comece hoje a transformar vidas
      </h2>
      <p className="mt-4 text-lg text-accent-foreground/80">
        Junte-se a profissionais que já usam a Full Time para evoluir e fazer a
        diferença na vida das crianças que atendem.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-4">
        <Button
          asChild
          size="lg"
          className="bg-primary px-8 text-base text-primary-foreground hover:bg-primary/90"
        >
          <Link href="/cadastro">Criar conta grátis</Link>
        </Button>
        <Button
          asChild
          size="lg"
          variant="outline"
          className="border-accent-foreground/40 bg-transparent px-8 text-base text-accent-foreground hover:bg-accent-foreground/10 hover:text-accent-foreground"
        >
          <Link href="/cursos">Explorar cursos</Link>
        </Button>
      </div>
    </div>
  </section>
)
