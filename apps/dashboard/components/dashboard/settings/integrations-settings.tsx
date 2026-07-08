import { BarChart3, Mail, Video, Zap, type LucideIcon } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

interface Integration {
  key: string
  name: string
  description: string
  icon: LucideIcon
  connected: boolean
}

const integrations: Integration[] = [
  {
    key: "mux",
    name: "Mux",
    description: "Hospedagem e streaming dos vídeos das aulas.",
    icon: Video,
    connected: true,
  },
  {
    key: "smtp",
    name: "E-mail (SMTP)",
    description: "Envio de e-mails transacionais para seus alunos.",
    icon: Mail,
    connected: true,
  },
  {
    key: "analytics",
    name: "Google Analytics",
    description: "Acompanhe o tráfego e o comportamento no seu conteúdo.",
    icon: BarChart3,
    connected: false,
  },
  {
    key: "zapier",
    name: "Zapier",
    description: "Automatize fluxos conectando o painel a outros apps.",
    icon: Zap,
    connected: false,
  },
]

export const IntegrationsSettings = () => {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {integrations.map((integration) => (
        <Card key={integration.key} size="sm">
          <CardHeader>
            <div className="flex items-start justify-between gap-3">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-muted">
                <integration.icon className="size-5 text-muted-foreground" />
              </div>
              <Badge variant={integration.connected ? "default" : "outline"}>
                {integration.connected ? "Conectado" : "Desconectado"}
              </Badge>
            </div>
            <CardTitle className="mt-2">{integration.name}</CardTitle>
            <CardDescription>{integration.description}</CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              type="button"
              variant={integration.connected ? "outline" : "default"}
              size="sm"
              className="w-full"
            >
              {integration.connected ? "Gerenciar" : "Conectar"}
            </Button>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
