import { NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { prisma } from "@/lib/prisma"

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { name, email, password, whatsapp, city, state } = body

    if (!name || !email || !password) {
      return NextResponse.json(
        { error: "Nome, e-mail e senha são obrigatórios" },
        { status: 400 }
      )
    }

    const existing = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
    })

    if (existing) {
      return NextResponse.json(
        { error: "Este e-mail já está cadastrado" },
        { status: 400 }
      )
    }

    const passwordHash = await bcrypt.hash(password, 12)

    const user = await prisma.user.create({
      data: {
        name: name.trim(),
        email: email.toLowerCase().trim(),
        passwordHash,
        whatsapp: whatsapp || null,
        city: city || null,
        state: state || null,
        role: "STUDENT",
        isActive: true,
      },
    })

    // Log
    await prisma.auditLog.create({
      data: {
        actorId: user.id,
        action: "USER_REGISTERED",
        entity: "User",
        entityId: user.id,
        details: `Novo aluno cadastrado: ${user.email}`,
      },
    })

    return NextResponse.json({
      success: true,
      message: "Conta criada com sucesso. Faça login para continuar.",
    })
  } catch (error) {
    console.error("Register error:", error)
    return NextResponse.json(
      { error: "Erro interno ao criar conta" },
      { status: 500 }
    )
  }
}
