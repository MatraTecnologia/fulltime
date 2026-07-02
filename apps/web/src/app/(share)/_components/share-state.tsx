import { Spinner } from '@/components/ui/spinner'

type Variant = 'loading' | 'notFound' | 'expired' | 'error'

const messages: Record<Exclude<Variant, 'loading'>, { emoji: string; title: string; description: string }> = {
  notFound: {
    emoji: '🔎',
    title: 'Link não encontrado',
    description: 'Este link de acompanhamento não existe. Confira se o endereço foi copiado por completo.',
  },
  expired: {
    emoji: '⏳',
    title: 'Link expirado',
    description: 'Este link não está mais ativo. Peça um novo para quem compartilhou o acompanhamento com você.',
  },
  error: {
    emoji: '🌦️',
    title: 'Algo não saiu como esperado',
    description: 'Não conseguimos carregar o acompanhamento agora. Tente novamente em alguns instantes.',
  },
}

export const ShareState = ({ variant }: { variant: Variant }) => {
  if (variant === 'loading') {
    return (
      <div className="flex min-h-[70vh] flex-col items-center justify-center gap-4 text-center">
        <Spinner className="size-9 text-brand-blue" />
        <p className="font-display text-lg font-bold text-brand-navy">Preparando a jornada…</p>
      </div>
    )
  }

  const { emoji, title, description } = messages[variant]
  return (
    <div className="flex min-h-[70vh] items-center justify-center">
      <div className="w-full rounded-card bg-white p-10 text-center shadow-card ring-1 ring-brand-navy/[0.06]">
        <span className="text-6xl" aria-hidden>{emoji}</span>
        <h1 className="mt-5 font-display text-2xl font-extrabold text-brand-navy">{title}</h1>
        <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-muted-foreground" role="alert">
          {description}
        </p>
      </div>
    </div>
  )
}
