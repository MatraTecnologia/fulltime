import { PageHeader } from "@/components/dashboard/page-header"
import { CommentsFeedConnected } from "@/components/dashboard/comments-feed-connected"

const CommentsPage = () => {
  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-6">
      <PageHeader
        title="Comentários"
        description="Acompanhe e responda os comentários dos seus alunos nas aulas."
      />

      <CommentsFeedConnected />
    </div>
  )
}

export default CommentsPage
