"use client"

import * as React from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { AlertCircle, Loader2 } from "lucide-react"
import { signIn, authClient } from "@/lib/auth-client"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"

const safeNext = (raw: string | null) => {
  if (!raw || !raw.startsWith("/") || raw.startsWith("//") || raw.includes("\\")) return "/"
  return raw
}

export const LoginForm = () => {
  const router = useRouter()
  const params = useSearchParams()

  const [email, setEmail] = React.useState("")
  const [password, setPassword] = React.useState("")
  const [remember, setRemember] = React.useState(true)
  const [error, setError] = React.useState("")
  const [notice, setNotice] = React.useState("")
  const [loading, setLoading] = React.useState(false)
  const [unverified, setUnverified] = React.useState(false)
  const [resending, setResending] = React.useState(false)

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")
    setNotice("")
    setUnverified(false)
    try {
      const { error } = await signIn.email({ email, password, rememberMe: remember })
      if (error) {
        if (error.status === 403) {
          setUnverified(true)
          setError("Seu e-mail ainda não foi verificado. Confira sua caixa de entrada ou reenvie o link abaixo.")
        } else {
          setError(error.message ?? "E-mail ou senha incorretos. Tente novamente.")
        }
        return
      }
      router.replace(safeNext(params.get("next")))
    } catch {
      setError("Não foi possível conectar ao servidor. Verifique sua conexão e tente novamente.")
    } finally {
      setLoading(false)
    }
  }

  const onResend = async () => {
    setResending(true)
    const { error } = await authClient.sendVerificationEmail({ email, callbackURL: `${window.location.origin}/` })
    setResending(false)
    if (error) {
      setError("Não foi possível reenviar agora. Tente novamente em instantes.")
    } else {
      setError("")
      setUnverified(false)
      setNotice("E-mail reenviado. Confira sua caixa de entrada (e o spam).")
    }
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4">
      <div className="grid gap-2">
        <Label htmlFor="email">E-mail</Label>
        <Input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoComplete="email"
          placeholder="voce@exemplo.com"
          required
        />
      </div>

      <div className="grid gap-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="password">Senha</Label>
          <a href="/recuperar-senha" className="text-xs font-medium text-primary hover:underline">
            Esqueci minha senha
          </a>
        </div>
        <Input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="current-password"
          placeholder="••••••••"
          required
        />
      </div>

      <label className="flex cursor-pointer items-center gap-2 text-sm text-muted-foreground">
        <Checkbox checked={remember} onCheckedChange={(v) => setRemember(v === true)} />
        Manter conectado
      </label>

      {error && (
        <div className="flex flex-col gap-2 rounded-lg border border-destructive/20 bg-destructive/5 p-3 text-sm text-destructive">
          <span className="flex items-start gap-2">
            <AlertCircle className="mt-0.5 size-4 shrink-0" />
            {error}
          </span>
          {unverified && (
            <button
              type="button"
              onClick={onResend}
              disabled={resending}
              className="self-start text-sm font-semibold underline disabled:opacity-60"
            >
              {resending ? "Reenviando…" : "Reenviar e-mail de verificação"}
            </button>
          )}
        </div>
      )}
      {notice && (
        <div className="rounded-lg border border-success/20 bg-success/5 p-3 text-sm text-success">{notice}</div>
      )}

      <Button type="submit" disabled={loading} className="mt-1 w-full gap-2">
        {loading && <Loader2 className="size-4 animate-spin" />}
        {loading ? "Entrando…" : "Entrar"}
      </Button>

      <p className="text-center text-xs text-muted-foreground">
        Precisa de ajuda?{" "}
        <a href="mailto:matratecnologia@gmail.com" className="font-medium text-foreground hover:underline">
          Falar com o suporte
        </a>
      </p>
    </form>
  )
}
