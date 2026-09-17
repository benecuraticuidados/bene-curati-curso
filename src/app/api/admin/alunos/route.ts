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
