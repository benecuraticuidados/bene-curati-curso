import { getServerSession } from "next-auth"
import { NextResponse } from "next/server"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

async function requireAdmin() {
  const session = await getServerSession(authOptions)
  if (!session?.user || (session.user as any).role !== "ADMIN") {
    return null
  }
  return session
}

export async function POST(req: Request) {
  const session = await requireAdmin()
  if (!session) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
  }

  const body = await req.json()
  const name = String(body.name || "").trim()
  const email = String(body.email || "").trim().toLowerCase()
  const password = String(body.password || "").trim()
  const cpf = String(body.cpf || "").trim() || null
  const whatsapp = String(body.whatsapp || "").trim() || null

  if (!name || !email || !password) {
    return NextResponse.json(
      { error: "Nome, e-mail e senha são obrigatórios." },
      { status: 400 }
    )
  }
  if (password.length < 6) {
    return NextResponse.json({ error: "Senha com no mínimo 6 caracteres." }, { status: 400 })
  }

  const exists = await prisma.user.findUnique({ where: { email } })
  if (exists) {
    return NextResponse.json({ error: "Já existe usuário com este e-mail." }, { status: 409 })
  }

  const bcrypt = (await import("bcryptjs")).default
  const passwordHash = await bcrypt.hash(password, 12)

  const course = await prisma.course.findFirst({ orderBy: { createdAt: "asc" } })
  const user = await prisma.user.create({
    data: {
      name,
      email,
      passwordHash,
      cpf,
      whatsapp,
      role: "STUDENT",
      isActive: true,
    },
  })

  if (course) {
    await prisma.enrollment.create({
      data: { userId: user.id, courseId: course.id, status: "ACTIVE" },
    })
  }

  await prisma.auditLog.create({
    data: {
      actorId: (session.user as { id?: string }).id,
      action: "USER_CREATED_MANUAL",
      entity: "User",
      entityId: user.id,
      details: `Aluno incluído manualmente: ${name} (${email})`,
    },
  })

  return NextResponse.json({ ok: true, userId: user.id })
}

export async function PUT(req: Request) {
  const session = await requireAdmin()
  if (!session) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
  }

  const body = await req.json().catch(() => ({}))
  const userId = String(body.userId || "")
  const name = String(body.name || "").trim()
  const email = String(body.email || "").trim().toLowerCase()
  const whatsapp = String(body.whatsapp || "").trim() || null
  const cpf = String(body.cpf || "").trim() || null
  const password = String(body.password || "").trim()

  if (!userId || !name || !email) {
    return NextResponse.json({ error: "Nome e e-mail são obrigatórios." }, { status: 400 })
  }

  const user = await prisma.user.findUnique({ where: { id: userId } })
  if (!user || user.role !== "STUDENT") {
    return NextResponse.json({ error: "Aluno não encontrado." }, { status: 404 })
  }

  const emailTaken = await prisma.user.findFirst({
    where: { email, NOT: { id: userId } },
  })
  if (emailTaken) {
    return NextResponse.json({ error: "Já existe usuário com este e-mail." }, { status: 409 })
  }

  const data: {
    name: string
    email: string
    whatsapp: string | null
    cpf: string | null
    passwordHash?: string
  } = { name, email, whatsapp, cpf }

  if (password) {
    if (password.length < 6) {
      return NextResponse.json({ error: "Senha com no mínimo 6 caracteres." }, { status: 400 })
    }
    const bcrypt = (await import("bcryptjs")).default
    data.passwordHash = await bcrypt.hash(password, 12)
  }

  await prisma.user.update({ where: { id: userId }, data })
  await prisma.auditLog.create({
    data: {
      actorId: (session.user as { id?: string }).id,
      action: password ? "USER_UPDATED_WITH_PASSWORD" : "USER_UPDATED",
      entity: "User",
      entityId: userId,
      details: `Aluno editado: ${name} (${email})`,
    },
  })

  return NextResponse.json({ ok: true })
}

export async function PATCH(req: Request) {
  const session = await requireAdmin()
  if (!session) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
  }

  const { userId, isActive } = await req.json()
  if (!userId || typeof isActive !== "boolean") {
    return NextResponse.json({ error: "Dados inválidos" }, { status: 400 })
  }

  const user = await prisma.user.findUnique({ where: { id: userId } })
  if (!user || user.role === "ADMIN") {
    return NextResponse.json(
      { error: "Usuário não encontrado ou protegido" },
      { status: 404 }
    )
  }

  await prisma.user.update({
    where: { id: userId },
    data: { isActive },
  })

  // Se bloquear, também bloquear matrículas
  if (!isActive) {
    await prisma.enrollment.updateMany({
      where: { userId, status: "ACTIVE" },
      data: { status: "BLOCKED" },
    })
  } else {
    await prisma.enrollment.updateMany({
      where: { userId, status: "BLOCKED" },
      data: { status: "ACTIVE" },
    })
  }

  await prisma.auditLog.create({
    data: {
      actorId: (session.user as any).id,
      action: isActive ? "USER_REACTIVATED" : "USER_BLOCKED",
      entity: "User",
      entityId: userId,
      details: `${user.name} (${user.email}) — isActive=${isActive}`,
    },
  })

  return NextResponse.json({ ok: true })
}

export async function DELETE(req: Request) {
  const session = await requireAdmin()
  if (!session) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
  }

  const { userId } = await req.json()
  if (!userId) {
    return NextResponse.json({ error: "userId obrigatório" }, { status: 400 })
  }

  const actorId = (session.user as { id?: string }).id
  if (userId === actorId) {
    return NextResponse.json({ error: "Você não pode excluir a própria conta." }, { status: 400 })
  }

  const user = await prisma.user.findUnique({ where: { id: userId } })
  if (!user) {
    return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 })
  }

  const issued = await prisma.certificate.findFirst({
    where: { userId, status: "ISSUED" },
  })
  if (issued) {
    return NextResponse.json(
      {
        error:
          "Este aluno possui certificado emitido e não pode ser excluído. Ele precisa poder baixar o certificado novamente.",
      },
      { status: 400 }
    )
  }

  if (user.role === "ADMIN") {
    const adminCount = await prisma.user.count({ where: { role: "ADMIN" } })
    if (adminCount <= 1) {
      return NextResponse.json(
        { error: "Não é possível excluir o último administrador." },
        { status: 400 }
      )
    }
  }

  await prisma.auditLog.create({
    data: {
      actorId,
      action: "USER_DELETED",
      entity: "User",
      entityId: userId,
      details: `Excluído: ${user.name} (${user.email}) role=${user.role}`,
    },
  })

  await prisma.user.delete({ where: { id: userId } })
  return NextResponse.json({ ok: true })
}
