# Full Time Brincar

App de jogos educativos para crianças, integrado ao monorepo Full Time como um frontend independente. Next.js App Router, React, Tailwind CSS e componentes gerados pelo CLI shadcn/ui. Mantém a versão de Next.js já usada pelo dashboard.

## Executar

Na raiz do monorepo:

```powershell
pnpm install
pnpm --filter app-games dev
```

Abra http://localhost:3002. A raiz direciona para `/home`.

## Páginas e atividades

- `/home`: cantinho da criança, resumo e sugestão de atividade.
- `/games`: catálogo com busca e filtros por habilidade.
- `/games/[slug]`: caça letras, junta sílabas, caça palavras, desenhe a letra, quiz de emojis, memória, números e cores.
- `/conquistas`: estrelas, álbum e atividades recentes.
- `/responsaveis`: apelido, incentivos por voz, modo tranquilo e textos maiores.

Os jogos não têm cronômetro nem punição por erro. Oferecem dicas, novas tentativas e pausa. A atividade de desenho aceita mouse e toque, verifica a cobertura de cada traço e oferece uma alternativa de reconhecimento por teclado. Essa alternativa trabalha reconhecimento de letras, enquanto o desenho trabalha o traçado. As atividades têm um conjunto inicial fixo de desafios; ainda não há progressão adaptativa de dificuldade.

O apelido, os ajustes e as últimas 100 conclusões ficam no `localStorage`, na chave `fulltime-brincar-v1`. Cada conclusão concede três estrelas. Os totais exibidos consideram esse histórico de até 100 atividades. Há validação dos dados carregados e aviso quando o navegador bloqueia o armazenamento. A voz usa a Web Speech API com `pt-BR` e depende das vozes disponíveis no dispositivo.

Esta versão não exige login, não envia informações da criança à API e ainda não sincroniza progresso entre dispositivos ou com o módulo de crianças do EAD. Essa integração precisa de autenticação e autorização do responsável/profissional.

## Verificação

```powershell
pnpm --filter app-games typecheck
pnpm --filter app-games lint
pnpm --filter app-games test
pnpm --filter app-games build
```

`src/lib/game-logic.test.ts` verifica seleção adjacente de palavras, limites das linhas e cobertura dos traços. Com o servidor ativo e um navegador automatizado aberto no app, `scripts/browser-check.js` percorre os oito jogos pelo DOM, conclui atividades e verifica pausa, dicas, tentativas, estrelas, gravação e conquistas:

```powershell
pnpm dlx agent-browser@0.20.0 open http://localhost:3002/games
Get-Content -Raw apps/app-games/scripts/browser-check.js | pnpm dlx agent-browser@0.20.0 eval --stdin
```

Execute a verificação em um perfil de navegador de teste: ela registra oito atividades no armazenamento local. O teste do desenho nesse roteiro usa a alternativa por teclado; o traçado por ponteiro é verificado separadamente.

As URLs de referência `/home` e `/games` do Fórmula da Leitura apresentaram uma tela de acesso com nome e e-mail durante a análise. A interface interna não ficou disponível para comparação; o app segue as atividades solicitadas e uma identidade própria Full Time.
