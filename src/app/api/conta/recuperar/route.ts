import { NextResponse } from "next/server"
import crypto from "crypto"
import { prisma } from "@/lib/prisma"
import { passwordResetEmail, sendEmail } from "@/lib/email"

const GENERIC =
  "Se existir uma conta associada a este e-mail, enviaremos instruções para redefinição da senha."

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}))
  const email = String(body.email || "").toLowerCase().trim()
  if (!email) return NextResponse.json({ ok: true, message: GENERIC })

  const user = await prisma.user.findUnique({ where: { email } })
  if (!user || !user.isActive) {
    return NextResponse.json({ ok: true, message: GENERIC })
  }

  const raw = crypto.randomBytes(32).toString("hex")
  const tokenHash = crypto.createHash("sha256").update(raw).digest("hex")
  await prisma.passwordResetToken.create({
    data: {
      userId: user.id,
      tokenHash,
      expiresAt: new Date(Date.now() + 60 * 60 * 1000),
    },
  })

  const base = process.env.NEXTAUTH_URL || "https://app.benecurati.com.br"
  const link = `${base.replace(/\/$/, "")}/redefinir-senha?token=${raw}`
  const content = passwordResetEmail(link)
  await sendEmail({
    to: user.email,
    subject: "Redefinir senha — Bene Curati Cuidados",
    text: content.text,
    html: content.html,
  })

  return NextResponse.json({ ok: true, message: GENERIC })
}
