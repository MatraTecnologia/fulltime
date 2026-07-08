import { Laptop, Smartphone } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Field, SettingRow } from "./settings-shared"

const sessions = [
  {
    id: "ses_1",
    device: "MacBook Pro — Chrome",
    location: "São Paulo, BR",
    current: true,
    icon: Laptop,
  },
  {
    id: "ses_2",
    device: "iPhone 15 — Safari",
    location: "São Paulo, BR",
    current: false,
    icon: Smartphone,
  },
  {
    id: "ses_3",
    device: "Windows — Edge",
    location: "Londrina, BR",
    current: false,
    icon: Laptop,
  },
]

export const SecuritySettings = () => {
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
            <Input id="current-password" type="password" placeholder="••••••••" />
          </Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Nova senha" htmlFor="new-password">
              <Input id="new-password" type="password" placeholder="••••••••" />
            </Field>
            <Field label="Confirmar nova senha" htmlFor="confirm-password">
              <Input id="confirm-password" type="password" placeholder="••••••••" />
            </Field>
          </div>
          <div className="flex justify-end">
            <Button type="button">Atualizar senha</Button>
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
            <Switch defaultChecked />
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
          {sessions.map((session, index) => (
            <div key={session.id}>
              {index > 0 && <Separator />}
              <div className="flex items-center justify-between gap-4 py-3">
                <div className="flex min-w-0 items-center gap-3">
                  <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted">
                    <session.icon className="size-4 text-muted-foreground" />
                  </div>
                  <div className="min-w-0">
                    <p className="flex items-center gap-2 text-sm font-medium">
                      <span className="truncate">{session.device}</span>
                      {session.current && (
                        <span className="text-xs font-normal text-primary">Este dispositivo</span>
                      )}
                    </p>
                    <p className="mt-0.5 text-xs text-muted-foreground">{session.location}</p>
                  </div>
                </div>
                {!session.current && (
                  <Button type="button" variant="ghost" size="sm" className="text-destructive">
                    Encerrar
                  </Button>
                )}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}
