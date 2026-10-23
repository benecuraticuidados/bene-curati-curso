import { prisma } from "@/lib/prisma"
import { courseCompleted } from "@/lib/certificate-guard"

async function lessonIds(courseId: string) {
  const course = await prisma.course.findUnique({
    where: { id: courseId },
    include: { modules: { include: { lessons: { select: { id: true } } } } },
  })
  return course?.modules.flatMap((m) => m.lessons.map((l) => l.id)) || []
}

export async function recordCourseStart(userId: string, courseId: string, at = new Date()) {
  const enrollment = await prisma.enrollment.findFirst({ where: { userId, courseId } })
  if (!enrollment || enrollment.startedAt) return
  await prisma.enrollment.update({
    where: { id: enrollment.id },
    data: { startedAt: at },
  })
}

export async function recordRequirementsIfComplete(userId: string, courseId: string) {
  const enrollment = await prisma.enrollment.findFirst({ where: { userId, courseId } })
  if (!enrollment || enrollment.requirementsCompletedAt) return
  if (!(await courseCompleted(userId, courseId))) return

  const ids = await lessonIds(courseId)
  const lastLesson = await prisma.progress.findFirst({
    where: { userId, completed: true, lessonId: { in: ids }, completedAt: { not: null } },
    orderBy: { completedAt: "desc" },
  })
  const finalQuiz = await prisma.quiz.findFirst({ where: { courseId, isFinal: true } })
  const passed = finalQuiz
    ? await prisma.quizAttempt.findFirst({
        where: { userId, quizId: finalQuiz.id, passed: true },
        orderBy: { finishedAt: "desc" },
      })
    : null

  const times = [lastLesson?.completedAt, passed?.finishedAt].filter(Boolean) as Date[]
  if (!times.length) return
  const at = new Date(Math.max(...times.map((d) => new Date(d).getTime())))

  await prisma.enrollment.update({
    where: { id: enrollment.id },
    data: { requirementsCompletedAt: at },
  })
}

export async function resolveCertificateDates(userId: string, courseId: string) {
  const enrollment = await prisma.enrollment.findFirst({ where: { userId, courseId } })
  if (!enrollment) return null

  if (!enrollment.startedAt) {
    const ids = await lessonIds(courseId)
    const first = await prisma.progress.findFirst({
      where: { userId, lessonId: { in: ids }, completedAt: { not: null } },
      orderBy: { completedAt: "asc" },
    })
    // fallback: data da própria matrícula, nunca user.createdAt
    const startedAt = first?.completedAt || enrollment.enrolledAt
    await prisma.enrollment.update({ where: { id: enrollment.id }, data: { startedAt } })
    enrollment.startedAt = startedAt
  }

  if (!enrollment.requirementsCompletedAt) {
    await recordRequirementsIfComplete(userId, courseId)
    const fresh = await prisma.enrollment.findUnique({ where: { id: enrollment.id } })
    enrollment.requirementsCompletedAt = fresh?.requirementsCompletedAt || null
  }

  if (!enrollment.requirementsCompletedAt) return null
  return {
    startedAt: enrollment.startedAt!,
    requirementsCompletedAt: enrollment.requirementsCompletedAt,
  }
      }
      
