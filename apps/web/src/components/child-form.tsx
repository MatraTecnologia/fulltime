'use client'

import { useState } from 'react'
import { apiFetch, ApiError } from '@/lib/api'
import type { Child } from '@/lib/types'
import { Button, Field, Input, Textarea } from '@fulltime/ui'

interface ChildFormProps {
  onCreated: (child: Child) => void
}

const ChildForm = ({ onCreated }: ChildFormProps) => {
  const [name, setName] = useState('')
  const [birthDate, setBirthDate] = useState('')
  const [diagnosis, setDiagnosis] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      const child = await apiFetch<Child>('/children', {
        method: 'POST',
        body: JSON.stringify({
          name,
          birthDate: birthDate || undefined,
          diagnosis: diagnosis || undefined,
        }),
      })
      onCreated(child)
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Não foi possível criar a criança.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <Field label="Nome" htmlFor="child-name">
        <Input
          id="child-name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          placeholder="Nome da criança"
        />
      </Field>
      <Field label="Data de nascimento" htmlFor="child-birth">
        <Input
          id="child-birth"
          type="date"
          value={birthDate}
          onChange={(e) => setBirthDate(e.target.value)}
        />
      </Field>
      <Field label="Diagnóstico" htmlFor="child-diagnosis">
        <Textarea
          id="child-diagnosis"
          value={diagnosis}
          onChange={(e) => setDiagnosis(e.target.value)}
          placeholder="Diagnóstico (opcional)"
        />
      </Field>
      {error && <p className="text-sm text-red-600" role="alert">{error}</p>}
      <Button type="submit" disabled={loading}>
        {loading ? 'Salvando...' : 'Criar criança'}
      </Button>
    </form>
  )
}

export default ChildForm
