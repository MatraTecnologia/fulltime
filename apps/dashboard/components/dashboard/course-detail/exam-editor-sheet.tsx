"use client"

import * as React from "react"
import { Plus } from "lucide-react"
import { toast } from "sonner"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Spinner } from "@/components/ui/spinner"
import { Textarea } from "@/components/ui/textarea"
import {
  emptyQuestion,
  ExamQuestionEditor,
  type EditorQuestion,
} from "@/components/dashboard/course-detail/exam-question-editor"
import { useCreateExam, useExam, useReplaceExamQuestions, useUpdateExam } from "@/hooks/use-exams"
import type { ExamDetail, ExamQuestionInput, ExamStatus } from "@/services/exams"

export type ExamEditorTarget =
  | { kind: "new"; moduleId: string | null; moduleTitle: string | null }
  | { kind: "edit"; examId: string }

const toEditorQuestions = (questions: ExamDetail["questions"]): EditorQuestion[] =>
  questions.map((q) => ({
    type: q.type,
    prompt: q.prompt,
    points: String(q.points),
    options: q.options.map((o) => ({ text: o.text, isCorrect: o.isCorrect })),
  }))

const toQuestionInput = (questions: EditorQuestion[]): ExamQuestionInput[] =>
  questions.map((q, qi) => ({
    type: q.type,
    prompt: q.prompt.trim(),
    order: qi,
    points: Number(q.points) || 1,
    options:
      q.type === "ESSAY"
        ? undefined
        : q.options.map((o, oi) => ({ text: o.text.trim(), isCorrect: o.isCorrect, order: oi })),
  }))

const moveQuestion = (questions: EditorQuestion[], from: number, to: number): EditorQuestion[] => {
  const next = [...questions]
  const [moved] = next.splice(from, 1)
  next.splice(to, 0, moved)
  return next
}

const validateQuestions = (questions: EditorQuestion[]): string | null => {
  if (questions.length === 0) return "Adicione ao menos uma questão."
  for (let i = 0; i < questions.length; i++) {
    const q = questions[i]
    if (!q.prompt.trim()) return `Preencha o enunciado da questão ${i + 1}.`
    if (q.type === "ESSAY") continue
    if (q.options.length < 2) return `A questão ${i + 1} precisa de ao menos 2 alternativas.`
    if (q.type === "TRUE_FALSE" && q.options.length !== 2)
      return `A questão ${i + 1} (Verdadeiro/Falso) deve ter exatamente 2 alternativas.`
    if (q.options.some((o) => !o.text.trim())) return `Preencha todas as alternativas da questão ${i + 1}.`
    const correctCount = q.options.filter((o) => o.isCorrect).length
    if (q.type === "MULTIPLE") {
      if (correctCount < 1) return `Marque ao menos 1 alternativa correta na questão ${i + 1}.`
    } else if (correctCount !== 1) {
      return `Marque exatamente 1 alternativa correta na questão ${i + 1}.`
    }
  }
  return null
}

export const ExamEditorSheet = ({
  courseId,
  target,
  open,
  onOpenChange,
}: {
  courseId: string
  target: ExamEditorTarget
  open: boolean
  onOpenChange: (open: boolean) => void
}) => {
  const isEdit = target.kind === "edit"
  const exam = useExam(isEdit ? target.examId : "", isEdit && open)
  const createExam = useCreateExam(courseId)
  const updateExam = useUpdateExam(courseId)
  const replaceQuestions = useReplaceExamQuestions(courseId)

  const [title, setTitle] = React.useState("")
  const [description, setDescription] = React.useState("")
  const [passingScore, setPassingScore] = React.useState("70")
  const [maxAttempts, setMaxAttempts] = React.useState("")
  const [status, setStatus] = React.useState<ExamStatus>("DRAFT")
  const [questions, setQuestions] = React.useState<EditorQuestion[]>([emptyQuestion()])
  const [loaded, setLoaded] = React.useState(!isEdit)

  if (isEdit && !loaded && !exam.isPending && exam.data) {
    setLoaded(true)
    setTitle(exam.data.title)
    setDescription(exam.data.description ?? "")
    setPassingScore(String(exam.data.passingScore))
    setMaxAttempts(exam.data.maxAttempts ? String(exam.data.maxAttempts) : "")
    setStatus(exam.data.status)
    setQuestions(exam.data.questions.length ? toEditorQuestions(exam.data.questions) : [emptyQuestion()])
  }

  const busy = createExam.isPending || updateExam.isPending || replaceQuestions.isPending
  const showSkeleton = isEdit && exam.isPending
  const moduleLabel = isEdit ? (exam.data?.module?.title ?? "Prova final") : (target.moduleTitle ?? "Prova final")

  const handleSave = async () => {
    if (busy) return
    if (!title.trim()) {
      toast.error("Informe um título para a prova.")
      return
    }
    const score = Number(passingScore)
    if (Number.isNaN(score) || score < 0 || score > 100) {
      toast.error("A nota mínima deve estar entre 0 e 100.")
      return
    }
    const attempts = maxAttempts.trim() ? Number(maxAttempts) : null
    if (attempts !== null && (Number.isNaN(attempts) || attempts < 1)) {
      toast.error("O número de tentativas deve ser maior que zero.")
      return
    }
    const questionsError = validateQuestions(questions)
    if (questionsError) {
      toast.error(questionsError)
      return
    }

    try {
      if (isEdit) {
        await updateExam.mutateAsync({
          id: target.examId,
          input: {
            title: title.trim(),
            description: description.trim() || undefined,
            passingScore: score,
            maxAttempts: attempts,
            status,
          },
        })
        await replaceQuestions.mutateAsync({ id: target.examId, questions: toQuestionInput(questions) })
      } else {
        await createExam.mutateAsync({
          moduleId: target.moduleId,
          title: title.trim(),
          description: description.trim() || undefined,
          passingScore: score,
          maxAttempts: attempts,
          status,
          questions: toQuestionInput(questions),
        })
      }
      onOpenChange(false)
    } catch {
      // erro já tratado pelos hooks via toast
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full gap-0 overflow-y-auto p-0 sm:max-w-none data-[side=right]:sm:max-w-2xl">
        <SheetHeader className="border-b p-5">
          <SheetTitle>{isEdit ? "Editar prova" : "Nova prova"}</SheetTitle>
          <SheetDescription>{moduleLabel}</SheetDescription>
        </SheetHeader>

        {showSkeleton ? (
          <div className="flex justify-center py-16">
            <Spinner />
          </div>
        ) : (
          <div className="flex flex-col gap-6 p-5">
            <div className="grid gap-2">
              <Label htmlFor="exam-title">Título da prova</Label>
              <Input
                id="exam-title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ex: Avaliação do módulo 1"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="exam-description">Descrição (opcional)</Label>
              <Textarea
                id="exam-description"
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Instruções gerais da prova..."
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="exam-passing-score">Nota mínima (%)</Label>
                <Input
                  id="exam-passing-score"
                  type="number"
                  min={0}
                  max={100}
                  value={passingScore}
                  onChange={(e) => setPassingScore(e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="exam-max-attempts">Tentativas (vazio = ilimitado)</Label>
                <Input
                  id="exam-max-attempts"
                  type="number"
                  min={1}
                  value={maxAttempts}
                  onChange={(e) => setMaxAttempts(e.target.value)}
                  placeholder="Ilimitado"
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label>Status</Label>
              <Select
                items={{ DRAFT: "Rascunho", PUBLISHED: "Publicada" }}
                value={status}
                onValueChange={(value) => setStatus(value as ExamStatus)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="DRAFT">Rascunho</SelectItem>
                  <SelectItem value="PUBLISHED">Publicada</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold">Questões</h3>
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-1.5"
                  onClick={() => setQuestions((prev) => [...prev, emptyQuestion()])}
                >
                  <Plus className="size-4" />
                  Adicionar questão
                </Button>
              </div>
              {questions.map((question, qi) => (
                <ExamQuestionEditor
                  key={qi}
                  index={qi}
                  question={question}
                  onChange={(next) => setQuestions((prev) => prev.map((q, i) => (i === qi ? next : q)))}
                  onRemove={
                    questions.length > 1 ? () => setQuestions((prev) => prev.filter((_, i) => i !== qi)) : undefined
                  }
                  onMoveUp={qi > 0 ? () => setQuestions((prev) => moveQuestion(prev, qi, qi - 1)) : undefined}
                  onMoveDown={
                    qi < questions.length - 1 ? () => setQuestions((prev) => moveQuestion(prev, qi, qi + 1)) : undefined
                  }
                />
              ))}
            </div>
          </div>
        )}

        <SheetFooter className="border-t p-5">
          <Button onClick={handleSave} disabled={busy || showSkeleton} className="gap-1.5">
            {busy && <Spinner />}
            Salvar prova
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
