import { NextResponse } from "next/server"
import crypto from "crypto"
import { prisma } from "@/lib/prisma"

const GENERIC =
  "Se existir uma conta associada a este e-mail, enviaremos instruções para redefinição da senha."

async function sendResetEmail(to: string, link: string) {
  const key = process.env.RESEND_API_KEY
  if (!key) return false
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: process.env.EMAIL_FROM || "Bene Curati <nao-responda@benecurati.com.br>",
      to,
      subject: "Redefinir senha — Bene Curati Cuidados",
      text: `Use este link para redefinir sua senha (válido por 1 hora):\n\n${link}\n\nSe você não pediu isso, ignore este e-mail.`,
    }),
  })
  return res.ok
}

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
  await sendResetEmail(user.email, link)

  return NextResponse.json({ ok: true, message: GENERIC })
}
