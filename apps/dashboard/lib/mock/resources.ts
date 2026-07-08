import {
  BookOpen,
  CirclePlay,
  LifeBuoy,
  Sparkles,
  Users,
  Video,
  type LucideIcon,
} from "lucide-react"

export type ResourceItem = {
  id: string
  title: string
  description: string
  href: string
  ctaLabel: string
  external: boolean
  icon: LucideIcon
}

export type FaqItem = {
  question: string
  answer: string
}

export const resources: ResourceItem[] = [
  {
    id: "guia-instrutor",
    title: "Guia do instrutor",
    description: "Passo a passo completo para estruturar, gravar e publicar o seu primeiro curso.",
    href: "https://matratecnologia.com",
    ctaLabel: "Abrir guia",
    external: true,
    icon: BookOpen,
  },
  {
    id: "tutoriais-video",
    title: "Tutoriais em vídeo",
    description: "Aprenda a usar cada recurso da plataforma com vídeos curtos e objetivos.",
    href: "https://matratecnologia.com",
    ctaLabel: "Assistir tutoriais",
    external: true,
    icon: CirclePlay,
  },
  {
    id: "boas-praticas-gravacao",
    title: "Boas práticas de gravação",
    description: "Dicas de áudio, iluminação e enquadramento para elevar a qualidade das suas aulas.",
    href: "https://matratecnologia.com",
    ctaLabel: "Ver recomendações",
    external: true,
    icon: Video,
  },
  {
    id: "central-ajuda",
    title: "Central de ajuda",
    description: "Encontre respostas rápidas para dúvidas comuns sobre a plataforma.",
    href: "https://matratecnologia.com",
    ctaLabel: "Acessar central",
    external: true,
    icon: LifeBuoy,
  },
  {
    id: "comunidade-instrutores",
    title: "Comunidade de instrutores",
    description: "Troque experiências, tire dúvidas e cresça junto com outros educadores.",
    href: "https://matratecnologia.com",
    ctaLabel: "Participar",
    external: true,
    icon: Users,
  },
  {
    id: "novidades-plataforma",
    title: "Novidades da plataforma",
    description: "Fique por dentro dos últimos recursos e melhorias lançados para instrutores.",
    href: "https://matratecnologia.com",
    ctaLabel: "Ver novidades",
    external: true,
    icon: Sparkles,
  },
]

export const faq: FaqItem[] = [
  {
    question: "Como criar um novo curso?",
    answer:
      "Acesse a página Cursos e clique em Novo curso. Preencha título, descrição e categoria, organize os módulos e as aulas e publique quando estiver pronto. Você pode salvar como rascunho e continuar depois.",
  },
  {
    question: "Quais formatos e tamanhos de vídeo são aceitos no upload?",
    answer:
      "Aceitamos os formatos mais comuns, como MP4, MOV e WebM. Recomendamos vídeos em resolução mínima de 1080p e áudio nítido. Após o envio, o processamento é automático e você é avisado quando a aula fica disponível.",
  },
  {
    question: "Como funcionam os certificados dos alunos?",
    answer:
      "Os certificados são emitidos automaticamente quando o aluno conclui 100% das aulas do curso. Você pode personalizar o modelo de certificado na página Certificados, ajustando cores e identidade visual.",
  },
  {
    question: "Como são calculados os pagamentos e repasses?",
    answer:
      "Os repasses consideram as matrículas e vendas dos seus cursos no período, descontadas as taxas da plataforma. O valor consolidado é pago mensalmente. O extrato detalhado fica disponível no seu painel financeiro.",
  },
  {
    question: "Como moderar os comentários das aulas?",
    answer:
      "Na página Comentários você acompanha, responde e modera as mensagens dos alunos. É possível responder diretamente, marcar como resolvido e remover comentários que violem as diretrizes da comunidade.",
  },
  {
    question: "Preciso de ajuda com algo que não está aqui. Como falo com o suporte?",
    answer:
      "Fale com a equipe da Matra Tecnologia pelo e-mail matratecnologia@gmail.com ou pelo WhatsApp +55 (43) 99914-0409. Respondemos em horário comercial e ajudamos com qualquer questão técnica ou pedagógica.",
  },
]
