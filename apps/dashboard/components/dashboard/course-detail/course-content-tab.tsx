"use client"

import * as React from "react"
import { FolderPlus, GripVertical, ListChecks, Pencil, Trash2, Video } from "lucide-react"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Spinner } from "@/components/ui/spinner"
import { EmptyState } from "@/components/dashboard/empty-state"
import { AddContentSheet } from "@/components/dashboard/course-detail/add-content-sheet"
import { EditLessonSheet } from "@/components/dashboard/course-detail/edit-lesson-sheet"
import { QuizEditorSheet } from "@/components/dashboard/course-detail/quiz-editor-sheet"
import { useCreateModule, useDeleteLesson, useDeleteModule } from "@/hooks/use-course-detail"
import { formatDurationSec, type CourseLessonNode, type CourseModuleNode } from "@/services/courses-detail"

const AddModuleDialog = ({ courseId, slug }: { courseId: string; slug: string }) => {
  const [open, setOpen] = React.useState(false)
  const [title, setTitle] = React.useState("")
  const createModule = useCreateModule(slug)

  const handleCreate = () => {
    if (!title.trim()) return
    createModule.mutate(
      { courseId, title: title.trim() },
      {
        onSuccess: () => {
          setTitle("")
          setOpen(false)
        },
      }
    )
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button variant="outline" className="gap-1.5">
            <FolderPlus className="size-4" />
            Adicionar módulo
          </Button>
        }
      />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Novo módulo</DialogTitle>
        </DialogHeader>
        <div className="grid gap-2">
          <Label htmlFor="module-title">Título do módulo</Label>
          <Input
            id="module-title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Ex: Módulo 1 — Fundamentos"
          />
        </div>
        <DialogFooter>
          <Button onClick={handleCreate} disabled={!title.trim() || createModule.isPending} className="gap-1.5">
            {createModule.isPending && <Spinner />}
            Criar módulo
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export const CourseContentTab = ({
  courseId,
  slug,
  modules,
}: {
  courseId: string
  slug: string
  modules: CourseModuleNode[]
}) => {
  const deleteModule = useDeleteModule(slug)
  const deleteLesson = useDeleteLesson(slug)
  const [editingLesson, setEditingLesson] = React.useState<CourseLessonNode | null>(null)
  const [quizLesson, setQuizLesson] = React.useState<CourseLessonNode | null>(null)

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-base font-semibold">Estrutura do curso</h2>
          <p className="text-sm text-muted-foreground">
            Organize os módulos e adicione aulas para os seus alunos.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <AddModuleDialog courseId={courseId} slug={slug} />
          <AddContentSheet modules={modules} slug={slug} />
        </div>
      </div>

      {modules.length === 0 ? (
        <EmptyState
          icon={FolderPlus}
          title="Nenhum módulo ainda"
          description="Comece criando um módulo para organizar as aulas do curso."
        />
      ) : (
        <Accordion defaultValue={[modules[0]?.id]} className="flex flex-col gap-3">
          {modules.map((module) => (
            <AccordionItem key={module.id} value={module.id} className="rounded-xl border bg-card px-4">
              <div className="flex items-center gap-1">
                <AccordionTrigger className="flex-1 py-4 hover:no-underline">
                  <div className="flex items-center gap-2 text-left">
                    <GripVertical className="size-4 text-muted-foreground" />
                    <span className="font-medium">{module.title}</span>
                    <Badge variant="outline" className="ml-1 text-xs text-muted-foreground">
                      {module.lessons.length} aulas
                    </Badge>
                  </div>
                </AccordionTrigger>
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-8 shrink-0 text-muted-foreground"
                  aria-label="Excluir módulo"
                  onClick={() => deleteModule.mutate(module.id)}
                >
                  <Trash2 className="size-4" />
                </Button>
              </div>
              <AccordionContent className="pb-3">
                {module.lessons.length === 0 ? (
                  <p className="px-1 pb-2 text-sm text-muted-foreground">Nenhuma aula neste módulo ainda.</p>
                ) : (
                  <ul className="flex flex-col gap-2">
                    {module.lessons.map((lesson) => (
                      <li key={lesson.id} className="flex items-center gap-3 rounded-lg border bg-background p-3">
                        {lesson.thumbnail ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={lesson.thumbnail}
                            alt=""
                            className="h-9 w-16 shrink-0 rounded-md object-cover"
                          />
                        ) : (
                          <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                            <Video className="size-4.5" />
                          </span>
                        )}
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium">{lesson.title}</p>
                          <div className="flex items-center gap-2">
                            <p className="text-xs text-muted-foreground">{formatDurationSec(lesson.durationSec)}</p>
                            {lesson.videoSource !== "NONE" && (
                              <Badge variant="outline" className="gap-1 text-[0.7rem] text-muted-foreground">
                                <Video className="size-3" />
                                Vídeo
                              </Badge>
                            )}
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="size-8 shrink-0 text-muted-foreground"
                          aria-label="Atividade da aula"
                          onClick={() => setQuizLesson(lesson)}
                        >
                          <ListChecks className="size-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="size-8 shrink-0 text-muted-foreground"
                          aria-label="Editar aula"
                          onClick={() => setEditingLesson(lesson)}
                        >
                          <Pencil className="size-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="size-8 shrink-0 text-muted-foreground"
                          aria-label="Excluir aula"
                          onClick={() => deleteLesson.mutate(lesson.id)}
                        >
                          <Trash2 className="size-4" />
                        </Button>
                      </li>
                    ))}
                  </ul>
                )}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      )}

      {editingLesson && (
        <EditLessonSheet
          lesson={editingLesson}
          slug={slug}
          open={!!editingLesson}
          onOpenChange={(open) => !open && setEditingLesson(null)}
        />
      )}

      {quizLesson && (
        <QuizEditorSheet
          lessonId={quizLesson.id}
          lessonTitle={quizLesson.title}
          open={!!quizLesson}
          onOpenChange={(open) => !open && setQuizLesson(null)}
        />
      )}
    </div>
  )
}
