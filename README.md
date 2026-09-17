# Bene Curati Cuidados — Curso Profissional de Cuidador

Plataforma completa de ensino online para formação de cuidadores de idosos, pessoas acamadas e pacientes em assistência domiciliar (Home Care).

## 🎯 Funcionalidades

- **Aluno**: cadastro, login, progresso, aulas com vídeo, materiais, avaliações, certificado (após taxa de R$ 75)
- **Administrador**: gestão completa de alunos, cursos, módulos, aulas, avaliações, certificados e relatórios
- **Certificado digital** com código único + validação pública + QR Code
- **Taxa de manutenção do certificado**: R$ 75,00 (pagamento simulado / preparado para integração)
- Interface 100% em português do Brasil, responsiva e profissional

## 🚀 Como rodar

### 1. Instalar dependências

```bash
cd bene-curati-curso
npm install
```

### 2. Configurar banco (SQLite)

```bash
npx prisma generate
npx prisma db push
npx tsx prisma/seed.ts
```

### 3. Rodar em desenvolvimento

```bash
npm run dev
```

Acesse: http://localhost:3000

### Credenciais de demonstração

| Perfil       | E-mail                      | Senha     |
|--------------|-----------------------------|-----------|
| Administrador| admin@benecurati.com.br     | admin123  |
| Aluno        | aluno@teste.com             | aluno123  |

## 📁 Estrutura principal

- `prisma/schema.prisma` — modelo completo do banco
- `prisma/seed.ts` — 18 módulos + aulas + avaliação + usuários demo
- `src/lib/auth.ts` — NextAuth com roles (ADMIN / STUDENT / INSTRUCTOR)
- `src/app/` — páginas (home, login, cadastro, dashboard aluno, painel admin, validação de certificado)

## 🔒 Segurança

- Senhas com bcrypt
- Sessões JWT via NextAuth
- Rotas protegidas por role
- Progresso e notas validados no backend
- Certificado só liberado após regras + pagamento da taxa

## 💳 Taxa de certificado

O certificado só é emitido após o aluno:

1. Concluir todas as aulas
2. Atingir nota mínima nas avaliações
3. Pagar a taxa de manutenção de **R$ 75,00**

O fluxo de pagamento está preparado para integração futura com Mercado Pago / Stripe / Pix.

## 🎨 Identidade visual

- Cores: vinho (#722F37), branco, cinza
- Frase: “NOSSA PAIXÃO É CUIDAR DE QUEM VOCÊ AMA!”

## Próximos passos sugeridos

1. Integrar gateway de pagamento real
2. Upload de vídeos e PDFs (S3 ou similar)
3. Notificações por e-mail / WhatsApp
4. Perfil de Instrutor ativo
5. Relatórios avançados e exportação CSV

---

Desenvolvido para a Bene Curati Cuidados.

## Materiais oficiais incluídos

- Logo oficial: `public/logo-bene-curati.png`
- Apostila Oficial (200h ampliada): `public/apostila-oficial-200h.pdf`
- Estrutura de módulos 100% alinhada ao sumário da apostila oficial (21 módulos + Prova Final)
- Carga horária: 204 horas (21 módulos)
- Nota mínima de aprovação: 70%
- Taxa de emissão/manutenção do certificado: R$ 75,00


## Atualizações recentes (200h + Certificado oficial)

- Carga horária: **200 horas** (base 160h + 40h aprofundamento)
- 21 módulos oficiais + 63 aulas
- Vídeos de YouTube embutidos (banho no leito Unifesp, primeiros socorros, higienização das mãos, etc.)
- Certificado digital com:
  - Logo oficial
  - Paleta vinho/bordô
  - CNPJ **60.725.201/0001-88**
  - Código único de autenticação
  - Página pública de validação: `/validar`
- Taxa de emissão/manutenção: R$ 75,00
- Download da Apostila Oficial PDF na área do aluno

