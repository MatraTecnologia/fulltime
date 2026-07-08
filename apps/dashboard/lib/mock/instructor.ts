import type {
  ActivityItem,
  ChartPoint,
  CompletionSlice,
  CourseSummary,
  InstructorProfile,
  InstructorStats,
  RatingBucket,
} from "@/types"

export const instructorProfile: InstructorProfile = {
  id: "usr_joao_lima",
  name: "João Lima",
  email: "joaolima@email.com",
  avatarUrl: null,
  headline: "Especialista em Educação Inclusiva",
  rating: 4.9,
  ratingCount: 128,
  verified: true,
}

export const instructorStats: InstructorStats = {
  publishedCourses: 12,
  totalStudents: 8432,
  positiveRatingRate: 98,
  contentHours: 502,
  newStudents: 1248,
  newStudentsDelta: 8,
  activeStudents: 4578,
  activeStudentsDelta: 28,
  completionRate: 92,
  completionRateDelta: 5,
  earnings: 8960,
  earningsDelta: 15,
}

export const studentsGrowth: ChartPoint[] = [
  { date: "01/06", value: 620 },
  { date: "05/06", value: 810 },
  { date: "10/06", value: 760 },
  { date: "15/06", value: 1120 },
  { date: "20/06", value: 980 },
  { date: "25/06", value: 1340 },
  { date: "30/06", value: 1248 },
]

export const earningsSeries: ChartPoint[] = [
  { date: "01/06", value: 4200 },
  { date: "08/06", value: 5100 },
  { date: "15/06", value: 6400 },
  { date: "22/06", value: 7300 },
  { date: "30/06", value: 8960 },
]

export const instructorCourses: CourseSummary[] = [
  {
    id: "crs_1",
    slug: "alfabetizacao-adaptada-por-onde-comecar",
    title: "Alfabetização Adaptada: Por Onde Começar",
    thumbnailUrl: null,
    status: "PUBLISHED",
    lessons: 18,
    students: 2451,
    rating: 4.9,
    completionRate: 78,
  },
  {
    id: "crs_2",
    slug: "estrategias-para-criancas-com-tea",
    title: "Estratégias para Crianças com TEA",
    thumbnailUrl: null,
    status: "PUBLISHED",
    lessons: 22,
    students: 1892,
    rating: 4.8,
    completionRate: 82,
  },
  {
    id: "crs_3",
    slug: "intervencoes-comportamentais-positivas",
    title: "Intervenções Comportamentais Positivas",
    thumbnailUrl: null,
    status: "PUBLISHED",
    lessons: 16,
    students: 1304,
    rating: 4.9,
    completionRate: 75,
  },
  {
    id: "crs_4",
    slug: "inclusao-na-pratica-salas-diversificadas",
    title: "Inclusão na Prática: Salas Diversificadas",
    thumbnailUrl: null,
    status: "DRAFT",
    lessons: 10,
    students: 0,
    rating: 0,
    completionRate: 0,
  },
]

export const recentActivity: ActivityItem[] = [
  {
    id: "act_1",
    type: "comment",
    title: "Novo comentário no curso",
    description: "Maria Silva comentou em “Alfabetização Adaptada”",
    timeAgo: "há 12 min",
  },
  {
    id: "act_2",
    type: "enrollment",
    title: "Novo aluno inscrito",
    description: "Pedro Santos entrou em “Estratégias para Crianças com TEA”",
    timeAgo: "há 40 min",
  },
  {
    id: "act_3",
    type: "rating",
    title: "Avaliação recebida",
    description: "Ana Clara avaliou seu curso com 5 estrelas",
    timeAgo: "há 2 h",
  },
  {
    id: "act_4",
    type: "certificate",
    title: "Certificado emitido",
    description: "Lucas Oliveira concluiu “Intervenções Comportamentais”",
    timeAgo: "há 5 h",
  },
]

export const completionBreakdown: CompletionSlice[] = [
  { label: "Concluíram", value: 76, color: "var(--chart-1)" },
  { label: "Em andamento", value: 18, color: "var(--chart-2)" },
  { label: "Não iniciaram", value: 6, color: "var(--chart-4)" },
]

export const ratingBuckets: RatingBucket[] = [
  { stars: 5, count: 98, percentage: 76 },
  { stars: 4, count: 20, percentage: 16 },
  { stars: 3, count: 6, percentage: 5 },
  { stars: 2, count: 2, percentage: 2 },
  { stars: 1, count: 2, percentage: 1 },
]

export const certificatesIssued = {
  total: 2350,
  deltaMonth: 320,
  deltaPercentage: 18,
}
