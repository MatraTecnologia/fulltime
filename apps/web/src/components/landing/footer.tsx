import Image from 'next/image'
import Link from 'next/link'

export const LandingFooter = () => (
  <footer className="border-t border-primary/20 bg-primary px-6 py-12">
    <div className="mx-auto max-w-6xl">
      <div className="flex flex-col items-center gap-6 text-center sm:flex-row sm:justify-between sm:text-left">
        <div className="flex items-center gap-3">
          <Image src="/logo.svg" alt="Full Time" width={36} height={36} />
          <div>
            <p className="font-semibold text-primary-foreground">Full Time</p>
            <p className="text-xs text-primary-foreground/60">
              Acolher · Desenvolver · Incluir
            </p>
          </div>
        </div>
        <nav className="flex flex-wrap justify-center gap-6 text-sm text-primary-foreground/70 sm:justify-end">
          <Link href="/cursos" className="transition-colors hover:text-primary-foreground">
            Cursos
          </Link>
          <Link href="/login" className="transition-colors hover:text-primary-foreground">
            Entrar
          </Link>
          <Link href="/cadastro" className="transition-colors hover:text-primary-foreground">
            Criar conta
          </Link>
        </nav>
      </div>
      <div className="mt-8 border-t border-primary-foreground/10 pt-6 text-center text-xs text-primary-foreground/40">
        <p>
          © {new Date().getFullYear()} Full Time · Desenvolvido pela{' '}
          <a
            href="https://matratecnologia.com"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-primary-foreground/60 transition-colors"
          >
            Matra Tecnologia
          </a>
        </p>
        <p className="mt-1">matratecnologia@gmail.com · (43) 99914-0409</p>
      </div>
    </div>
  </footer>
)
