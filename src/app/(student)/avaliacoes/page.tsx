import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import StudentHeader from "@/components/StudentHeader"
import Link from "next/link"
import { ClipboardList, CheckCircle2, AlertCircle, ArrowRight } from "lucide-react"

export default async function AvaliacoesPage() {
  const session = await getServerSession(authOptions)
  if (!session?.user) redirect("/login")

  const userId = (session.user as any).id as string

  const enrollment = await prisma.enrollment.findFirst({
    where: { userId, status: { in: ["ACTIVE", "COMPLETED"] } },
    include: { course: true },
  })

  if (!enrollment) redirect("/dashboard")

  const quizzes = await prisma.quiz.findMany({
    where: { courseId: enrollment.courseId },
    orderBy: { order: "asc" },
    include: {
      _count: { select: { questions: true } },
      attempts: {
        where: { userId },
        orderBy: { attemptNum: "desc" },
      },
    },
  })

  return (
    <div className="min-h-screen bg-gray-50">
      <StudentHeader />

      <main className="max-w-3xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Avaliações</h1>
          <p className="text-gray-500 mt-1">
            Testes por módulo e Prova Final do Curso Profissional de Cuidador
          </p>
        </div>

        <div className="space-y-4">
          {quizzes.map((quiz) => {
            const lastAttempt = quiz.attempts[0]
            const attemptsUsed = quiz.attempts.length
            const unlimited = quiz.maxAttempts <= 0
            const canTry = unlimited || attemptsUsed < quiz.maxAttempts
            const passed = lastAttempt?.passed

            return (
              <div key={quiz.id} className="card">
                <div className="flex items-start gap-4">
                  <div
                    className={`w-11 h-11 rounded-lg flex items-center justify-center flex-shrink-0 ${
                      quiz.isFinal
                        ? "bg-wine/10 text-wine"
                        : "bg-amber-50 text-amber-600"
                    }`}
                  >
                    <ClipboardList className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <h2 className="font-semibold text-gray-900">
                        {quiz.title}
                      </h2>
                      {quiz.isFinal && (
                        <span className="text-xs font-medium bg-wine text-white px-2 py-0.5 rounded">
                          OBRIGATÓRIA
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-500 mb-2">
                      {quiz._count.questions} questões • Nota mínima:{" "}
                      {(quiz.minScore * 10).toFixed(0)}% •{" "}
                      {quiz.maxAttempts <= 0
                        ? "Tentativas ilimitadas"
                        : `Até ${quiz.maxAttempts} tentativa(s)`}
                    </p>

                    {lastAttempt && (
                      <div className="flex items-center gap-2 text-sm mb-3">
                        {passed ? (
                          <>
                            <CheckCircle2 className="w-4 h-4 text-green-600" />
                            <span className="text-green-700 font-medium">
                              Aprovado — {lastAttempt.score.toFixed(1)}/
                              {lastAttempt.maxScore}
                            </span>
                          </>
                        ) : (
                          <>
                            <AlertCircle className="w-4 h-4 text-red-500" />
                            <span className="text-red-600">
                              Não aprovado — {lastAttempt.score.toFixed(1)}/
                              {lastAttempt.maxScore} (tentativa{" "}
                              {lastAttempt.attemptNum})
                            </span>
                          </>
                        )}
                      </div>
                    )}

                    {canTry && !passed && (
                      <Link
                        href={`/avaliacoes/${quiz.id}`}
                        className="btn-primary inline-flex items-center gap-2 text-sm"
                      >
                        {attemptsUsed === 0 ? "Iniciar avaliação" : "Tentar novamente"}
                        <ArrowRight className="w-4 h-4" />
                      </Link>
                    )}

                    {passed && (
                      <p className="text-sm text-green-700 font-medium">
                        Avaliação concluída com sucesso.
                      </p>
                    )}

                    {!canTry && !passed && (
                      <p className="text-sm text-red-600">
                        Número máximo de tentativas atingido. Entre em contato com a coordenação.
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {quizzes.length === 0 && (
          <div className="card text-center text-gray-500">
            Nenhuma avaliação disponível no momento.
          </div>
        )}
      </main>
    </div>
  )
}
