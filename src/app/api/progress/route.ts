import { getServerSession } from "next-auth"
import { NextResponse } from "next/server"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
  }

  const userId = (session.user as any).id as string
  const body = await req.json()
  const { lessonId, completed } = body

  if (!lessonId) {
    return NextResponse.json({ error: "lessonId obrigatório" }, { status: 400 })
  }

  // Verificar se a aula existe e se o aluno está matriculado no curso
  const lesson = await prisma.lesson.findUnique({
    where: { id: lessonId },
    include: { module: true },
  })

  if (!lesson) {
    return NextResponse.json({ error: "Aula não encontrada" }, { status: 404 })
  }

  const enrollment = await prisma.enrollment.findFirst({
    where: {
      userId,
      courseId: lesson.module.courseId,
      status: { in: ["ACTIVE", "COMPLETED"] },
    },
  })

  if (!enrollment) {
    return NextResponse.json({ error: "Não matriculado" }, { status: 403 })
  }

  const progress = await prisma.progress.upsert({
    where: {
      userId_lessonId: { userId, lessonId },
    },
    update: {
      completed: !!completed,
      completedAt: completed ? new Date() : null,
      lastAccess: new Date(),
    },
    create: {
      userId,
      lessonId,
      completed: !!completed,
      completedAt: completed ? new Date() : null,
      lastAccess: new Date(),
    },
  })

  return NextResponse.json({ success: true, progress })
}
