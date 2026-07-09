"use client"

import * as React from "react"
import { CheckCheck, Clock, MessageSquare, Send } from "lucide-react"
import { useInstructorComments, useReplyToComment } from "@/hooks/use-comments"
import { getApiErrorMessage } from "@/lib/api"
import { formatNumber, initials } from "@/lib/utils"
import { StatCard } from "@/components/dashboard/stat-card"
import { EmptyState } from "@/components/dashboard/empty-state"
import { QueryError } from "@/components/dashboard/query-error"
import { CommentsSkeleton } from "@/components/dashboard/skeletons/comments-skeleton"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import type { ApiComment } from "@/services/comments"

type Filter = "all" | "pending" | "answered"

const filters: { key: Filter; label: string }[] = [
  { key: "all", label: "Todos" },
  { key: "pending", label: "Pendentes" },
  { key: "answered", label: "Respondidos" },
]

const CommentCard = ({ comment }: { comment: ApiComment }) => {
  const [open, setOpen] = React.useState(false)
  const [text, setText] = React.useState("")
  const reply = useReplyToComment()

  const submit = () => {
    const content = text.trim()
    if (!content) return
    reply.mutate(
      { lessonId: comment.lessonId, content, parentId: comment.id },
      {
        onSuccess: () => {
          setText("")
          setOpen(false)
        },
      }
    )
  }

  return (
    <Card className="gap-0 p-5">
      <div className="flex items-start gap-3">
        <Avatar>
          {comment.student.avatarUrl && (
            <AvatarImage src={comment.student.avatarUrl} alt={comment.student.name} />
          )}
          <AvatarFallback className="bg-primary/10 text-xs font-semibold text-primary">
            {initials(comment.student.name)}
          </AvatarFallback>
        </Avatar>

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-sm font-medium leading-tight">{comment.student.name}</p>
              <p className="mt-0.5 truncate text-xs text-muted-foreground">
                em {comment.courseTitle} · {comment.lessonTitle}
              </p>
            </div>
            <span className="shrink-0 text-xs text-muted-foreground">{comment.timeAgo}</span>
          </div>

          <p className="mt-2 text-sm leading-relaxed text-foreground">{comment.content}</p>

          {comment.replies.length > 0 && (
            <div className="mt-3 flex flex-col gap-3 border-l-2 border-primary/20 pl-4">
              {comment.replies.map((r) => (
                <div key={r.id} className="flex items-start gap-2.5">
                  <Avatar className="size-7">
                    {r.author.avatarUrl && <AvatarImage src={r.author.avatarUrl} alt={r.author.name} />}
                    <AvatarFallback className="bg-primary/10 text-[0.65rem] font-semibold text-primary">
                      {initials(r.author.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-medium">{r.author.name}</span>
                      {r.isInstructor && (
                        <Badge variant="outline" className="border-transparent bg-primary/10 px-1.5 py-0 text-[0.65rem] font-medium text-primary">
                          Instrutor
                        </Badge>
                      )}
                      <span className="text-xs text-muted-foreground">· {r.timeAgo}</span>
                    </div>
                    <p className="mt-0.5 text-sm leading-relaxed text-foreground">{r.content}</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="mt-3 flex items-center gap-2">
            <Button size="sm" onClick={() => setOpen((v) => !v)}>
              Responder
            </Button>
            {comment.replied ? (
              <Badge variant="outline" className="ml-auto border-transparent bg-success/10 font-medium text-success">
                Respondido
              </Badge>
            ) : (
              <Badge variant="outline" className="ml-auto border-transparent bg-warning/10 font-medium text-warning">
                Pendente
              </Badge>
            )}
          </div>

          {open && (
            <div className="mt-3 flex flex-col gap-2">
              <Textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Escreva sua resposta..."
                rows={3}
              />
              <div className="flex items-center justify-end gap-2">
                <Button variant="ghost" size="sm" onClick={() => setOpen(false)} disabled={reply.isPending}>
                  Cancelar
                </Button>
                <Button size="sm" onClick={submit} disabled={reply.isPending || !text.trim()}>
                  <Send className="size-4" />
                  {reply.isPending ? "Enviando..." : "Enviar resposta"}
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </Card>
  )
}

export const CommentsFeedConnected = () => {
  const [filter, setFilter] = React.useState<Filter>("all")
  const comments = useInstructorComments()

  if (comments.isPending) return <CommentsSkeleton />
  if (comments.isError) {
    return <QueryError message={getApiErrorMessage(comments.error)} onRetry={() => comments.refetch()} />
  }

  const data = comments.data
  const total = data.length
  const pending = data.filter((c) => !c.replied).length
  const responseRate = total ? Math.round(((total - pending) / total) * 100) : 0

  const visible = data.filter((c) => {
    if (filter === "pending") return !c.replied
    if (filter === "answered") return c.replied
    return true
  })

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard label="Comentários totais" value={formatNumber(total)} icon={MessageSquare} />
        <StatCard label="Pendentes de resposta" value={formatNumber(pending)} icon={Clock} />
        <StatCard label="Taxa de resposta" value={`${responseRate}%`} icon={CheckCheck} />
      </div>

      <div className="flex flex-col gap-4">
        <Tabs value={filter} onValueChange={(v) => setFilter(v as Filter)}>
          <TabsList>
            {filters.map((f) => (
              <TabsTrigger key={f.key} value={f.key}>
                {f.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>

        {visible.length === 0 ? (
          <EmptyState
            icon={MessageSquare}
            title="Nenhum comentário nesta categoria"
            description="Assim que seus alunos comentarem nas aulas, eles aparecerão aqui."
          />
        ) : (
          <div className="flex flex-col gap-4">
            {visible.map((comment) => (
              <CommentCard key={comment.id} comment={comment} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
