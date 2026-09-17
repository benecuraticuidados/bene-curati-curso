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
  const { quizId, answers, attemptNum } = await req.json()

  if (!quizId || !answers) {
    return NextResponse.json({ error: "Dados incompletos" }, { status: 400 })
  }

  const quiz = await prisma.quiz.findUnique({
    where: { id: quizId },
    include: {
      questions: {
        include: { options: true },
      },
      attempts: {
        where: { userId },
      },
    },
  })

  if (!quiz) {
    return NextResponse.json({ error: "Avaliação não encontrada" }, { status: 404 })
  }

  const unlimited = quiz.maxAttempts <= 0
  if (!unlimited && quiz.attempts.length >= quiz.maxAttempts) {
    return NextResponse.json(
      { error: "Número máximo de tentativas atingido" },
      { status: 403 }
    )
  }

  // Já aprovado?
  if (quiz.attempts.some((a) => a.passed)) {
    return NextResponse.json(
      { error: "Você já foi aprovado nesta avaliação" },
      { status: 403 }
    )
  }

  // Verificar matrícula
  if (quiz.courseId) {
    const enrollment = await prisma.enrollment.findFirst({
      where: {
        userId,
        courseId: quiz.courseId,
        status: { in: ["ACTIVE", "COMPLETED"] },
      },
    })
    if (!enrollment) {
      return NextResponse.json({ error: "Não matriculado" }, { status: 403 })
    }
  }

  // Correção
  let correctCount = 0
  const maxScore = quiz.questions.length
  const details: { questionId: string; correct: boolean; explanation?: string }[] = []

  for (const question of quiz.questions) {
    const selectedOptionId = answers[question.id]
    const correctOption = question.options.find((o) => o.isCorrect)
    const isCorrect = selectedOptionId === correctOption?.id

    if (isCorrect) correctCount++

    details.push({
      questionId: question.id,
      correct: isCorrect,
      explanation: question.explanation || undefined,
    })
  }

  const score = correctCount // 1 ponto por questão
  const percent = maxScore > 0 ? (score / maxScore) * 100 : 0
  // minScore is 0-10 scale (7.0 = 70%)
  const passed = percent >= quiz.minScore * 10

  const attempt = await prisma.quizAttempt.create({
    data: {
      userId,
      quizId,
      score,
      maxScore,
      passed,
      answersJson: JSON.stringify(answers),
      attemptNum: attemptNum || quiz.attempts.length + 1,
      finishedAt: new Date(),
    },
  })

  // Log
  await prisma.auditLog.create({
    data: {
      actorId: userId,
      action: passed ? "QUIZ_PASSED" : "QUIZ_FAILED",
      entity: "QuizAttempt",
      entityId: attempt.id,
      details: `Quiz ${quiz.title}: ${score}/${maxScore} (${percent.toFixed(0)}%)`,
    },
  })

  return NextResponse.json({
    score,
    maxScore,
    passed,
    percent,
    details,
  })
}
