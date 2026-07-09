import { PageHeader } from "@/components/dashboard/page-header"
import { GradingConnected } from "@/components/dashboard/exam-grading/grading-connected"

const GradingPage = () => {
  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-6">
      <PageHeader
        title="Correções"
        description="Corrija manualmente as questões dissertativas das provas enviadas pelos alunos."
      />

      <GradingConnected />
    </div>
  )
}

export default GradingPage
