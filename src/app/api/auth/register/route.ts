import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export const dynamic = "force-dynamic"

const SOCORROS = "curso-socorros-01"

async function resolveCourse(courseKey?: string | null) {
  if (courseKey === "socorros") {
    return prisma.course.findUnique({ where: { id: SOCORROS } })
  }
  return prisma.course.findFirst({
    where: { isPublished: true, id: { not: SOCORROS } },
    orderBy: { createdAt: "asc" },
  })
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 })
  }
  const userId = (session.user as { id?: string }).id
  if (!userId) {
    return NextResponse.json({ error: "Sessão inválida" }, { status: 401 })
  }

  const body = await req.json().catch(() => ({}))
  const courseKey = body?.course || new URL(req.url).searchParams.get("curso")
  const course = await resolveCourse(courseKey)
  if (!course) {
    return NextResponse.json({ error: "Curso não encontrado" }, { status: 404 })
  }

  const existing = await prisma.enrollment.findUnique({
    where: { userId_courseId: { userId, courseId: course.id } },
  })
  if (existing) {
    return NextResponse.json({ ok: true, already: true, courseId: course.id })
  }

  await prisma.enrollment.create({
    data: { userId, courseId: course.id, status: "ACTIVE" },
  })

  return NextResponse.json({ ok: true, courseId: course.id })
    }
