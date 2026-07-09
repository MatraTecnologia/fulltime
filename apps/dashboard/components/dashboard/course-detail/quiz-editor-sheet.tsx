"use client"

import * as React from "react"
import { Plus, Trash2 } from "lucide-react"
import { toast } from "sonner"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import {
  useDeleteLessonQuiz,
  useLessonQuiz,
  useSaveLessonQuiz,
} from "@/hooks/use-course-detail"
import type { QuizPayload } from "@/services/courses-detail"

type EditorOption = { text: string; isCorrect: boolean }
type EditorQuestion = { statement: string; options: EditorOption[] }

const emptyQuestion = (): EditorQuestion => ({
  statement: "",
  options: [
    { text: "", isCorrect: true },
    { text: "", isCorrect: false },
  ],
})

export const QuizEditorSheet = ({
  lessonId,
  lessonTitle,
  open,
  onOpenChange,
}: {
  lessonId: string
  lessonTitle: string
  open: boolean
  onOpenChange: (open: boolean) => void
}) => {
  const quiz = useLessonQuiz(lessonId, open)
  const saveQuiz = useSaveLessonQuiz(lessonId)
  const deleteQuiz = useDeleteLessonQuiz(lessonId)

  const [title, setTitle] = React.useState("")
  const [questions, setQuestions] = React.useState<EditorQuestion[]>([emptyQuestion()])
  const [loaded, setLoaded] = React.useState(false)

  if (!loaded && !quiz.isPending) {
    setLoaded(true)
    if (quiz.data) {
      setTitle(quiz.data.title)
      setQuestions(
        quiz.data.questions.map((q) => ({
          statement: q.statement,
          options: q.options.map((o) => ({ text: o.text, isCorrect: o.isCorrect })),
        }))
      )
    }
  }

  const busy = saveQuiz.isPending || deleteQuiz.isPending

  const updateQuestion = (qi: number, patch: Partial<EditorQuestion>) =>
    setQuestions((prev) => prev.map((q, i) => (i === qi ? { ...q, ...patch } : q)))

  const updateOption = (qi: number, oi: number, patch: Partial<EditorOption>) =>
    setQuestions((prev) =>
      prev.map((q, i) =>
        i === qi
          ? { ...q, options: q.options.map((o, j) => (j === oi ? { ...o, ...patch } : o)) }
          : q
      )
    )

  const setCorrect = (qi: number, oi: number) =>
    setQuestions((prev) =>
      prev.map((q, i) =>
        i === qi
          ? { ...q, options: q.options.map((o, j) => ({ ...o, isCorrect: j === oi })) }
          : q
      )
    )

  const addQuestion = () => setQuestions((prev) => [...prev, emptyQuestion()])

  const removeQuestion = (qi: number) =>
    setQuestions((prev) => prev.filter((_, i) => i !== qi))

  const addOption = (qi: number) =>
    setQuestions((prev) =>
      prev.map((q, i) =>
        i === qi ? { ...q, options: [...q.options, { text: "", isCorrect: false }] } : q
      )
    )

  const removeOption = (qi: number, oi: number) =>
    setQuestions((prev) =>
      prev.map((q, i) => {
        if (i !== qi) return q
        const filtered = q.options.filter((_, j) => j !== oi)
        const options = filtered.some((o) => o.isCorrect)
          ? filtered
          : filtered.map((o, j) => ({ ...o, isCorrect: j === 0 }))
        return { ...q, options }
      })
    )

  const validate = (): string | null => {
    if (!title.trim()) return "Informe um título para a atividade."
    if (questions.length === 0) return "Adicione ao menos uma pergunta."
    for (let i = 0; i < questions.length; i++) {
      const q = questions[i]
      if (!q.statement.trim()) return `Preencha o enunciado da pergunta ${i + 1}.`
      if (q.options.length < 2) return `A pergunta ${i + 1} precisa de ao menos 2 alternativas.`
      if (q.options.some((o) => !o.text.trim()))
        return `Preencha todas as alternativas da pergunta ${i + 1}.`
      if (q.options.filter((o) => o.isCorrect).length !== 1)
        return `Marque exatamente 1 alternativa correta na pergunta ${i + 1}.`
    }
    return null
  }

  const handleSave = async () => {
    if (busy) return
    const error = validate()
    if (error) {
      toast.error(error)
      return
    }
    const payload: QuizPayload = {
      title: title.trim(),
      questions: questions.map((q, qi) => ({
        statement: q.statement.trim(),
        order: qi,
        options: q.options.map((o, oi) => ({
          text: o.text.trim(),
          isCorrect: o.isCorrect,
          order: oi,
        })),
      })),
    }
    try {
      await saveQuiz.mutateAsync(payload)
      onOpenChange(false)
    } catch {
      // erro já tratado pelo hook via toast
    }
  }

  const handleDelete = async () => {
    if (busy) return
    try {
      await deleteQuiz.mutateAsync()
      onOpenChange(false)
    } catch {
      // erro já tratado pelo hook via toast
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full gap-0 overflow-y-auto p-0 sm:max-w-none data-[side=right]:sm:max-w-2xl">
        <SheetHeader className="border-b p-5">
          <SheetTitle>Atividade da aula</SheetTitle>
          <SheetDescription>{lessonTitle}</SheetDescription>
        </SheetHeader>

        {quiz.isPending ? (
          <div className="flex justify-center py-16">
            <Spinner />
          </div>
        ) : (
          <div className="flex flex-col gap-6 p-5">
            <div className="grid gap-2">
              <Label htmlFor="quiz-title">Título da atividade</Label>
              <Input
                id="quiz-title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ex: Quiz de fixação"
              />
            </div>

            {questions.map((question, qi) => (
              <Card key={qi}>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="text-base">Pergunta {qi + 1}</CardTitle>
                  {questions.length > 1 && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-8 text-muted-foreground"
                      aria-label="Remover pergunta"
                      onClick={() => removeQuestion(qi)}
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  )}
                </CardHeader>
                <CardContent className="flex flex-col gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor={`quiz-statement-${qi}`}>Enunciado</Label>
                    <Input
                      id={`quiz-statement-${qi}`}
                      value={question.statement}
                      onChange={(e) => updateQuestion(qi, { statement: e.target.value })}
                      placeholder="Digite a pergunta..."
                    />
                  </div>

                  <div className="flex flex-col gap-2">
                    <Label>Alternativas (marque a correta)</Label>
                    <RadioGroup
                      value={String(question.options.findIndex((o) => o.isCorrect))}
                      onValueChange={(value) => setCorrect(qi, Number(value))}
                      className="gap-2"
                    >
                      {question.options.map((option, oi) => (
                        <div key={oi} className="flex items-center gap-2">
                          <RadioGroupItem value={String(oi)} aria-label="Marcar como correta" />
                          <Input
                            value={option.text}
                            onChange={(e) => updateOption(qi, oi, { text: e.target.value })}
                            placeholder={`Alternativa ${oi + 1}`}
                            className="flex-1"
                          />
                          {question.options.length > 2 && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="size-8 shrink-0 text-muted-foreground"
                              aria-label="Remover alternativa"
                              onClick={() => removeOption(qi, oi)}
                            >
                              <Trash2 className="size-4" />
                            </Button>
                          )}
                        </div>
                      ))}
                    </RadioGroup>
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-fit gap-1.5"
                      onClick={() => addOption(qi)}
                    >
                      <Plus className="size-4" />
                      Adicionar alternativa
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}

            <Button variant="outline" className="gap-1.5" onClick={addQuestion}>
              <Plus className="size-4" />
              Adicionar pergunta
            </Button>
          </div>
        )}

        <SheetFooter className="flex-row justify-between border-t p-5">
          {quiz.data ? (
            <Button variant="outline" onClick={handleDelete} disabled={busy} className="gap-1.5">
              {deleteQuiz.isPending && <Spinner />}
              Excluir atividade
            </Button>
          ) : (
            <span />
          )}
          <Button onClick={handleSave} disabled={busy || quiz.isPending} className="gap-1.5">
            {saveQuiz.isPending && <Spinner />}
            Salvar atividade
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
