import { getServerSession } from "next-auth"
import { redirect, notFound } from "next/navigation"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import StudentHeader from "@/components/StudentHeader"
import QuizForm from "./QuizForm"

export default async function QuizPage({
  params,
}: {
  params: { id: string }
}) {
  const session = await getServerSession(authOptions)
  if (!session?.user) redirect("/login")

  const userId = (session.user as any).id as string
  const quizId = params.id

  const quiz = await prisma.quiz.findUnique({
    where: { id: quizId },
    include: {
      questions: {
        orderBy: { order: "asc" },
        include: {
          options: { orderBy: { order: "asc" } },
        },
      },
      attempts: {
        where: { userId },
        orderBy: { attemptNum: "desc" },
      },
    },
  })

  if (!quiz) notFound()

  // Verificar matrícula
  if (quiz.courseId) {
    const enrollment = await prisma.enrollment.findFirst({
      where: {
        userId,
        courseId: quiz.courseId,
        status: { in: ["ACTIVE", "COMPLETED"] },
      },
    })
    if (!enrollment) redirect("/dashboard")
  }

  const attemptsUsed = quiz.attempts.length
  const lastAttempt = quiz.attempts[0]
  const alreadyPassed = lastAttempt?.passed === true
  const unlimited = quiz.maxAttempts <= 0
  const maxReached = !unlimited && attemptsUsed >= quiz.maxAttempts

  if (alreadyPassed || maxReached) {
    return (
      <div className="min-h-screen bg-gray-50">
        <StudentHeader />
        <main className="max-w-2xl mx-auto px-4 py-10 text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">{quiz.title}</h1>
          {alreadyPassed ? (
            <div className="card mt-6">
              <p className="text-green-700 font-semibold text-lg mb-2">
                Você já foi aprovado nesta avaliação
              </p>
              <p className="text-gray-600">
                Nota: {lastAttempt.score.toFixed(1)} / {lastAttempt.maxScore} (
                {((lastAttempt.score / lastAttempt.maxScore) * 100).toFixed(0)}%)
              </p>
            </div>
          ) : (
            <div className="card mt-6">
              <p className="text-red-600 font-semibold text-lg mb-2">
                Tentativas esgotadas
              </p>
              <p className="text-gray-600">
                Última nota: {lastAttempt?.score.toFixed(1)} / {lastAttempt?.maxScore}
              </p>
              <p className="text-sm text-gray-500 mt-2">
                Entre em contato com a coordenação da Bene Curati.
              </p>
            </div>
          )}
          <a href="/avaliacoes" className="btn-outline inline-block mt-6">
            Voltar às avaliações
          </a>
        </main>
      </div>
    )
  }

  // Preparar questões sem revelar a resposta correta
  const questionsForClient = quiz.questions.map((q) => ({
    id: q.id,
    text: q.text,
    type: q.type,
    order: q.order,
    options: q.options.map((o) => ({
      id: o.id,
      text: o.text,
      order: o.order,
    })),
  }))

  return (
    <div className="min-h-screen bg-gray-50">
      <StudentHeader />
      <main className="max-w-3xl mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">{quiz.title}</h1>
          <p className="text-gray-500 text-sm mt-1">{quiz.description}</p>
          <p className="text-sm text-gray-400 mt-2">
            Tentativa {attemptsUsed + 1}
            {quiz.maxAttempts <= 0 ? " (ilimitadas)" : ` de ${quiz.maxAttempts}`}{" "}
            •{" "}
            {quiz.questions.length} questões • Nota mínima:{" "}
            {(quiz.minScore * 10).toFixed(0)}%
          </p>
        </div>

        <QuizForm
          quizId={quiz.id}
          questions={questionsForClient}
          minScore={quiz.minScore}
          attemptNum={attemptsUsed + 1}
        />
      </main>
    </div>
  )
}
