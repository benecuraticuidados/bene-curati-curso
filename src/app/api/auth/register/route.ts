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

    if (String(password).length < 6) {
      return NextResponse.json(
        { error: "A senha deve ter pelo menos 6 caracteres" },
        { status: 400 }
      )
    }

    const normalizedEmail = email.toLowerCase().trim()

    const existing = await prisma.user.findUnique({
      where: { email: normalizedEmail },
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
        email: normalizedEmail,
        passwordHash,
        whatsapp: whatsapp || null,
        city: city || null,
        state: state || null,
        role: "STUDENT",
        isActive: true,
      },
    })

    // Matricular automaticamente no curso principal
    const course = await prisma.course.findFirst({
      where: { isPublished: true },
      orderBy: { createdAt: "asc" },
    })

    if (course) {
      await prisma.enrollment.create({
        data: {
          userId: user.id,
          courseId: course.id,
          status: "ACTIVE",
        },
      })
    }

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
      { error: "Erro interno ao criar conta. Tente novamente." },
      { status: 500 }
    )
  }
}
