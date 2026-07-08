// Dados de demonstração do painel do instrutor — fiéis às telas de referência.
// Substituir por chamadas reais aos services conforme os endpoints forem existindo.

export type Instructor = {
  name: string
  title: string
  email: string
  avatar: string | null
  rating: number
  ratingCount: number
  verified: boolean
  memberSince: string
  bio: string
  focusArea: string
  website: string
}

export const instructor: Instructor = {
  name: 'João Lima',
  title: 'Especialista em Educação Inclusiva',
  email: 'joaolima@email.com',
  avatar: null,
  rating: 4.9,
  ratingCount: 128,
  verified: true,
  memberSince: 'jan 2023',
  bio: 'Especialista em Educação Inclusiva com mais de 15 anos de experiência em alfabetização adaptada e no desenvolvimento de metodologias para crianças com necessidades especiais.',
  focusArea: 'Educação Inclusiva',
  website: 'https://joaolima.com.br',
}

export type OverviewStat = { label: string; value: string }

export const overviewStats: OverviewStat[] = [
  { label: 'Cursos publicados', value: '12' },
  { label: 'Alunos', value: '8.432' },
  { label: 'Positivo', value: '98%' },
  { label: 'Publicado', value: '502h' },
]

export type Kpi = { label: string; value: string; delta: string; trend: 'up' | 'down' }

export const overviewKpis: Kpi[] = [
  { label: 'Novos alunos', value: '1.248', delta: '+8%', trend: 'up' },
  { label: 'Visualizações', value: '4.578', delta: '+26%', trend: 'up' },
  { label: 'Taxa de conclusão', value: '92%', delta: '+13%', trend: 'up' },
  { label: 'Certificados', value: '2.350', delta: '+18%', trend: 'up' },
]

// Crescimento de alunos ao longo dos últimos 30 dias.
export const studentsGrowth: { label: string; value: number }[] = [
  { label: '01/06', value: 620 },
  { label: '04/06', value: 780 },
  { label: '08/06', value: 910 },
  { label: '11/06', value: 870 },
  { label: '15/06', value: 1040 },
  { label: '18/06', value: 1180 },
  { label: '22/06', value: 1120 },
  { label: '25/06', value: 1290 },
  { label: '28/06', value: 1360 },
  { label: '30/06', value: 1480 },
]

export type CourseMini = {
  title: string
  cover: string | null
  rating: number
  students: number
  completion: number
}

export const myCoursesMini: CourseMini[] = [
  { title: 'Alfabetização Adaptada: Por Onde Começar', cover: null, rating: 4.9, students: 2451, completion: 78 },
  { title: 'Estratégias para Crianças com TEA', cover: null, rating: 4.8, students: 1892, completion: 82 },
  { title: 'Intervenções Comportamentais Positivas', cover: null, rating: 4.9, students: 1304, completion: 75 },
  { title: 'Inclusão na Prática: Salas Diversificadas', cover: null, rating: 0, students: 0, completion: 0 },
]

export type Activity = { kind: 'comment' | 'student' | 'rating' | 'certificate'; text: string; time: string }

export const recentActivities: Activity[] = [
  { kind: 'comment', text: 'Novo comentário em Alfabetização Adaptada', time: 'há 12 min' },
  { kind: 'student', text: 'Nova aluna inscrita em Estratégias para TEA', time: 'há 1 h' },
  { kind: 'rating', text: 'Avaliação recebida: 5 estrelas em Intervenções', time: 'há 3 h' },
  { kind: 'certificate', text: 'Certificado emitido para Maria Silva', time: 'há 5 h' },
]

// Progresso geral dos alunos (donut).
export const studentsProgress = { completion: 76, concluido: 76, emAndamento: 16, naoIniciado: 8 }

// Distribuição de avaliações (5 → 1 estrelas), em porcentagem.
export const ratingsBreakdown = {
  average: 4.9,
  count: 128,
  bars: [
    { stars: 5, pct: 78 },
    { stars: 4, pct: 12 },
    { stars: 3, pct: 5 },
    { stars: 2, pct: 3 },
    { stars: 1, pct: 2 },
  ],
}

export const certificatesSummary = { total: '2.350', thisMonth: '+320', delta: '+18%' }
