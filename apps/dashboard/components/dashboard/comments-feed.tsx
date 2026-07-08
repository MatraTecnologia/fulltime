"use client"

import * as React from "react"
import { MessageSquare, ThumbsUp } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { StarRating } from "@/components/dashboard/star-rating"
import { EmptyState } from "@/components/dashboard/empty-state"
import { initials } from "@/lib/utils"
import type { CommentItem } from "@/lib/mock/comments"

type Filter = "all" | "pending" | "answered"

const filters: { key: Filter; label: string }[] = [
  { key: "all", label: "Todos" },
  { key: "pending", label: "Pendentes" },
  { key: "answered", label: "Respondidos" },
]

const CommentCard = ({ comment }: { comment: CommentItem }) => {
  const pending = !comment.reply

  return (
    <Card className="gap-0 p-5">
      <div className="flex items-start gap-3">
        <Avatar>
          {comment.studentAvatarUrl && <AvatarImage src={comment.studentAvatarUrl} alt={comment.studentName} />}
          <AvatarFallback className="bg-primary/10 text-xs font-semibold text-primary">
            {initials(comment.studentName)}
          </AvatarFallback>
        </Avatar>

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-sm font-medium leading-tight">{comment.studentName}</p>
              <p className="mt-0.5 truncate text-xs text-muted-foreground">
                em {comment.courseTitle} · {comment.lessonTitle}
              </p>
            </div>
            <span className="shrink-0 text-xs text-muted-foreground">{comment.timeAgo}</span>
          </div>

          {comment.rating !== undefined && <StarRating value={comment.rating} className="mt-2" />}

          <p className="mt-2 text-sm leading-relaxed text-foreground">{comment.text}</p>

          <div className="mt-3 flex items-center gap-2">
            <Button size="sm">Responder</Button>
            <Button variant="ghost" size="sm" className="gap-1.5 text-muted-foreground">
              <ThumbsUp className="size-4" />
              Curtir
              {comment.likes > 0 && <span className="tabular-nums">{comment.likes}</span>}
            </Button>
            {pending && (
              <Badge variant="outline" className="ml-auto border-transparent bg-warning/10 font-medium text-warning">
                Pendente
              </Badge>
            )}
          </div>

          {comment.reply && (
            <div className="mt-4 border-l-2 border-primary/30 pl-4">
              <div className="flex items-center gap-2">
                <Avatar size="sm">
                  <AvatarFallback className="bg-primary/10 text-primary">
                    {initials(comment.reply.author)}
                  </AvatarFallback>
                </Avatar>
                <span className="text-sm font-medium">{comment.reply.author}</span>
                <span className="text-xs text-muted-foreground">respondeu · {comment.reply.timeAgo}</span>
              </div>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{comment.reply.text}</p>
            </div>
          )}
        </div>
      </div>
    </Card>
  )
}

export const CommentsFeed = ({ comments }: { comments: CommentItem[] }) => {
  const [filter, setFilter] = React.useState<Filter>("all")

  const visible = comments.filter((c) => {
    if (filter === "pending") return !c.reply
    if (filter === "answered") return !!c.reply
    return true
  })

  return (
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
  )
}
