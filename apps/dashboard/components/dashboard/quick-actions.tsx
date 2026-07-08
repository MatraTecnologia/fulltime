import { BarChart3, FileUp, MessageSquare, Plus, UploadCloud, type LucideIcon } from "lucide-react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

const actions: { label: string; description: string; icon: LucideIcon }[] = [
  { label: "Enviar novo conteúdo", description: "Vídeo, PDF ou material", icon: FileUp },
  { label: "Criar novo curso", description: "Do zero com IA ou manual", icon: Plus },
  { label: "Ver comentários", description: "Responda seus alunos", icon: MessageSquare },
  { label: "Ver relatórios", description: "Métricas detalhadas", icon: BarChart3 },
]

export const QuickActions = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Ações rápidas</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-2">
        {actions.map((action) => (
          <button
            key={action.label}
            className="flex items-center gap-3 rounded-lg border border-transparent p-2 text-left transition-colors hover:border-border hover:bg-accent/50"
          >
            <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <action.icon className="size-4.5" />
            </span>
            <span className="min-w-0">
              <span className="block text-sm font-medium">{action.label}</span>
              <span className="block truncate text-xs text-muted-foreground">{action.description}</span>
            </span>
          </button>
        ))}

        <div className="mt-2 rounded-xl border border-dashed border-primary/30 bg-primary/5 p-4 text-center">
          <UploadCloud className="mx-auto mb-2 size-7 text-primary" />
          <p className="text-sm font-medium">Enviar conteúdo</p>
          <p className="mb-3 text-xs text-muted-foreground">Vídeos, áudios, PDFs e documentos</p>
          <Button size="sm" className="w-full">
            Selecionar arquivo
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
