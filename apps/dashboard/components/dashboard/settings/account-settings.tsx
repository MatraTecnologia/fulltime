import { Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { instructorProfile } from "@/lib/mock/instructor"
import { Field, SelectField } from "./settings-shared"

const languages: Record<string, string> = {
  "pt-BR": "Português (Brasil)",
  "en-US": "Inglês (EUA)",
  "es-ES": "Espanhol",
}

const timezones: Record<string, string> = {
  "America/Sao_Paulo": "Brasília (GMT-3)",
  "America/Manaus": "Manaus (GMT-4)",
  "America/Rio_Branco": "Rio Branco (GMT-5)",
  "America/Noronha": "Fernando de Noronha (GMT-2)",
}

export const AccountSettings = () => {
  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Conta</CardTitle>
          <CardDescription>
            Configurações gerais de idioma e região da sua conta.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <Field label="E-mail da conta" htmlFor="account-email">
            <Input id="account-email" type="email" defaultValue={instructorProfile.email} />
          </Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <SelectField label="Idioma" items={languages} defaultValue="pt-BR" />
            <SelectField label="Fuso horário" items={timezones} defaultValue="America/Sao_Paulo" />
          </div>
          <div className="flex justify-end">
            <Button type="button">Salvar alterações</Button>
          </div>
        </CardContent>
      </Card>

      <Card className="ring-destructive/30">
        <CardHeader>
          <CardTitle className="text-destructive">Zona de perigo</CardTitle>
          <CardDescription>
            A exclusão da conta é permanente e remove todos os seus cursos e dados.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-3 rounded-lg border border-destructive/30 bg-destructive/5 p-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-medium">Excluir conta</p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                Esta ação não poderá ser desfeita.
              </p>
            </div>
            <Button type="button" variant="destructive" className="gap-1.5">
              <Trash2 className="size-4" />
              Excluir conta
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
