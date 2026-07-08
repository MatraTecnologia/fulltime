import { FileText, ListChecks, Music, UploadCloud, Video, type LucideIcon } from "lucide-react"
import type { ContentKind } from "@/types"

export interface ContentTypeOption {
  kind: ContentKind
  label: string
  description: string
  icon: LucideIcon
}

export const contentTypes: ContentTypeOption[] = [
  { kind: "video", label: "Aula em vídeo", description: "MP4, MOV, WEBM", icon: Video },
  { kind: "text", label: "Aula em texto", description: "Artigo ou roteiro", icon: FileText },
  { kind: "download", label: "Material p/ download", description: "PDF, DOCX, ZIP", icon: UploadCloud },
  { kind: "audio", label: "Áudio", description: "MP3, WAV, M4A", icon: Music },
  { kind: "quiz", label: "Quiz / Avaliação", description: "Perguntas e respostas", icon: ListChecks },
]

export const courseModules = [
  { id: "mod_1", name: "Módulo 1 — Fundamentos" },
  { id: "mod_2", name: "Módulo 2 — Estratégias práticas" },
  { id: "mod_3", name: "Módulo 3 — Avaliação e acompanhamento" },
]

export const moduleLessons = [
  { id: "les_1", name: "Aula 1 — Introdução" },
  { id: "les_2", name: "Aula 2 — Conceitos-chave" },
  { id: "les_3", name: "Aula 3 — Aplicação em sala" },
]
