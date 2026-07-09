"use client"

import * as React from "react"
import { Check } from "lucide-react"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Spinner } from "@/components/ui/spinner"
import { cn } from "@/lib/utils"
import { useGradingAttempt, useSubmitGrades } from "@/hooks/use-exam-grading"
import type { GradeInput, GradingAttempt, GradingQuestion } from "@/services/exam-grading"

const clampPoints = (value: number, max: number) => {
  if (Number.isNaN(value)) return 0
  return Math.min(Math.max(value, 0), max)
}

const pointsLabel = (points: number) => `${points} ${points === 1 ? "ponto" : "pontos"}`

const ObjectiveAnswer = ({ question }: { question: GradingQuestion }) => (
  <div className="flex flex-col gap-1.5">
    {question.options.map((option) => {
      const selected = question.selectedOptionIds.includes(option.id)
      return (
        <div
          key={option.id}
          className={cn(
            "flex items-center gap-2 rounded-md border px-3 py-2 text-sm",
            selected ? "border-primary bg-primary/5" : "border-transparent bg-muted/40"
          )}
        >
          {option.isCorrect ? (
            <Check className="size-4 shrink-0 text-success" />
          ) : (
            <span className="size-4 shrink-0" />
          )}
          <span className={cn("flex-1", selected && "font-medium")}>{option.text}</span>
          {selected && (
            <Badge variant="outline" className="border-transparent bg-primary/10 text-primary">
              Resposta do aluno
            </Badge>
          )}
        </div>
      )
    })}
  </div>
)

type EssayGrade = { awardedPoints: number; feedback: string }

const EssayAnswer = ({
  question,
  grade,
  onChange,
}: {
  question: GradingQuestion
  grade: EssayGrade
  onChange: (grade: EssayGrade) => void
}) => (
  <div className="flex flex-col gap-3">
    <p className="whitespace-pre-wrap rounded-md border bg-muted/40 p-3 text-sm text-muted-foreground">
      {question.essayText || "O aluno não escreveu uma resposta."}
    </p>
    <div className="grid gap-2 sm:max-w-40">
      <Label htmlFor={`points-${question.questionId}`}>Pontos concedidos</Label>
      <Input
        id={`points-${question.questionId}`}
        type="number"
        min={0}
        max={question.points}
        value={grade.awardedPoints}
        onChange={(e) =>
          onChange({ ...grade, awardedPoints: clampPoints(Number(e.target.value), question.points) })
        }
      />
    </div>
    <Textarea
      placeholder="Feedback para o aluno (opcional)"
      value={grade.feedback}
      onChange={(e) => onChange({ ...grade, feedback: e.target.value })}
      rows={3}
    />
  </div>
)

const GradingForm = ({ attempt, onDone }: { attempt: GradingAttempt; onDone: () => void }) => {
  const [grades, setGrades] = React.useState<Record<string, EssayGrade>>(() =>
    Object.fromEntries(
      attempt.questions
        .filter((q) => q.type === "ESSAY")
        .map((q) => [q.questionId, { awardedPoints: q.awardedPoints ?? 0, feedback: q.feedback ?? "" }])
    )
  )
  const submit = useSubmitGrades()

  const handleSave = () => {
    const payload: GradeInput[] = Object.entries(grades).map(([questionId, grade]) => ({
      questionId,
      awardedPoints: grade.awardedPoints,
      feedback: grade.feedback.trim() || undefined,
    }))
    submit.mutate({ attemptId: attempt.id, grades: payload }, { onSuccess: onDone })
  }

  return (
    <>
      <div className="flex items-center gap-4 rounded-md border bg-muted/30 px-3 py-2 text-sm">
        <span>
          Nota automática: <strong>{attempt.autoScore}</strong>
        </span>
        <span className="text-muted-foreground">Nota mínima: {attempt.passingScore}</span>
      </div>

      <div className="flex max-h-[24rem] flex-col gap-4 overflow-y-auto pr-1">
        {attempt.questions.map((question) => (
          <div key={question.questionId} className="flex flex-col gap-3 rounded-lg border p-4">
            <div className="flex items-start justify-between gap-3">
              <p className="text-sm font-medium">{question.prompt}</p>
              <Badge variant="outline" className="shrink-0">
                {pointsLabel(question.points)}
              </Badge>
            </div>
            {question.type === "ESSAY" ? (
              <EssayAnswer
                question={question}
                grade={grades[question.questionId]}
                onChange={(grade) =>
                  setGrades((prev) => ({ ...prev, [question.questionId]: grade }))
                }
              />
            ) : (
              <ObjectiveAnswer question={question} />
            )}
          </div>
        ))}
      </div>

      <DialogFooter>
        <DialogClose render={<Button variant="outline" />}>Cancelar</DialogClose>
        <Button onClick={handleSave} disabled={submit.isPending}>
          {submit.isPending && <Spinner />}
          Finalizar correção
        </Button>
      </DialogFooter>
    </>
  )
}

export const GradingDialog = ({
  attemptId,
  onClose,
}: {
  attemptId: string | null
  onClose: () => void
}) => {
  const open = attemptId !== null
  const attempt = useGradingAttempt(attemptId ?? "", open)

  return (
    <Dialog open={open} onOpenChange={(next) => !next && onClose()}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Corrigir prova</DialogTitle>
          <DialogDescription>
            {attempt.data
              ? `${attempt.data.student} · ${attempt.data.examTitle}`
              : "Avalie as questões dissertativas e finalize a correção."}
          </DialogDescription>
        </DialogHeader>

        {attempt.isPending ? (
          <div className="flex justify-center py-10">
            <Spinner />
          </div>
        ) : attempt.isError ? (
          <p className="py-8 text-center text-sm text-muted-foreground">
            Não foi possível carregar os dados da prova.
          </p>
        ) : (
          <GradingForm key={attempt.data.id} attempt={attempt.data} onDone={onClose} />
        )}
      </DialogContent>
    </Dialog>
  )
}
