import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"

const options = [
  { id: "visible", label: "Curso visível no catálogo", description: "Alunos podem encontrar e se matricular.", checked: true },
  { id: "certificate", label: "Emitir certificado", description: "Gera certificado ao concluir 100% das aulas.", checked: true },
  { id: "comments", label: "Permitir comentários nas aulas", description: "Alunos podem comentar e tirar dúvidas.", checked: true },
  { id: "download", label: "Permitir download de materiais", description: "Libera o download dos anexos das aulas.", checked: false },
]

export const CourseSettingsTab = () => {
  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Preferências do curso</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-1">
          {options.map((option, i) => (
            <div key={option.id}>
              {i > 0 && <Separator className="my-1" />}
              <div className="flex items-center justify-between gap-4 py-2">
                <div>
                  <Label htmlFor={option.id} className="text-sm font-medium">
                    {option.label}
                  </Label>
                  <p className="text-xs text-muted-foreground">{option.description}</p>
                </div>
                <Switch id={option.id} defaultChecked={option.checked} />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card className="border-destructive/30">
        <CardHeader>
          <CardTitle className="text-base text-destructive">Zona de perigo</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-muted-foreground">
            Arquivar remove o curso do catálogo. Excluir é permanente e não pode ser desfeito.
          </p>
          <div className="flex shrink-0 gap-2">
            <Button variant="outline">Arquivar</Button>
            <Button variant="destructive">Excluir curso</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
