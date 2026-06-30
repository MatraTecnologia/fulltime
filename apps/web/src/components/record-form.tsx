'use client'

import { useState } from 'react'
import { apiFetch, ApiError } from '@/lib/api'
import type { ChildRecord, ChildRecordType } from '@/lib/types'
import { Button, Field, Input, Select, Textarea } from '@fulltime/ui'

interface RecordFormProps {
  childId: string
  onCreated: (r: ChildRecord) => void
}

const TYPE_LABELS: Record<ChildRecordType, string> = {
  EVOLUCAO: 'Evolução',
  SESSAO: 'Sessão',
  PEI: 'PEI',
}

const RecordForm = ({ childId, onCreated }: RecordFormProps) => {
  const [type, setType] = useState<ChildRecordType>('EVOLUCAO')
  const [content, setContent] = useState('')
  const [date, setDate] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      const record = await apiFetch<ChildRecord>(`/children/${childId}/records`, {
        method: 'POST',
        body: JSON.stringify({
          type,
          content,
          date: date || undefined,
        }),
      })
      onCreated(record)
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Não foi possível criar o registro.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <Field label="Tipo" htmlFor="record-type">
        <Select
          id="record-type"
          value={type}
          onChange={(e) => setType(e.target.value as ChildRecordType)}
        >
          {(Object.entries(TYPE_LABELS) as [ChildRecordType, string][]).map(([value, label]) => (
            <option key={value} value={value}>{label}</option>
          ))}
        </Select>
      </Field>
      <Field label="Conteúdo" htmlFor="record-content">
        <Textarea
          id="record-content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          required
          placeholder="Descrição do registro"
        />
      </Field>
      <Field label="Data" htmlFor="record-date">
        <Input
          id="record-date"
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
        />
      </Field>
      {error && <p className="text-sm text-red-600" role="alert">{error}</p>}
      <Button type="submit" disabled={loading}>
        {loading ? 'Salvando...' : 'Criar registro'}
      </Button>
    </form>
  )
}

export default RecordForm
