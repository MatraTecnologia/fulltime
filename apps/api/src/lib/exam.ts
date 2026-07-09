export type ExamOptionInput = { text: string; isCorrect: boolean; order?: number }
export type ExamQuestionInput = {
  type: 'SINGLE' | 'MULTIPLE' | 'TRUE_FALSE' | 'ESSAY'
  prompt: string
  order?: number
  points?: number
  options?: ExamOptionInput[]
}

export const validateQuestions = (questions: ExamQuestionInput[]): string | null => {
  if (!questions.length) return 'A prova precisa de ao menos uma questão.'
  for (const q of questions) {
    if (!q.prompt.trim()) return 'Toda questão precisa de um enunciado.'
    const options = q.options ?? []
    const correct = options.filter((o) => o.isCorrect).length
    if (q.type === 'ESSAY') {
      if (options.length) return 'Questão dissertativa não deve ter alternativas.'
      continue
    }
    if (options.length < 2) return 'Questões objetivas precisam de ao menos 2 alternativas.'
    if (q.type === 'TRUE_FALSE' && options.length !== 2) return 'Verdadeiro/Falso deve ter exatamente 2 alternativas.'
    if (q.type === 'MULTIPLE') {
      if (correct < 1) return 'Questão de múltipla resposta precisa de ao menos 1 alternativa correta.'
    } else if (correct !== 1) {
      return 'Questões de escolha única (ou V/F) precisam de exatamente 1 alternativa correta.'
    }
  }
  return null
}
