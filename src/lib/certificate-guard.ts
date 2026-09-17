import { prisma } from "@/lib/prisma"

export async function courseCompleted(userId: string, courseId: string) {
  const course = await prisma.course.findUnique({
    where: { id: courseId },
    include: { modules: { include: { lessons: { select: { id: true } } } } },
  })
  if (!course) return false
  const lessonIds = course.modules.flatMap((m) => m.lessons.map((l) => l.id))
  if (lessonIds.length === 0) return false
  const done = await prisma.progress.count({
    where: { userId, completed: true, lessonId: { in: lessonIds } },
  })
  if (done < lessonIds.length) return false

  const finalQuiz = await prisma.quiz.findFirst({
    where: { courseId, isFinal: true },
  })
  if (finalQuiz) {
    const passed = await prisma.quizAttempt.findFirst({
      where: { userId, quizId: finalQuiz.id, passed: true },
    })
    if (!passed) return false
  }
  return true
}

export async function paymentConfirmed(certificateId: string) {
  const paid = await prisma.certificatePayment.findFirst({
    where: { certificateId, status: "PAID" },
  })
  if (paid) return true
  const cert = await prisma.certificate.findUnique({
    where: { id: certificateId },
    select: { status: true, paymentRef: true },
  })
  // emissão manual registrada pelo admin
  return Boolean(cert?.status === "ISSUED" && cert.paymentRef)
}

export async function canReleaseCertificate(params: {
  userId: string
  certificateId: string
}) {
  const cert = await prisma.certificate.findUnique({
    where: { id: params.certificateId },
  })
  if (!cert || cert.userId !== params.userId) {
    return { ok: false as const, reason: "not_found" }
  }
  if (cert.status === "CANCELLED") {
    return { ok: false as const, reason: "cancelled" }
  }
  const completed = await courseCompleted(cert.userId, cert.courseId)
  if (!completed) {
    return { ok: false as const, reason: "course_incomplete" }
  }
  const paid = await paymentConfirmed(cert.id)
  if (!paid) {
    return { ok: false as const, reason: "payment_pending" }
  }
  return { ok: true as const, certificate: cert }
}
