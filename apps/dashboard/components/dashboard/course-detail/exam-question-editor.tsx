"use client"

import { Plus, Trash2 } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import type { ExamQuestionType } from "@/services/exams"

export type EditorOption = { text: string; isCorrect: boolean }

export type EditorQuestion = {
  type: ExamQuestionType
  prompt: string
  points: string
  options: EditorOption[]
}

export const emptyQuestion = (): EditorQuestion => ({
  type: "SINGLE",
  prompt: "",
  points: "1",
  options: [
    { text: "", isCorrect: true },
    { text: "", isCorrect: false },
  ],
})

const typeItems: Record<ExamQuestionType, string> = {
  SINGLE: "Escolha única",
  MULTIPLE: "Múltipla escolha",
  TRUE_FALSE: "Verdadeiro ou falso",
  ESSAY: "Dissertativa",
}

const typeOrder: ExamQuestionType[] = ["SINGLE", "MULTIPLE", "TRUE_FALSE", "ESSAY"]

export const ExamQuestionEditor = ({
  index,
  question,
  onChange,
  onRemove,
}: {
  index: number
  question: EditorQuestion
  onChange: (question: EditorQuestion) => void
  onRemove?: () => void
}) => {
  const handleTypeChange = (type: ExamQuestionType) => {
    if (type === question.type) return
    if (type === "ESSAY") {
      onChange({ ...question, type, options: [] })
      return
    }
    if (type === "TRUE_FALSE") {
      onChange({
        ...question,
        type,
        options: [
          { text: "Verdadeiro", isCorrect: true },
          { text: "Falso", isCorrect: false },
        ],
      })
      return
    }
    if (question.options.length < 2) {
      onChange({
        ...question,
        type,
        options: [
          { text: "", isCorrect: true },
          { text: "", isCorrect: false },
        ],
      })
      return
    }
    if (type === "SINGLE") {
      const correctIndex = Math.max(
        question.options.findIndex((o) => o.isCorrect),
        0
      )
      onChange({
        ...question,
        type,
        options: question.options.map((o, i) => ({ ...o, isCorrect: i === correctIndex })),
      })
      return
    }
    onChange({ ...question, type })
  }

  const updateOption = (oi: number, patch: Partial<EditorOption>) =>
    onChange({
      ...question,
      options: question.options.map((o, i) => (i === oi ? { ...o, ...patch } : o)),
    })

  const setSingleCorrect = (oi: number) =>
    onChange({
      ...question,
      options: question.options.map((o, i) => ({ ...o, isCorrect: i === oi })),
    })

  const addOption = () =>
    onChange({ ...question, options: [...question.options, { text: "", isCorrect: false }] })

  const removeOption = (oi: number) => {
    const filtered = question.options.filter((_, i) => i !== oi)
    const options = filtered.some((o) => o.isCorrect)
      ? filtered
      : filtered.map((o, i) => ({ ...o, isCorrect: i === 0 }))
    onChange({ ...question, options })
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-base">Questão {index + 1}</CardTitle>
        {onRemove && (
          <Button
            variant="ghost"
            size="icon"
            className="size-8 text-muted-foreground"
            aria-label="Remover questão"
            onClick={onRemove}
          >
            <Trash2 className="size-4" />
          </Button>
        )}
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div className="grid grid-cols-[1fr_auto] gap-4">
          <div className="grid gap-2">
            <Label>Tipo</Label>
            <Select
              items={typeItems}
              value={question.type}
              onValueChange={(value) => handleTypeChange(value as ExamQuestionType)}
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {typeOrder.map((type) => (
                  <SelectItem key={type} value={type}>
                    {typeItems[type]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <Label htmlFor={`question-points-${index}`}>Pontos</Label>
            <Input
              id={`question-points-${index}`}
              type="number"
              min={0}
              step="0.5"
              className="w-24"
              value={question.points}
              onChange={(e) => onChange({ ...question, points: e.target.value })}
            />
          </div>
        </div>

        <div className="grid gap-2">
          <Label htmlFor={`question-prompt-${index}`}>Enunciado</Label>
          <Textarea
            id={`question-prompt-${index}`}
            rows={2}
            value={question.prompt}
            onChange={(e) => onChange({ ...question, prompt: e.target.value })}
            placeholder="Digite o enunciado da questão..."
          />
        </div>

        {question.type === "ESSAY" ? (
          <p className="text-xs text-muted-foreground">
            Questão dissertativa — sem alternativas, corrigida manualmente.
          </p>
        ) : question.type === "MULTIPLE" ? (
          <div className="flex flex-col gap-2">
            <Label>Alternativas (marque as corretas)</Label>
            {question.options.map((option, oi) => (
              <div key={oi} className="flex items-center gap-2">
                <Checkbox
                  checked={option.isCorrect}
                  onCheckedChange={(checked) => updateOption(oi, { isCorrect: checked === true })}
                  aria-label="Marcar como correta"
                />
                <Input
                  value={option.text}
                  onChange={(e) => updateOption(oi, { text: e.target.value })}
                  placeholder={`Alternativa ${oi + 1}`}
                  className="flex-1"
                />
                {question.options.length > 2 && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-8 shrink-0 text-muted-foreground"
                    aria-label="Remover alternativa"
                    onClick={() => removeOption(oi)}
                  >
                    <Trash2 className="size-4" />
                  </Button>
                )}
              </div>
            ))}
            <Button variant="outline" size="sm" className="w-fit gap-1.5" onClick={addOption}>
              <Plus className="size-4" />
              Adicionar alternativa
            </Button>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            <Label>Alternativas (marque a correta)</Label>
            <RadioGroup
              value={String(question.options.findIndex((o) => o.isCorrect))}
              onValueChange={(value) => setSingleCorrect(Number(value))}
              className="gap-2"
            >
              {question.options.map((option, oi) => (
                <div key={oi} className="flex items-center gap-2">
                  <RadioGroupItem value={String(oi)} aria-label="Marcar como correta" />
                  <Input
                    value={option.text}
                    onChange={(e) => updateOption(oi, { text: e.target.value })}
                    placeholder={`Alternativa ${oi + 1}`}
                    className="flex-1"
                    disabled={question.type === "TRUE_FALSE"}
                  />
                  {question.type === "SINGLE" && question.options.length > 2 && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-8 shrink-0 text-muted-foreground"
                      aria-label="Remover alternativa"
                      onClick={() => removeOption(oi)}
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  )}
                </div>
              ))}
            </RadioGroup>
            {question.type === "SINGLE" && (
              <Button variant="outline" size="sm" className="w-fit gap-1.5" onClick={addOption}>
                <Plus className="size-4" />
                Adicionar alternativa
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
