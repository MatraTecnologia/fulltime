import Link from 'next/link'
import { Button } from '@/components/ui/button'

const NotFound = () => (
  <main className="flex min-h-screen flex-col items-center justify-center gap-6 px-6 text-center">
    <p className="font-display text-sm font-semibold uppercase tracking-widest text-brand-amber">
      Full Time
    </p>
    <h1 className="font-display text-6xl font-extrabold text-brand-navy">404</h1>
    <p className="text-lg text-brand-navy/70">Esta página não existe ou foi movida.</p>
    <Button asChild>
      <Link href="/">Voltar ao início</Link>
    </Button>
  </main>
)

export default NotFound
