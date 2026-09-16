# Publicar o curso e abrir no celular

Objetivo: ter um link tipo `https://bene-curati-xxxx.vercel.app` para abrir no celular.

Você precisa de:
- E-mail: benecurati@gmail.com (ou o que usar no GitHub)
- Celular ou computador
- Cerca de 15–20 minutos

---

## Passo 1 — Criar conta no GitHub

1. Abra no celular: https://github.com/signup
2. Use o e-mail **benecurati@gmail.com**
3. Crie a senha e confirme o e-mail

## Passo 2 — Criar repositório

1. Entre em https://github.com/new
2. Nome do repositório: `bene-curati-curso`
3. Deixe **Public**
4. NÃO marque "Add README"
5. Clique em **Create repository**

## Passo 3 — Enviar o código

No **computador** (mais fácil), na pasta do projeto:

```bash
cd bene-curati-curso
git init
git add .
git commit -m "Curso Bene Curati - versão inicial"
git branch -M main
git remote add origin https://github.com/SEU_USUARIO/bene-curati-curso.git
git push -u origin main
```

(Substitua SEU_USUARIO pelo seu usuário do GitHub.)

Se só tiver celular, peça para alguém com PC enviar o código, ou use o app GitHub + um serviço de upload.

## Passo 4 — Banco de dados grátis (Neon)

1. Abra: https://neon.tech e crie conta (pode ser com Google/GitHub)
2. Create project → nome: `bene-curati`
3. Copie a **connection string** (começa com `postgresql://...`)

## Passo 5 — Ajustar o Prisma para Postgres

No arquivo `prisma/schema.prisma`, a linha do provider deve ficar:

```
provider = "postgresql"
```

(em vez de `sqlite`)

## Passo 6 — Publicar no Vercel

1. Abra: https://vercel.com/signup (entre com GitHub)
2. **Add New Project** → importe `bene-curati-curso`
3. Em **Environment Variables**, adicione:

| Nome | Valor |
|------|--------|
| `DATABASE_URL` | (cole a string do Neon) |
| `NEXTAUTH_SECRET` | qualquer frase longa secreta, ex: `bene-curati-2026-chave-forte` |
| `NEXTAUTH_URL` | deixe em branco no 1º deploy; depois coloque a URL que o Vercel gerar |

4. Clique em **Deploy**

## Passo 7 — Popular o banco (seed)

Depois do primeiro deploy, no terminal (PC):

```bash
# com DATABASE_URL do Neon no .env
npx prisma db push
npx tsx prisma/seed.ts
```

Ou use o **Prisma Data Browser** / SQL no Neon se preferir.

## Passo 8 — Link no celular

O Vercel mostra uma URL assim:

**https://bene-curati-curso-xxxxx.vercel.app**

Abra essa URL no navegador do celular.

### Logins de teste
- Aluno: `aluno@teste.com` / `aluno123`
- Admin: `admin@benecurati.com.br` / `admin123`

---

## Depois do primeiro deploy

1. Copie a URL do Vercel
2. Em Vercel → Project → Settings → Environment Variables
3. Atualize `NEXTAUTH_URL` com a URL completa (https://...)
4. Redeploy

Pronto: o link funciona no celular de qualquer lugar.
