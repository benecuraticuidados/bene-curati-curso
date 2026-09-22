import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import bcrypt from "bcryptjs"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { validatePassword } from "@/lib/password-policy"

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user) return NextResponse.json({ error: "Não autenticado" }, { status: 401 })
  const userId = (session.user as { id?: string }).id as string

  const body = await req.json()
  const currentPassword = String(body.currentPassword || "")
  const newPassword = String(body.newPassword || "")
  const confirmPassword = String(body.confirmPassword || "")

  if (newPassword !== confirmPassword) {
    return NextResponse.json({ error: "A confirmação não coincide com a nova senha." }, { status: 400 })
  }
  const policy = validatePassword(newPassword)
  if (policy) return NextResponse.json({ error: policy }, { status: 400 })

  const user = await prisma.user.findUnique({ where: { id: userId } })
  if (!user) return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 })

  const ok = await bcrypt.compare(currentPassword, user.passwordHash)
  if (!ok) return NextResponse.json({ error: "Senha atual incorreta." }, { status: 400 })

  const passwordHash = await bcrypt.hash(newPassword, 12)
  await prisma.user.update({ where: { id: userId }, data: { passwordHash } })
  return NextResponse.json({ ok: true })
}
