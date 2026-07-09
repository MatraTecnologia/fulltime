"use client"

import { useState } from "react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { Laptop } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { authClient, useSession } from "@/lib/auth-client"
import { Field, SettingRow } from "./settings-shared"

const formatDate = (value: Date | string) =>
  new Date(value).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  })

export const SecuritySettings = () => {
  const queryClient = useQueryClient()
  const { data: sessionData } = useSession()
  const currentToken = sessionData?.session.token

  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [changingPassword, setChangingPassword] = useState(false)

  const { data: sessions, isPending } = useQuery({
    queryKey: ["sessions"],
    queryFn: async () => {
      const { data, error } = await authClient.listSessions()
      if (error) throw new Error(error.message ?? "Não foi possível carregar as sessões.")
      return data
    },
  })

  const revoke = useMutation({
    mutationFn: async (token: string) => {
      const { error } = await authClient.revokeSession({ token })
      if (error) throw new Error(error.message ?? "Não foi possível encerrar a sessão.")
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sessions"] })
      toast.success("Sessão encerrada.")
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "Algo deu errado.")
    },
  })

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword) return
    if (newPassword !== confirmPassword) {
      toast.error("A confirmação não corresponde à nova senha.")
      return
    }

    setChangingPassword(true)
    const { error } = await authClient.changePassword({
      currentPassword,
      newPassword,
      revokeOtherSessions: true,
    })
    setChangingPassword(false)

    if (error) {
      toast.error(error.message ?? "Não foi possível alterar a senha.")
      return
    }

    toast.success("Senha atualizada com sucesso.")
    setCurrentPassword("")
    setNewPassword("")
    setConfirmPassword("")
    queryClient.invalidateQueries({ queryKey: ["sessions"] })
  }

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Alterar senha</CardTitle>
          <CardDescription>
            Use uma senha forte que você não utilize em outros serviços.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <Field label="Senha atual" htmlFor="current-password">
            <Input
              id="current-password"
              type="password"
              placeholder="••••••••"
              value={currentPassword}
              onChange={(event) => setCurrentPassword(event.target.value)}
            />
          </Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Nova senha" htmlFor="new-password">
              <Input
                id="new-password"
                type="password"
                placeholder="••••••••"
                value={newPassword}
                onChange={(event) => setNewPassword(event.target.value)}
              />
            </Field>
            <Field label="Confirmar nova senha" htmlFor="confirm-password">
              <Input
                id="confirm-password"
                type="password"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
              />
            </Field>
          </div>
          <div className="flex justify-end">
            <Button
              type="button"
              onClick={handleChangePassword}
              disabled={!currentPassword || !newPassword || changingPassword}
            >
              {changingPassword ? "Atualizando..." : "Atualizar senha"}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Autenticação em duas etapas</CardTitle>
          <CardDescription>
            Adicione uma camada extra de segurança ao entrar na sua conta.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <SettingRow
            label="Autenticação em duas etapas (2FA)"
            description="Receba um código de verificação a cada novo acesso."
          >
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">Em breve</span>
              <Switch disabled />
            </div>
          </SettingRow>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Sessões ativas</CardTitle>
          <CardDescription>
            Dispositivos conectados atualmente na sua conta.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col">
          {isPending ? (
            <div className="flex flex-col gap-3">
              <Skeleton className="h-12" />
              <Skeleton className="h-12" />
            </div>
          ) : sessions && sessions.length > 0 ? (
            sessions.map((session, index) => {
              const isCurrent = session.token === currentToken
              return (
                <div key={session.id}>
                  {index > 0 && <Separator />}
                  <div className="flex items-center justify-between gap-4 py-3">
                    <div className="flex min-w-0 items-center gap-3">
                      <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted">
                        <Laptop className="size-4 text-muted-foreground" />
                      </div>
                      <div className="min-w-0">
                        <p className="flex items-center gap-2 text-sm font-medium">
                          <span className="truncate">
                            {session.userAgent ?? "Dispositivo desconhecido"}
                          </span>
                          {isCurrent && (
                            <span className="shrink-0 text-xs font-normal text-primary">
                              Este dispositivo
                            </span>
                          )}
                        </p>
                        <p className="mt-0.5 text-xs text-muted-foreground">
                          Iniciada em {formatDate(session.createdAt)}
                        </p>
                      </div>
                    </div>
                    {!isCurrent && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="text-destructive"
                        disabled={revoke.isPending}
                        onClick={() => revoke.mutate(session.token)}
                      >
                        Encerrar
                      </Button>
                    )}
                  </div>
                </div>
              )
            })
          ) : (
            <p className="py-3 text-sm text-muted-foreground">Nenhuma sessão ativa encontrada.</p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
