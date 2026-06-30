'use client'

import { Button } from '@/components/ui/button'

const ErrorPage = ({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) => (
  <main className="flex min-h-screen flex-col items-center justify-center gap-6 px-6 text-center">
    <p className="font-display text-sm font-semibold uppercase tracking-widest text-brand-amber">
      Full Time
    </p>
    <h1 className="font-display text-2xl font-bold text-brand-navy">Algo deu errado</h1>
    <p className="text-sm text-brand-navy/70">{error.message || 'Ocorreu um erro inesperado.'}</p>
    <Button onClick={reset}>Tentar novamente</Button>
  </main>
)

export default ErrorPage
