Você é um Staff Software Engineer especialista em Next.js, arquitetura escalável e produtos SaaS.

Estou construindo uma plataforma EAD chamada Full Time.

Tecnologias:

- Next.js 15 (App Router)
- TypeScript
- Shadcn/UI
- TailwindCSS
- Better Auth
- Axios
- React Hook Form
- Zod
- Lucide Icons
- Tanstack Query
- Zustand

Objetivo:
Construir um painel completo para profissionais/instrutores de uma plataforma EAD.

A interface deve seguir o design das imagens de referência e possuir aparência moderna semelhante a:

- Coursera
- Hotmart
- Notion
- Stripe Dashboard
- Kajabi
- Teachable

Crie toda a arquitetura do projeto, componentes, páginas e estrutura de pastas.

# Estrutura desejada

src/
├── app
├── components
├── hooks
├── services
├── providers
├── store
├── types
├── lib
├── schemas
├── actions
├── utils
└── constants

# Sistema de autenticação

Utilizar Better Auth.

Fluxos:

- Login
- Recuperação de senha
- Primeiro acesso
- Logout
- Proteção de rotas
- Middleware
- Controle por roles.

Roles:

- admin
- instructor
- student

Criar:

- AuthProvider
- useAuth()
- SessionProvider

# Layout

Criar:

DashboardLayout

com:

- Sidebar recolhível
- Header
- Breadcrumb
- Search global
- Notifications
- User Menu
- Dark Mode
- Responsividade completa.

# Sidebar

Visão Geral
Meus Cursos
Conteúdos
Turmas
Alunos
Comentários
Certificados
Financeiro
Relatórios
Recursos
Configurações

# Dashboard

Criar cards:

- Total de alunos
- Cursos publicados
- Taxa de conclusão
- Ganhos
- Avaliações
- Horas de conteúdo

Criar gráficos usando Recharts:

- Crescimento de alunos
- Receita
- Taxa de conclusão
- Engajamento.

# Página Perfil

Funcionalidades:

- Foto de perfil
- Banner
- Nome
- Bio
- Especialidade
- Formação
- Redes sociais
- Certificações
- Upload de documentos
- Alteração de senha
- Configurações de conta.

# Página Meus Cursos

Tabela com:

- Thumbnail
- Nome
- Status
- Alunos
- Avaliação
- Conclusão
- Ações.

Filtros:

- Publicado
- Rascunho
- Arquivado.

Criar:

- paginação;
- busca;
- ordenação.

# Página Curso Detalhado

Abas:

- Visão Geral
- Conteúdo
- Turmas
- Alunos
- Avaliações
- Certificados
- Configurações.

Mostrar:

- métricas;
- gráficos;
- progresso;
- principais aulas.

# Página Conteúdos

Upload de:

- Vídeo
- PDF
- DOCX
- Imagem
- Áudio.

Criar:

- drag and drop;
- barra de progresso;
- preview;
- status de processamento.

# Página Alunos

Tabela:

- Nome
- Curso
- Progresso
- Último acesso
- Certificados
- Situação.

# Página Certificados

Mostrar:

- certificados emitidos;
- certificados pendentes;
- visualização do certificado;
- download.

# Página Financeiro

Cards:

- Receita total
- Receita mensal
- Próximos pagamentos.

Tabela:

- pagamentos;
- saques;
- histórico.

# Página Relatórios

Criar:

- relatório de alunos;
- relatório de cursos;
- relatório financeiro;
- exportação CSV.

# Página Configurações

Abas:

- Perfil
- Conta
- Segurança
- Preferências
- Notificações
- Integrações.

# API

Utilizar Axios.

Criar:

services/
auth.service.ts
courses.service.ts
students.service.ts
certificates.service.ts
financial.service.ts
reports.service.ts

Criar:

axios.ts

com:

- interceptors;
- refresh token;
- tratamento de erros;
- retry automático.

# Tanstack Query

Criar:

- queries;
- mutations;
- invalidations;
- optimistic updates.

# Formulários

Usar:

- React Hook Form
- Zod
- Shadcn Form.

# Componentes reutilizáveis

Criar:

DataTable
StatsCard
ChartCard
PageHeader
SearchInput
FileUploader
ProfileCard
ProgressCard
CourseCard
EmptyState
LoadingSkeleton
ConfirmDialog
DeleteDialog
Pagination

# Qualidade

Utilizar:

- Server Components quando possível;
- Client Components apenas quando necessário;
- Suspense;
- Lazy Loading;
- Error Boundaries;
- Loading States;
- Empty States;
- Toasts;
- Acessibilidade;
- SEO.

# Entrega

Construa:

1. Estrutura completa de pastas.
2. Código de cada página.
3. Layouts.
4. Componentes.
5. Hooks.
6. Providers.
7. Services.
8. Schemas.
9. Types.
10. Middleware de autenticação.
11. Implementação do Better Auth.
12. Dashboard totalmente funcional e pronto para produção.

Siga uma arquitetura escalável e limpa, utilizando princípios de Clean Architecture e Feature-Based Structure.