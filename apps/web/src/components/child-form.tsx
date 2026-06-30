'use client'

import { useState } from 'react'
import { apiFetch, ApiError } from '@/lib/api'
import type { Child } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'

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
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="child-name">Nome</Label>
        <Input
          id="child-name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          placeholder="Nome da criança"
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="child-birth">Data de nascimento</Label>
        <Input
          id="child-birth"
          type="date"
          value={birthDate}
          onChange={(e) => setBirthDate(e.target.value)}
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="child-diagnosis">Diagnóstico</Label>
        <Textarea
          id="child-diagnosis"
          value={diagnosis}
          onChange={(e) => setDiagnosis(e.target.value)}
          placeholder="Diagnóstico (opcional)"
        />
      </div>
      {error && <p className="text-sm text-destructive" role="alert">{error}</p>}
      <Button type="submit" disabled={loading}>
        {loading ? 'Salvando...' : 'Criar criança'}
      </Button>
    </form>
  )
}

export default ChildForm
