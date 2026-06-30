'use client'

import { useEffect, useState } from 'react'
import { apiFetch, ApiError } from '@/lib/api'
import type { Certificate, EnrollmentListItem } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardTitle } from '@/components/ui/card'
import { Spinner } from '@/components/ui/spinner'

interface Props {
  enrollment: EnrollmentListItem
}

export const CertificateCard = ({ enrollment }: Props) => {
  const [cert, setCert] = useState<Certificate | null>(null)
  const [loading, setLoading] = useState(true)
  const [issuing, setIssuing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    apiFetch<Certificate>(`/enrollments/${enrollment.id}/certificate`)
      .then(setCert)
      .catch((e) => {
        if (!(e instanceof ApiError && e.status === 404)) {
          setError(e instanceof ApiError ? e.message : 'Não foi possível verificar o certificado.')
        }
      })
      .finally(() => setLoading(false))
  }, [enrollment.id])

  const handleIssue = async () => {
    setIssuing(true)
    setError(null)
    try {
      const issued = await apiFetch<Certificate>(`/enrollments/${enrollment.id}/certificate`, { method: 'POST' })
      setCert(issued)
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'Não foi possível emitir o certificado.')
    } finally {
      setIssuing(false)
    }
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <Spinner />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardContent>
        <CardTitle>{enrollment.course.title}</CardTitle>

        {cert ? (
          <div className="mt-4">
            <div
              className="print-certificate rounded-xl border-4 border-brand-navy bg-white p-8 text-center"
              role="region"
              aria-label="Certificado de conclusão"
            >
              <div className="mb-6 border-b-4 border-brand-amber pb-4">
                <p className="font-display text-sm font-semibold uppercase tracking-widest text-brand-amber">
                  Full Time
                </p>
                <p className="mt-1 font-display text-xs font-medium uppercase tracking-wider text-brand-navy/60">
                  Certificado de Conclusão
                </p>
              </div>
              <p className="font-display text-2xl font-bold leading-tight text-brand-navy">
                {enrollment.course.title}
              </p>
              <div className="mt-6 text-sm text-brand-navy/70">
                <p>Código: <span className="font-mono font-semibold">{cert.code}</span></p>
                <p className="mt-1">Emitido em: {new Date(cert.issuedAt).toLocaleDateString('pt-BR')}</p>
              </div>
            </div>
            <div className="mt-4 flex justify-end">
              <Button variant="outline" size="sm" onClick={() => window.print()}>
                Imprimir
              </Button>
            </div>
          </div>
        ) : (
          <div className="mt-4">
            {error && (
              <p className="mb-3 text-sm text-destructive" role="alert">{error}</p>
            )}
            <Button onClick={handleIssue} disabled={issuing}>
              {issuing ? 'Emitindo…' : 'Emitir certificado'}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
