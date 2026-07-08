import { CheckCheck, Clock, MessageSquare } from "lucide-react"
import { PageHeader } from "@/components/dashboard/page-header"
import { StatCard } from "@/components/dashboard/stat-card"
import { CommentsFeed } from "@/components/dashboard/comments-feed"
import { comments } from "@/lib/mock/comments"
import { formatNumber } from "@/lib/utils"

const CommentsPage = () => {
  const total = comments.length
  const pending = comments.filter((c) => !c.reply).length
  const responseRate = Math.round(((total - pending) / total) * 100)

  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-6">
      <PageHeader
        title="Comentários"
        description="Acompanhe e responda os comentários dos seus alunos nas aulas."
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard label="Comentários totais" value={formatNumber(total)} icon={MessageSquare} />
        <StatCard label="Pendentes de resposta" value={formatNumber(pending)} icon={Clock} />
        <StatCard label="Taxa de resposta" value={`${responseRate}%`} icon={CheckCheck} />
      </div>

      <CommentsFeed comments={comments} />
    </div>
  )
}

export default CommentsPage
