import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export const dynamic = "force-dynamic"

const DEMOS = ["admin@benecurati.com.br", "aluno@teste.com"]

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  if (searchParams.get("key") !== "bene-curati-setup-2026") {
    return NextResponse.json({ error: "Chave inválida" }, { status: 401 })
  }

  const report: Record<string, unknown> = {
    aviso: "Rota temporária de diagnóstico. Remover após validação.",
    prisma: "OK",
    database: "OK",
    userCount: 0,
    demos: [] as unknown[],
    env: {
      hasDatabaseUrl: Boolean(process.env.DATABASE_URL),
      hasNextAuthSecret: Boolean(process.env.NEXTAUTH_SECRET),
      hasNextAuthUrl: Boolean(process.env.NEXTAUTH_URL),
      nextAuthUrlHost: (() => {
        try {
          return process.env.NEXTAUTH_URL
            ? new URL(process.env.NEXTAUTH_URL).host
            : null
        } catch {
          return "INVALID_URL"
        }
      })(),
      vercel: Boolean(process.env.VERCEL),
    },
  }

  try {
    report.userCount = await prisma.user.count()
    const users = await prisma.user.findMany({
      where: { email: { in: DEMOS } },
      select: {
        email: true,
        name: true,
        role: true,
        isActive: true,
        passwordHash: true,
      },
    })
    report.demos = users.map((u) => ({
      email: u.email,
      name: u.name,
      role: u.role,
      isActive: u.isActive,
      passwordLooksHashed: u.passwordHash.startsWith("$2"),
    }))
  } catch (error) {
    report.prisma = "ERRO"
    report.database = "ERRO"
    report.error = error instanceof Error ? error.message : "erro"
  }

  return NextResponse.json(report)
}
