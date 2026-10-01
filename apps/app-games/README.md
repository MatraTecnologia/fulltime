# Full Time Brincar

App de jogos educativos para crianças, integrado ao monorepo Full Time como um frontend independente. Next.js App Router, React, Tailwind CSS e componentes gerados pelo CLI shadcn/ui. Mantém a versão de Next.js já usada pelo dashboard.

## Executar

Na raiz do monorepo:

```powershell
pnpm install
pnpm --filter app-games dev
```

Abra http://localhost:3002. A raiz direciona para `/home`.

## Deploy no Easypanel

Configure o serviço `game` com o contexto de build na raiz do monorepo:

| Campo | Valor |
| --- | --- |
| Dockerfile Path | `apps/app-games/Dockerfile` |
| Build Context | `.` |
| Porta interna / destino do domínio | `3000` |

O Dockerfile instala as dependências com o lockfile do workspace e gera o servidor standalone do Next.js. A imagem executa como usuário `node`, escutando em `0.0.0.0:3000`.

O build arg `NEXT_PUBLIC_API_URL` é aceito para a integração com a API. Nesta versão, os jogos usam armazenamento local e não fazem chamadas à API.

Para reproduzir o build na raiz do repositório:

```powershell
docker build -f apps/app-games/Dockerfile -t fulltime-game .
docker run --rm -p 3000:3000 fulltime-game
```

Envie o Dockerfile e a configuração do Next.js para a branch usada pelo Easypanel antes de iniciar um novo deploy.

## Páginas e atividades

- `/home`: boas-vindas da corujinha, trilha dos oito jogos, progresso e sugestão de atividade.
- `/games`: catálogo com busca e filtros por habilidade.
- `/games/[slug]`: caça letras, junta sílabas, caça palavras, desenhe a letra, quiz de emojis, memória, números e cores.
- `/conquistas`: estrelas, álbum e atividades recentes.
- `/responsaveis`: apelido, incentivos por voz, modo tranquilo e textos maiores.

Os jogos não têm cronômetro nem punição por erro. Oferecem dicas, novas tentativas e pausa. A atividade de desenho aceita mouse e toque, verifica a cobertura de cada traço e oferece uma alternativa de reconhecimento por teclado. Essa alternativa trabalha reconhecimento de letras, enquanto o desenho trabalha o traçado. As atividades têm um conjunto inicial fixo de desafios; ainda não há progressão adaptativa de dificuldade.

O apelido, os ajustes e as últimas 100 conclusões ficam no `localStorage`, na chave `fulltime-brincar-v1`. Cada conclusão concede três estrelas. Os totais exibidos consideram esse histórico de até 100 atividades. Há validação dos dados carregados e aviso quando o navegador bloqueia o armazenamento.

A corujinha acompanha a criança na trilha e nas atividades, incentiva novas tentativas e comemora acertos e conclusões. A trilha sugere o primeiro jogo ainda não concluído, mas todos os jogos continuam disponíveis. As animações respeitam o modo tranquilo e a preferência de movimentos reduzidos. O nome personalizado da corujinha também aparece nas mensagens dos jogos.

A narração usa arquivos MP3 de voz neural brasileira em `public/audio/luna/v1`, reproduzidos com HTML Audio. Não usa o sintetizador de voz nativo do navegador nem faz chamadas a um serviço de voz durante os jogos. Os textos visuais usam o apelido da criança; os áudios são falas gerais pré-geradas, sem enviar dados da criança para gerar voz. Desligar o som, pausar ou trocar de página interrompe a reprodução; o botão Ouvir continua disponível com os incentivos automáticos desligados.

Os roteiros estão em `src/lib/voice-clips.json`. Para gerar novamente a narração, com Python e acesso à internet:

```powershell
py -m pip install --target .voice-tools edge-tts
$env:PYTHONPATH = (Resolve-Path .voice-tools).Path
py apps/app-games/scripts/generate-voice.py --overwrite
```

O gerador usa `pt-BR-FranciscaNeural`, com ritmo e entonação diferentes nas celebrações e nas mensagens de incentivo. `--only preview` gera uma amostra; `--voice` escolhe outra voz. Revise os áudios ao alterar os roteiros e inclua os MP3 no deploy. Python e o gerador não são dependências do app em produção.

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
