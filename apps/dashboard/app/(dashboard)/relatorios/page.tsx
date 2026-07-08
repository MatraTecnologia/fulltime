import { Download } from "lucide-react"
import { PageHeader } from "@/components/dashboard/page-header"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { ReportsPanel } from "@/components/dashboard/reports-panel"

const ReportsPage = () => {
  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-6">
      <PageHeader
        title="Relatórios"
        description="Acompanhe o desempenho dos seus cursos, alunos e matrículas"
      >
        <Select
          defaultValue="30d"
          items={{ "7d": "Últimos 7 dias", "30d": "Últimos 30 dias", "90d": "Últimos 90 dias" }}
        >
          <SelectTrigger size="sm" className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7d">Últimos 7 dias</SelectItem>
            <SelectItem value="30d">Últimos 30 dias</SelectItem>
            <SelectItem value="90d">Últimos 90 dias</SelectItem>
          </SelectContent>
        </Select>
        <Button variant="outline">
          <Download />
          Exportar relatório
        </Button>
      </PageHeader>

      <ReportsPanel />
    </div>
  )
}

export default ReportsPage
