import { Mail, Smartphone } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

interface NotificationChannel {
  key: string
  label: string
  email: boolean
  push: boolean
}

const notifications: NotificationChannel[] = [
  { key: "enrollment", label: "Novo aluno inscrito", email: true, push: true },
  { key: "comment", label: "Novo comentário em meus cursos", email: true, push: false },
  { key: "rating", label: "Avaliação recebida", email: true, push: true },
  { key: "completion", label: "Conclusão de curso", email: false, push: true },
  { key: "certificate", label: "Certificado emitido", email: true, push: false },
  { key: "newsletter", label: "Boletim e novidades", email: false, push: false },
]

const NotificationColumn = ({
  channel,
  icon: Icon,
  title,
  values,
}: {
  channel: "email" | "push"
  icon: typeof Mail
  title: string
  values: NotificationChannel[]
}) => {
  return (
    <div className="flex flex-col gap-1 rounded-lg border border-border p-4">
      <div className="mb-2 flex items-center gap-2">
        <Icon className="size-4 text-muted-foreground" />
        <p className="text-sm font-medium">{title}</p>
      </div>
      {values.map((item) => {
        const id = `${channel}-${item.key}`
        return (
          <div key={id} className="flex items-center justify-between gap-4 py-2">
            <Label htmlFor={id} className="font-normal text-muted-foreground">
              {item.label}
            </Label>
            <Switch id={id} defaultChecked={item[channel]} />
          </div>
        )
      })}
    </div>
  )
}

export const NotificationsSettings = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Notificações</CardTitle>
        <CardDescription>
          Escolha como deseja ser avisado sobre a atividade dos seus cursos.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-6">
        <div className="grid gap-4 sm:grid-cols-2">
          <NotificationColumn channel="email" icon={Mail} title="E-mail" values={notifications} />
          <NotificationColumn channel="push" icon={Smartphone} title="Push" values={notifications} />
        </div>
        <div className="flex justify-end">
          <Button type="button">Salvar preferências</Button>
        </div>
      </CardContent>
    </Card>
  )
}
