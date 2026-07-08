export type CommentItem = {
  id: string
  studentName: string
  studentAvatarUrl?: string
  courseTitle: string
  lessonTitle: string
  text: string
  timeAgo: string
  rating?: number
  likes: number
  reply?: {
    author: string
    text: string
    timeAgo: string
  }
}

export const comments: CommentItem[] = [
  {
    id: "cmt_1",
    studentName: "Mariana Alves",
    courseTitle: "Alfabetização Adaptada: Por Onde Começar",
    lessonTitle: "Aula 3 — Consciência fonológica na prática",
    text: "Professor, achei o material excelente, mas fiquei com dúvida em como aplicar a atividade dos fonemas com uma criança não-verbal. Tem alguma adaptação sugerida?",
    timeAgo: "há 12 min",
    likes: 2,
  },
  {
    id: "cmt_2",
    studentName: "Rafael Souza",
    courseTitle: "Estratégias para Crianças com TEA",
    lessonTitle: "Aula 7 — Rotinas visuais e antecipação",
    text: "As rotinas visuais mudaram completamente a dinâmica da minha sala. Consegui reduzir muito as crises de transição entre atividades. Muito obrigado!",
    timeAgo: "há 1 h",
    rating: 5,
    likes: 14,
    reply: {
      author: "João Lima",
      text: "Que notícia maravilhosa, Rafael! Fico feliz que a estratégia tenha funcionado. Se quiser, na aula 9 aprofundo o uso das rotinas em ambientes com mais estímulos.",
      timeAgo: "há 40 min",
    },
  },
  {
    id: "cmt_3",
    studentName: "Beatriz Nunes",
    courseTitle: "Intervenções Comportamentais Positivas",
    lessonTitle: "Aula 2 — Reforço positivo no cotidiano",
    text: "Faltou um exemplo prático de como registrar o comportamento antes e depois do reforço. Poderia disponibilizar uma planilha modelo?",
    timeAgo: "há 3 h",
    rating: 4,
    likes: 5,
  },
  {
    id: "cmt_4",
    studentName: "Carlos Mendes",
    courseTitle: "Comunicação Alternativa e Aumentativa (CAA)",
    lessonTitle: "Aula 5 — Construindo pranchas de comunicação",
    text: "Excelente aula! Só senti falta de mais referências sobre softwares gratuitos de CAA para quem está começando.",
    timeAgo: "há 5 h",
    likes: 8,
    reply: {
      author: "João Lima",
      text: "Ótima sugestão, Carlos. Vou adicionar uma lista de ferramentas gratuitas nos materiais complementares desta aula ainda esta semana.",
      timeAgo: "há 4 h",
    },
  },
  {
    id: "cmt_5",
    studentName: "Fernanda Lima",
    courseTitle: "Inclusão na Prática: Salas Diversificadas",
    lessonTitle: "Aula 1 — Princípios do desenho universal",
    text: "Comecei o curso hoje e já estou amando a didática. Conteúdo muito bem estruturado e fácil de acompanhar.",
    timeAgo: "há 8 h",
    rating: 5,
    likes: 21,
  },
  {
    id: "cmt_6",
    studentName: "Paulo Ribeiro",
    courseTitle: "Tecnologia Assistiva na Sala de Aula",
    lessonTitle: "Aula 4 — Recursos de acessibilidade digital",
    text: "Tive dificuldade para acompanhar a parte de configuração do leitor de tela. Seria possível gravar um tutorial passo a passo?",
    timeAgo: "há 1 dia",
    likes: 3,
  },
  {
    id: "cmt_7",
    studentName: "Juliana Castro",
    courseTitle: "Avaliação e Acompanhamento Educacional",
    lessonTitle: "Aula 6 — Construindo relatórios de evolução",
    text: "O modelo de relatório apresentado é muito completo. Já apliquei com dois alunos e a coordenação aprovou na hora!",
    timeAgo: "há 1 dia",
    rating: 5,
    likes: 11,
    reply: {
      author: "João Lima",
      text: "Fico muito feliz, Juliana! Esse retorno da coordenação é exatamente o objetivo do modelo. Parabéns pela aplicação.",
      timeAgo: "há 22 h",
    },
  },
  {
    id: "cmt_8",
    studentName: "André Teixeira",
    courseTitle: "Estratégias para Crianças com TEA",
    lessonTitle: "Aula 10 — Manejo de comportamentos desafiadores",
    text: "Discordo um pouco da abordagem sugerida no minuto 14. Na minha experiência, a retirada imediata do estímulo nem sempre funciona. Como você lidaria com isso?",
    timeAgo: "há 2 dias",
    rating: 3,
    likes: 6,
  },
  {
    id: "cmt_9",
    studentName: "Camila Duarte",
    courseTitle: "Intervenções Comportamentais Positivas",
    lessonTitle: "Aula 8 — Envolvimento da família no processo",
    text: "Aula transformadora! Consegui trazer os pais para dentro do plano de intervenção e os resultados apareceram rápido.",
    timeAgo: "há 3 dias",
    rating: 5,
    likes: 17,
    reply: {
      author: "João Lima",
      text: "A parceria com a família é mesmo decisiva, Camila. Obrigado por compartilhar seu resultado com a turma!",
      timeAgo: "há 3 dias",
    },
  },
]
