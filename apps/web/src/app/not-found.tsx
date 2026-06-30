import Link from 'next/link'

const NotFound = () => (
  <main className="flex min-h-screen flex-col items-center justify-center gap-6 px-6 text-center">
    <p className="font-display text-sm font-semibold uppercase tracking-widest text-brand-amber">
      Full Time
    </p>
    <h1 className="font-display text-6xl font-extrabold text-brand-navy">404</h1>
    <p className="text-lg text-brand-navy/70">Esta página não existe ou foi movida.</p>
    <Link
      href="/"
      className="inline-flex items-center justify-center rounded-lg font-display font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue focus-visible:ring-offset-2 bg-brand-navy text-white hover:bg-brand-navy-600 h-11 px-5 text-base"
    >
      Voltar ao início
    </Link>
  </main>
)

export default NotFound
