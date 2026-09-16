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
