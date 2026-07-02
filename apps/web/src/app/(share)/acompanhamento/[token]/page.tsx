'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { apiFetch, ApiError } from '@/lib/api'
import type { AcompanhamentoPayload } from '@/lib/types'
import { CriancaView } from '../../_components/crianca-view'
import { ResponsavelView } from '../../_components/responsavel-view'
import { ShareState } from '../../_components/share-state'

type Status = 'loading' | 'ok' | 'notFound' | 'expired' | 'error'

const AcompanhamentoPage = () => {
  const { token } = useParams<{ token: string }>()
  const [payload, setPayload] = useState<AcompanhamentoPayload | null>(null)
  const [status, setStatus] = useState<Status>('loading')

  useEffect(() => {
    apiFetch<AcompanhamentoPayload>(`/acompanhamento/${token}`)
      .then((data) => {
        setPayload(data)
        setStatus('ok')
      })
      .catch((e) => {
        if (e instanceof ApiError && e.status === 404) setStatus('notFound')
        else if (e instanceof ApiError && e.status === 410) setStatus('expired')
        else setStatus('error')
      })
  }, [token])

  if (status === 'loading') return <ShareState variant="loading" />
  if (status === 'notFound') return <ShareState variant="notFound" />
  if (status === 'expired') return <ShareState variant="expired" />
  if (status === 'error' || !payload) return <ShareState variant="error" />

  return payload.mode === 'CRIANCA'
    ? <CriancaView data={payload} />
    : <ResponsavelView data={payload} />
}

export default AcompanhamentoPage
