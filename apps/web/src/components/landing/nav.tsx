import Image from 'next/image'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export const LandingNav = () => (
  <nav className="sticky top-0 z-50 border-b border-primary/20 bg-primary backdrop-blur-sm">
    <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
      <Link href="/" className="flex items-center gap-2.5">
        <Image src="/logo.svg" alt="Full Time" width={34} height={34} priority />
        <span className="font-semibold text-primary-foreground">Full Time</span>
      </Link>
      <div className="flex items-center gap-2 sm:gap-4">
        <Link
          href="/cursos"
          className="hidden text-sm text-primary-foreground/80 transition-colors hover:text-primary-foreground sm:inline"
        >
          Cursos
        </Link>
        <Button
          asChild
          variant="ghost"
          size="sm"
          className="text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground"
        >
          <Link href="/login">Entrar</Link>
        </Button>
        <Button
          asChild
          size="sm"
          className="bg-accent text-accent-foreground hover:bg-accent/90"
        >
          <Link href="/cadastro">Criar conta</Link>
        </Button>
      </div>
    </div>
  </nav>
)
