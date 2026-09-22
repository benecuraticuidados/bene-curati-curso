import { NextResponse } from "next/server"
import crypto from "crypto"
import bcrypt from "bcryptjs"
import { prisma } from "@/lib/prisma"
import { validatePassword } from "@/lib/password-policy"

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}))
  const token = String(body.token || "")
  const newPassword = String(body.newPassword || "")
  const confirmPassword = String(body.confirmPassword || "")

  if (!token) return NextResponse.json({ error: "Link inválido." }, { status: 400 })
  if (newPassword !== confirmPassword) {
    return NextResponse.json({ error: "A confirmação não coincide com a nova senha." }, { status: 400 })
  }
  const policy = validatePassword(newPassword)
  if (policy) return NextResponse.json({ error: policy }, { status: 400 })

  const tokenHash = crypto.createHash("sha256").update(token).digest("hex")
  const row = await prisma.passwordResetToken.findUnique({ where: { tokenHash } })
  if (!row || row.usedAt || row.expiresAt < new Date()) {
    return NextResponse.json({ error: "Este link expirou ou já foi usado." }, { status: 400 })
  }

  const passwordHash = await bcrypt.hash(newPassword, 12)
  await prisma.$transaction([
    prisma.user.update({ where: { id: row.userId }, data: { passwordHash } }),
    prisma.passwordResetToken.update({ where: { id: row.id }, data: { usedAt: new Date() } }),
  ])

  return NextResponse.json({ ok: true })
}
