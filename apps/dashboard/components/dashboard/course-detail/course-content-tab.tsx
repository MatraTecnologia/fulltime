"use client"

import {
  Download,
  FileText,
  FolderPlus,
  GripVertical,
  ListChecks,
  MoreVertical,
  Paperclip,
  Video,
  type LucideIcon,
} from "lucide-react"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { AddContentSheet } from "@/components/dashboard/course-detail/add-content-sheet"
import type { CourseModule, LessonType } from "@/lib/mock/course-detail"

const lessonIcon: Record<LessonType, LucideIcon> = {
  video: Video,
  text: FileText,
  pdf: FileText,
  quiz: ListChecks,
}

const lessonTypeLabel: Record<LessonType, string> = {
  video: "Vídeo",
  text: "Texto",
  pdf: "PDF",
  quiz: "Quiz",
}

export const CourseContentTab = ({ modules }: { modules: CourseModule[] }) => {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-base font-semibold">Estrutura do curso</h2>
          <p className="text-sm text-muted-foreground">
            Organize os módulos, adicione aulas e anexe materiais para os alunos.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" className="gap-1.5">
            <FolderPlus className="size-4" />
            Adicionar módulo
          </Button>
          <AddContentSheet />
        </div>
      </div>

      <Accordion defaultValue={[modules[0]?.id]} className="flex flex-col gap-3">
        {modules.map((module) => (
          <AccordionItem key={module.id} value={module.id} className="rounded-xl border bg-card px-4">
            <AccordionTrigger className="py-4 hover:no-underline">
              <div className="flex items-center gap-2 text-left">
                <GripVertical className="size-4 text-muted-foreground" />
                <span className="font-medium">{module.title}</span>
                <Badge variant="outline" className="ml-1 text-xs text-muted-foreground">
                  {module.lessons.length} aulas
                </Badge>
              </div>
            </AccordionTrigger>
            <AccordionContent className="pb-3">
              <ul className="flex flex-col gap-2">
                {module.lessons.map((lesson) => {
                  const Icon = lessonIcon[lesson.type]
                  return (
                    <li key={lesson.id} className="rounded-lg border bg-background p-3">
                      <div className="flex items-center gap-3">
                        <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                          <Icon className="size-4.5" />
                        </span>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium">{lesson.title}</p>
                          <div className="mt-0.5 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                            <span>{lessonTypeLabel[lesson.type]}</span>
                            <span aria-hidden>·</span>
                            <span>{lesson.duration}</span>
                            <Badge
                              variant="outline"
                              className={cn(
                                "text-[0.7rem]",
                                lesson.status === "published"
                                  ? "border-success/20 bg-success/10 text-success"
                                  : "border-warning/20 bg-warning/10 text-warning"
                              )}
                            >
                              {lesson.status === "published" ? "Publicada" : "Rascunho"}
                            </Badge>
                          </div>
                        </div>
                        <Button variant="ghost" size="icon" className="size-8 shrink-0" aria-label="Ações da aula">
                          <MoreVertical className="size-4" />
                        </Button>
                      </div>

                      {lesson.materials.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-2 pl-12">
                          {lesson.materials.map((material) => (
                            <span
                              key={material.id}
                              className="inline-flex items-center gap-1.5 rounded-md border bg-muted/40 px-2 py-1 text-xs"
                            >
                              <Paperclip className="size-3 text-muted-foreground" />
                              <span className="max-w-40 truncate">{material.name}</span>
                              <span className="text-muted-foreground">{material.size}</span>
                              <Download className="size-3 text-muted-foreground" />
                            </span>
                          ))}
                        </div>
                      )}
                    </li>
                  )
                })}
              </ul>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>

      <Card className="border-dashed p-4 text-center text-sm text-muted-foreground">
        Arraste aulas entre módulos para reordenar, ou clique em{" "}
        <span className="font-medium text-foreground">Adicionar conteúdo</span> para incluir novas aulas e materiais.
      </Card>
    </div>
  )
}
