import { getServerSession } from "next-auth"
import { NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

async function requireAdmin() {
  const session = await getServerSession(authOptions)
  if (!session?.user || (session.user as { role?: string }).role !== "ADMIN") {
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
  const name = String(body?.name || "").trim()
  const email = String(body?.email || "").toLowerCase().trim()
  const password = String(body?.password || "")
  const role = body?.role === "ADMIN" ? "ADMIN" : "STUDENT"

  if (!name || !email || password.length < 6) {
    return NextResponse.json(
      { error: "Nome, e-mail e senha (mín. 6 caracteres) são obrigatórios." },
      { status: 400 }
    )
  }

  const exists = await prisma.user.findUnique({ where: { email } })
  if (exists) {
    return NextResponse.json({ error: "Este e-mail já está cadastrado." }, { status: 400 })
  }

  const passwordHash = await bcrypt.hash(password, 12)
  const user = await prisma.user.create({
    data: {
      name,
      email,
      passwordHash,
      role,
      isActive: true,
    },
  })

  if (role === "STUDENT") {
    const course = await prisma.course.findFirst({ where: { isPublished: true } })
    if (course) {
      await prisma.enrollment.create({
        data: { userId: user.id, courseId: course.id, status: "ACTIVE" },
      })
    }
  }

  await prisma.auditLog.create({
    data: {
      actorId: (session.user as { id?: string }).id,
      action: role === "ADMIN" ? "ADMIN_CREATED" : "STUDENT_CREATED_BY_ADMIN",
      entity: "User",
      entityId: user.id,
      details: `${user.email} role=${role}`,
    },
  })

  return NextResponse.json({
    ok: true,
    user: { id: user.id, email: user.email, role: user.role, name: user.name },
  })
}
