'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { signUp } from '@/lib/auth-client'
import { Button, Card, CardContent, CardTitle, Field, Input } from '@fulltime/ui'

const CadastroPage = () => {
  const router = useRouter()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true); setError('')
    const { error } = await signUp.email({ name, email, password })
    setLoading(false)
    if (error) return setError(error.message ?? 'Falha no cadastro.')
    router.push('/verificar')
  }

  return (
    <Card>
      <CardContent>
        <CardTitle>Criar conta</CardTitle>
        <form onSubmit={onSubmit} className="mt-6 space-y-4">
          <Field label="Nome" htmlFor="name">
            <Input id="name" type="text" value={name} onChange={(e) => setName(e.target.value)} required />
          </Field>
          <Field label="E-mail" htmlFor="email">
            <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </Field>
          <Field label="Senha" htmlFor="password">
            <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          </Field>
          {error && <p className="text-sm text-red-600" role="alert">{error}</p>}
          <Button type="submit" disabled={loading} className="w-full">{loading ? 'Criando conta…' : 'Criar conta'}</Button>
        </form>
        <div className="mt-4 text-center text-sm text-brand-navy/70">
          <a href="/login" className="hover:underline">Já tenho conta</a>
        </div>
      </CardContent>
    </Card>
  )
}

export default CadastroPage
