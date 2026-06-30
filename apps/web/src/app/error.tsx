'use client'

const ErrorPage = ({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) => (
  <main className="flex min-h-screen flex-col items-center justify-center gap-6 px-6 text-center">
    <p className="font-display text-sm font-semibold uppercase tracking-widest text-brand-amber">
      Full Time
    </p>
    <h1 className="font-display text-2xl font-bold text-brand-navy">Algo deu errado</h1>
    <p className="text-sm text-brand-navy/70">{error.message || 'Ocorreu um erro inesperado.'}</p>
    <button
      type="button"
      onClick={reset}
      className="inline-flex items-center justify-center rounded-lg font-display font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue focus-visible:ring-offset-2 bg-brand-navy text-white hover:bg-brand-navy-600 h-11 px-5 text-base"
    >
      Tentar novamente
    </button>
  </main>
)

export default ErrorPage
