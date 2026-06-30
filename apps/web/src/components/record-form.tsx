'use client'

import { useState } from 'react'
import { apiFetch, ApiError } from '@/lib/api'
import type { ChildRecord, ChildRecordType } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'

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
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="record-type">Tipo</Label>
        <Select value={type} onValueChange={(v) => setType(v as ChildRecordType)}>
          <SelectTrigger id="record-type" className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {(Object.entries(TYPE_LABELS) as [ChildRecordType, string][]).map(([value, label]) => (
              <SelectItem key={value} value={value}>{label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="record-content">Conteúdo</Label>
        <Textarea
          id="record-content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          required
          placeholder="Descrição do registro"
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="record-date">Data</Label>
        <Input
          id="record-date"
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
        />
      </div>
      {error && <p className="text-sm text-destructive" role="alert">{error}</p>}
      <Button type="submit" disabled={loading}>
        {loading ? 'Salvando...' : 'Criar registro'}
      </Button>
    </form>
  )
}

export default RecordForm
