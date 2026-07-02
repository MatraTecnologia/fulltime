import type { ReactNode } from 'react'

const ShareLayout = ({ children }: { children: ReactNode }) => (
  <div className="relative min-h-dvh overflow-hidden bg-surface">
    <div
      aria-hidden
      className="pointer-events-none absolute inset-x-0 top-0 h-72 bg-gradient-to-b from-brand-blue/[0.08] via-brand-purple/[0.05] to-transparent"
    />
    <main className="relative mx-auto w-full max-w-3xl px-5 py-10 sm:px-8 sm:py-14">
      {children}
    </main>
  </div>
)

export default ShareLayout
