import { GraduationCap, Plus, TrendingUp, Users } from "lucide-react"
import { PageHeader } from "@/components/dashboard/page-header"
import { StatCard } from "@/components/dashboard/stat-card"
import { Button } from "@/components/ui/button"
import { ClassesBoard } from "@/components/dashboard/classes-board"
import { classGroups } from "@/lib/mock/classes"
import { formatNumber } from "@/lib/utils"

const TurmasPage = () => {
  const active = classGroups.filter((g) => g.status === "active")
  const totalStudents = classGroups.reduce((sum, g) => sum + g.students, 0)
  const avgProgress = Math.round(
    active.reduce((sum, g) => sum + g.progress, 0) / (active.length || 1)
  )

  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-6">
      <PageHeader title="Turmas" description="Organize seus alunos em turmas por período e acompanhe o progresso.">
        <Button className="gap-1.5">
          <Plus className="size-4" />
          Nova turma
        </Button>
      </PageHeader>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard label="Turmas ativas" value={String(active.length)} icon={GraduationCap} />
        <StatCard label="Alunos em turmas" value={formatNumber(totalStudents)} icon={Users} />
        <StatCard label="Progresso médio" value={`${avgProgress}%`} icon={TrendingUp} />
      </div>

      <ClassesBoard groups={classGroups} />
    </div>
  )
}

export default TurmasPage
