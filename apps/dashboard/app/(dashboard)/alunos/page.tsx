import { Download } from "lucide-react"
import { PageHeader } from "@/components/dashboard/page-header"
import { Button } from "@/components/ui/button"
import { StudentsTable } from "@/components/dashboard/students-table"
import { students } from "@/lib/mock/students"

const StudentsPage = () => {
  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-6">
      <PageHeader title="Alunos" description="Acompanhe o progresso e o engajamento dos seus alunos.">
        <Button variant="outline" className="gap-1.5">
          <Download className="size-4" />
          Exportar
        </Button>
      </PageHeader>

      <StudentsTable students={students} />
    </div>
  )
}

export default StudentsPage
