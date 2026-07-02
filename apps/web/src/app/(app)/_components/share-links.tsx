'use client'

import { useEffect, useState } from 'react'
import {
  Check,
  ClipboardList,
  Copy,
  Link2,
  Share2,
  Sparkles,
  Trash2,
} from 'lucide-react'
import { apiFetch, ApiError } from '@/lib/api'
import type { ChildShareLink, ShareMode } from '@/lib/types'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Spinner } from '@/components/ui/spinner'

const MODES: {
  value: ShareMode
  label: string
  desc: string
  Icon: typeof Sparkles
}[] = [
  {
    value: 'CRIANCA',
    label: 'Visão da criança',
    desc: 'Jornada lúdica com conquistas e progresso. Não expõe dados clínicos.',
    Icon: Sparkles,
  },
  {
    value: 'RESPONSAVEL',
    label: 'Acompanhamento completo',
    desc: 'Registros completos (evolução, sessões e PEI) para o responsável.',
    Icon: ClipboardList,
  },
]

const MODE_LABEL: Record<ShareMode, string> = {
  CRIANCA: 'Visão da criança',
  RESPONSAVEL: 'Acompanhamento completo',
}

const PRESETS = [7, 30, 90]

const isExpired = (link: ChildShareLink) =>
  new Date(link.expiresAt).getTime() < Date.now()

const formatDate = (value: string) =>
  new Date(value).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })

export const ShareLinks = ({ childId }: { childId: string }) => {
  const [links, setLinks] = useState<ChildShareLink[] | null>(null)
  const [mode, setMode] = useState<ShareMode>('RESPONSAVEL')
  const [expiresInDays, setExpiresInDays] = useState(30)
  const [generating, setGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [copiedId, setCopiedId] = useState<string | null>(null)

  useEffect(() => {
    apiFetch<ChildShareLink[]>(`/children/${childId}/share-links`)
      .then((data) => setLinks(data.filter((l) => !l.revokedAt)))
      .catch((e) =>
        setError(e instanceof ApiError ? e.message : 'Não foi possível carregar os links.'),
      )
  }, [childId])

  const handleGenerate = async () => {
    setGenerating(true)
    setError(null)
    try {
      const link = await apiFetch<ChildShareLink>(`/children/${childId}/share-links`, {
        method: 'POST',
        body: JSON.stringify({ mode, expiresInDays }),
      })
      setLinks((prev) => [link, ...(prev ?? [])])
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'Não foi possível gerar o link.')
    } finally {
      setGenerating(false)
    }
  }

  const handleRevoke = async (id: string) => {
    if (!window.confirm('Revogar este link? Quem tiver a URL perderá o acesso.')) return
    try {
      await apiFetch(`/share-links/${id}`, { method: 'DELETE' })
      setLinks((prev) => (prev ?? []).filter((l) => l.id !== id))
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'Não foi possível revogar o link.')
    }
  }

  const handleCopy = async (link: ChildShareLink) => {
    const url = `${window.location.origin}/acompanhamento/${link.token}`
    await navigator.clipboard.writeText(url)
    setCopiedId(link.id)
    setTimeout(() => setCopiedId((cur) => (cur === link.id ? null : cur)), 2000)
  }

  return (
    <section className="rounded-card bg-white p-6 shadow-card ring-1 ring-brand-navy/[0.06] sm:p-8">
      <div className="flex items-center gap-3">
        <span className="inline-flex size-10 items-center justify-center rounded-xl bg-brand-amber/15 text-brand-amber-strong [&_svg]:size-5">
          <Share2 />
        </span>
        <div>
          <h2 className="font-display text-lg font-bold tracking-tight text-brand-navy">
            Compartilhar acompanhamento
          </h2>
          <p className="text-sm text-muted-foreground">
            Gere um link seguro e escolha o que a pessoa poderá ver.
          </p>
        </div>
      </div>

      <div className="mt-6 space-y-5">
        <fieldset>
          <legend className="mb-2 text-sm font-semibold text-brand-navy">
            O que compartilhar
          </legend>
          <RadioGroup
            value={mode}
            onValueChange={(v) => setMode(v as ShareMode)}
            className="grid gap-3 sm:grid-cols-2"
          >
            {MODES.map((opt) => (
              <label
                key={opt.value}
                htmlFor={`mode-${opt.value}`}
                className={cn(
                  'flex cursor-pointer gap-3 rounded-xl border p-4 transition',
                  mode === opt.value
                    ? 'border-brand-blue bg-brand-blue/5 ring-1 ring-brand-blue'
                    : 'border-hairline hover:border-brand-navy/20',
                )}
              >
                <RadioGroupItem value={opt.value} id={`mode-${opt.value}`} className="mt-0.5" />
                <div className="space-y-1">
                  <span className="flex items-center gap-1.5 font-semibold text-brand-navy">
                    <opt.Icon className="size-4" />
                    {opt.label}
                  </span>
                  <p className="text-xs text-muted-foreground">{opt.desc}</p>
                </div>
              </label>
            ))}
          </RadioGroup>
        </fieldset>

        <div>
          <p className="mb-2 text-sm font-semibold text-brand-navy">Validade</p>
          <div className="flex flex-wrap gap-2">
            {PRESETS.map((d) => (
              <button
                key={d}
                type="button"
                onClick={() => setExpiresInDays(d)}
                aria-pressed={expiresInDays === d}
                className={cn(
                  'rounded-pill border px-4 py-1.5 text-sm font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue',
                  expiresInDays === d
                    ? 'border-brand-navy bg-brand-navy text-white'
                    : 'border-hairline text-brand-navy hover:border-brand-navy/30',
                )}
              >
                {d} dias
              </button>
            ))}
          </div>
        </div>

        {error && (
          <p role="alert" className="text-sm text-destructive">
            {error}
          </p>
        )}

        <Button
          onClick={handleGenerate}
          disabled={generating}
          className="bg-brand-amber font-semibold text-brand-navy hover:bg-brand-amber/90"
        >
          <Link2 className="size-4" />
          {generating ? 'Gerando…' : 'Gerar link'}
        </Button>
      </div>

      <div className="mt-8">
        <h3 className="text-sm font-semibold text-brand-navy">Links ativos</h3>
        {links === null ? (
          <div className="flex justify-center py-8">
            <Spinner className="size-6" />
          </div>
        ) : links.length === 0 ? (
          <p className="mt-3 rounded-xl border border-dashed border-hairline px-4 py-6 text-center text-sm text-muted-foreground">
            Nenhum link ativo. Gere um acima para compartilhar.
          </p>
        ) : (
          <ul className="mt-3 space-y-3">
            {links.map((link) => {
              const expired = isExpired(link)
              return (
                <li
                  key={link.id}
                  className="flex flex-col gap-3 rounded-xl border border-hairline p-4 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="min-w-0 space-y-1.5">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="inline-flex items-center gap-1.5 rounded-pill bg-brand-navy-50 px-2.5 py-0.5 text-xs font-semibold text-brand-navy">
                        {link.mode === 'CRIANCA' ? (
                          <Sparkles className="size-3" />
                        ) : (
                          <ClipboardList className="size-3" />
                        )}
                        {MODE_LABEL[link.mode]}
                      </span>
                      <span
                        className={cn(
                          'inline-flex items-center gap-1 rounded-pill px-2 py-0.5 text-[11px] font-semibold',
                          expired
                            ? 'bg-muted text-muted-foreground'
                            : 'bg-brand-green/15 text-brand-green-strong',
                        )}
                      >
                        {expired ? 'Expirado' : 'Ativo'}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {expired ? 'Expirou' : 'Expira'} em {formatDate(link.expiresAt)}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleCopy(link)}
                      disabled={expired}
                    >
                      {copiedId === link.id ? (
                        <>
                          <Check className="size-4 text-brand-green-strong" />
                          Copiado
                        </>
                      ) : (
                        <>
                          <Copy className="size-4" />
                          Copiar
                        </>
                      )}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleRevoke(link.id)}
                      className="text-destructive hover:text-destructive"
                      aria-label="Revogar link"
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </div>
                </li>
              )
            })}
          </ul>
        )}
      </div>
    </section>
  )
}
