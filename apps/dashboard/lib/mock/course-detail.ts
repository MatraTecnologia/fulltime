import type { CourseStatus } from "@/types"
import { courseRows } from "@/lib/mock/courses"

export type LessonType = "video" | "text" | "pdf" | "quiz"
export type MaterialKind = "pdf" | "zip" | "doc" | "slide"

export interface LessonMaterial {
  id: string
  name: string
  kind: MaterialKind
  size: string
}

export interface CourseLesson {
  id: string
  title: string
  type: LessonType
  duration: string
  status: "published" | "draft"
  materials: LessonMaterial[]
}

export interface CourseModule {
  id: string
  title: string
  lessons: CourseLesson[]
}

export interface CourseDetail {
  slug: string
  title: string
  description: string
  category: string
  level: string
  status: CourseStatus
  students: number
  rating: number
  lessonsCount: number
  durationLabel: string
  modules: CourseModule[]
}

const baseModules: CourseModule[] = [
  {
    id: "mod_1",
    title: "Módulo 1 — Fundamentos",
    lessons: [
      {
        id: "les_1",
        title: "Boas-vindas e visão geral do curso",
        type: "video",
        duration: "06:24",
        status: "published",
        materials: [{ id: "m1", name: "guia-de-estudos.pdf", kind: "pdf", size: "1.2 MB" }],
      },
      {
        id: "les_2",
        title: "Conceitos essenciais da alfabetização adaptada",
        type: "video",
        duration: "18:40",
        status: "published",
        materials: [
          { id: "m2", name: "slides-aula-02.pdf", kind: "slide", size: "3.4 MB" },
          { id: "m3", name: "leitura-complementar.pdf", kind: "pdf", size: "820 KB" },
        ],
      },
      {
        id: "les_3",
        title: "Glossário e materiais de apoio",
        type: "pdf",
        duration: "—",
        status: "published",
        materials: [{ id: "m4", name: "glossario.pdf", kind: "pdf", size: "640 KB" }],
      },
    ],
  },
  {
    id: "mod_2",
    title: "Módulo 2 — Estratégias práticas",
    lessons: [
      {
        id: "les_4",
        title: "Planejando atividades inclusivas",
        type: "video",
        duration: "22:15",
        status: "published",
        materials: [{ id: "m5", name: "modelo-de-plano.docx", kind: "doc", size: "45 KB" }],
      },
      {
        id: "les_5",
        title: "Estudo de caso: sala diversificada",
        type: "text",
        duration: "10 min de leitura",
        status: "published",
        materials: [],
      },
      {
        id: "les_6",
        title: "Quiz — fixação do módulo",
        type: "quiz",
        duration: "8 questões",
        status: "draft",
        materials: [],
      },
    ],
  },
  {
    id: "mod_3",
    title: "Módulo 3 — Avaliação e acompanhamento",
    lessons: [
      {
        id: "les_7",
        title: "Ferramentas de avaliação contínua",
        type: "video",
        duration: "16:02",
        status: "draft",
        materials: [{ id: "m6", name: "planilhas-de-avaliacao.zip", kind: "zip", size: "2.1 MB" }],
      },
      {
        id: "les_8",
        title: "Encerramento e próximos passos",
        type: "video",
        duration: "05:30",
        status: "draft",
        materials: [],
      },
    ],
  },
]

export const getCourseDetail = (slug: string): CourseDetail => {
  const row = courseRows.find((c) => c.slug === slug)
  const lessonsCount = baseModules.reduce((sum, m) => sum + m.lessons.length, 0)

  return {
    slug,
    title: row?.title ?? "Novo curso",
    description:
      "Um curso completo e prático para educadores que desejam aplicar metodologias inclusivas no dia a dia da sala de aula.",
    category: "Educação Inclusiva",
    level: "Intermediário",
    status: row?.status ?? "DRAFT",
    students: row?.students ?? 0,
    rating: row?.rating ?? 0,
    lessonsCount,
    durationLabel: row?.durationLabel ?? "—",
    modules: baseModules,
  }
}

export const courseCategories = [
  "Educação Inclusiva",
  "Alfabetização",
  "Comportamento",
  "Tecnologia Assistiva",
  "Gestão Escolar",
]

export const courseLevels = ["Iniciante", "Intermediário", "Avançado"]
