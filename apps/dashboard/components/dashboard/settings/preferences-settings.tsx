"use client"

import { useEffect, useState } from "react"
import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"
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
import { Field, SelectField, SettingRow } from "./settings-shared"

const themes: Record<string, string> = {
  light: "Claro",
  dark: "Escuro",
  system: "Sistema",
}

const languages: Record<string, string> = {
  "pt-BR": "Português (Brasil)",
  "en-US": "Inglês (EUA)",
  "es-ES": "Espanhol",
}

const preferences = [
  {
    id: "compact",
    label: "Modo compacto",
    description: "Reduz o espaçamento das listas e tabelas.",
    defaultChecked: false,
  },
  {
    id: "autoplay",
    label: "Reprodução automática",
    description: "Inicia a próxima aula automaticamente ao concluir uma.",
    defaultChecked: true,
  },
  {
    id: "sound",
    label: "Efeitos sonoros",
    description: "Toca sons ao concluir ações no painel.",
    defaultChecked: false,
  },
  {
    id: "tips",
    label: "Dicas e novidades no painel",
    description: "Exibe cartões com sugestões e recursos recentes.",
    defaultChecked: true,
  },
]

export const PreferencesSettings = () => {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => setMounted(true), [])

  return (
    <Card>
      <CardHeader>
        <CardTitle>Preferências</CardTitle>
        <CardDescription>
          Personalize a aparência e o comportamento do painel.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-6">
        <div className="grid gap-4 sm:grid-cols-2">
          {mounted ? (
            <SelectField label="Tema" items={themes} value={theme} onValueChange={setTheme} />
          ) : (
            <Field label="Tema">
              <Skeleton className="h-9 w-full" />
            </Field>
          )}
          <SelectField label="Idioma" items={languages} defaultValue="pt-BR" />
        </div>

        <Separator />

        <div className="flex flex-col divide-y divide-border">
          {preferences.map((pref) => (
            <SettingRow key={pref.id} label={pref.label} description={pref.description}>
              <Switch defaultChecked={pref.defaultChecked} />
            </SettingRow>
          ))}
        </div>

        <div className="flex justify-end">
          <Button type="button">Salvar preferências</Button>
        </div>
      </CardContent>
    </Card>
  )
}
