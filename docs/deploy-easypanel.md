# Deploy no Easypanel — Full Time

Guia para colocar a API (Fastify) e o Web (Next.js standalone) em produção via Easypanel com Docker.

## Pré-requisitos

- Repositório no GitHub/GitLab apontado no Easypanel
- PostgreSQL provisionado (Easypanel tem serviço nativo)
- Domínios configurados no painel (ex.: `api.seudominio.com` e `app.seudominio.com`)

---

## 1. Criar o serviço da API

No Easypanel, crie um novo **App** e configure:

| Campo | Valor |
|---|---|
| Source | GitHub — branch `main` |
| Dockerfile Path | `apps/api/Dockerfile` |
| Build Context | `.` (raiz do monorepo) |

### Variáveis de ambiente (runtime)

| Variável | Descrição |
|---|---|
| `DATABASE_URL` | URL completa do PostgreSQL (ex.: `postgresql://user:pass@host:5432/fulltime`) |
| `BETTER_AUTH_SECRET` | Secret aleatório longo (mín. 32 chars) |
| `BETTER_AUTH_URL` | URL pública da API (ex.: `https://api.seudominio.com`) |
| `FRONTEND_URL` | URL pública do web (ex.: `https://app.seudominio.com`) |
| `RESEND_API_KEY` | Chave da Resend para envio de e-mail |
| `MAIL_FROM` | Remetente de e-mail (ex.: `Full Time <noreply@seudominio.com>`) |
| `COOKIE_DOMAIN` | Domínio compartilhado para cookies de sessão (ex.: `.seudominio.com`) |
| `PORT` | Opcional — default `3333` |

---

## 2. Criar o serviço do Web

No Easypanel, crie outro **App** e configure:

| Campo | Valor |
|---|---|
| Source | GitHub — branch `main` |
| Dockerfile Path | `apps/web/Dockerfile` |
| Build Context | `.` (raiz do monorepo) |

### Build Arg (obrigatório)

`NEXT_PUBLIC_API_URL` é uma variável **build-time** — ela é inlined no bundle JavaScript durante o `next build`. Deve ser configurada como **build argument** no Easypanel (não como env de runtime):

| Build Arg | Valor |
|---|---|
| `NEXT_PUBLIC_API_URL` | `https://api.seudominio.com` |

> **Atenção:** alterar esta variável exige um novo build/deploy. Não adianta definir apenas como env de runtime.

### Variáveis de ambiente (runtime)

| Variável | Descrição |
|---|---|
| `PORT` | Opcional — default `3000` |

---

## 3. Migrar o schema do banco

O projeto usa `prisma db push` (sem migrations). Execute **uma vez** antes do primeiro deploy ou após mudanças no schema:

```bash
# Via console do Easypanel no container da API, ou rodando localmente com DATABASE_URL de produção:
DATABASE_URL="postgresql://user:pass@host:5432/fulltime" pnpm --filter @fulltime/api db:push
```

> A imagem de produção não inclui a CLI do Prisma. Para rodar `db:push`, use um container temporário a partir da imagem de build (`FROM build AS migrator ... RUN prisma db push`) ou conecte localmente ao banco de produção com `DATABASE_URL` exportado.

---

## 4. CORS e cookies em produção

Defina `COOKIE_DOMAIN` com o domínio-pai dos dois serviços para que o cookie de sessão funcione cross-subdomain:

```
COOKIE_DOMAIN=.seudominio.com
```

`BETTER_AUTH_URL` deve ser a URL exata onde a API está acessível, e `FRONTEND_URL` deve corresponder ao domínio do web — esses valores controlam o CORS e a validação de origem dos cookies.

---

## 5. Checklist de deploy

- [ ] PostgreSQL provisionado e `DATABASE_URL` configurada
- [ ] `db:push` executado contra o banco de produção
- [ ] `BETTER_AUTH_SECRET` com valor forte e único por ambiente
- [ ] Build arg `NEXT_PUBLIC_API_URL` configurado no serviço web
- [ ] Domínios e HTTPS configurados nos dois apps
- [ ] `COOKIE_DOMAIN` igual para API e web

> Criado em 2026-06-30 15:46 (-03) · Última modificação: 2026-06-30 15:46 (-03)
