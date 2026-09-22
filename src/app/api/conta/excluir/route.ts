import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import bcrypt from "bcryptjs"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user) return NextResponse.json({ error: "Não autenticado" }, { status: 401 })
  const userId = (session.user as { id?: string }).id as string
  const role = (session.user as { role?: string }).role

  const body = await req.json().catch(() => ({}))
  const password = String(body.password || "")
  if (!password) return NextResponse.json({ error: "Informe a senha para confirmar." }, { status: 400 })

  const user = await prisma.user.findUnique({ where: { id: userId } })
  if (!user) return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 })
  if (role === "ADMIN") {
    return NextResponse.json({ error: "Conta administrativa não pode ser excluída por aqui." }, { status: 403 })
  }

  const ok = await bcrypt.compare(password, user.passwordHash)
  if (!ok) return NextResponse.json({ error: "Senha incorreta." }, { status: 400 })

  const issued = await prisma.certificate.findFirst({
    where: { userId, status: "ISSUED" },
  })
  if (issued) {
    return NextResponse.json(
      {
        error:
          "Não é possível excluir a conta porque existe certificado emitido. Você precisa poder baixá-lo novamente.",
      },
      { status: 400 }
    )
  }

  await prisma.user.delete({ where: { id: userId } })
  return NextResponse.json({ ok: true })
}
