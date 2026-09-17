import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import StudentHeader from "@/components/StudentHeader"
import Link from "next/link"
import {
  BookOpen,
  Award,
  PlayCircle,
  CheckCircle2,
  ClipboardList,
  ArrowRight,
  TrendingUp,
} from "lucide-react"

export default async function DashboardPage() {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    redirect("/login")
  }

  const userId = (session.user as any).id as string

  // Buscar matrícula + curso
  const enrollment = await prisma.enrollment.findFirst({
    where: { userId, status: { in: ["ACTIVE", "COMPLETED"] } },
    include: {
      course: {
        include: {
          modules: {
            orderBy: { order: "asc" },
            include: {
              lessons: { orderBy: { order: "asc" } },
            },
          },
        },
      },
    },
  })

  if (!enrollment) {
    return (
      <div className="min-h-screen bg-gray-50">
        <StudentHeader />
        <main className="max-w-3xl mx-auto px-4 py-16 text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Olá, {session.user.name}!
          </h1>
          <p className="text-gray-600 mb-6">
            Você ainda não está matriculado em nenhum curso.
          </p>
          <p className="text-sm text-gray-500">
            Entre em contato com a Bene Curati Cuidados para liberar seu acesso.
          </p>
        </main>
      </div>
    )
  }

  const course = enrollment.course
  const allLessons = course.modules.flatMap((m) => m.lessons)
  const totalLessons = allLessons.length
  const totalModules = course.modules.length

  // Progresso do aluno
  const progressList = await prisma.progress.findMany({
    where: { userId, lessonId: { in: allLessons.map((l) => l.id) } },
  })

  const completedLessons = progressList.filter((p) => p.completed).length
  const progressPercent =
    totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0

  // Módulos concluídos (todos as aulas do módulo marcadas)
  let completedModules = 0
  for (const mod of course.modules) {
    const modLessonIds = mod.lessons.map((l) => l.id)
    if (modLessonIds.length === 0) continue
    const done = modLessonIds.every((id) =>
      progressList.some((p) => p.lessonId === id && p.completed)
    )
    if (done) completedModules++
  }

  // Última aula acessada ou próxima não concluída
  const lastAccess = progressList
    .slice()
    .sort(
      (a, b) =>
        new Date(b.lastAccess).getTime() - new Date(a.lastAccess).getTime()
    )[0]

  let nextLesson = allLessons.find(
    (l) => !progressList.some((p) => p.lessonId === l.id && p.completed)
  )

  // Se tiver lastAccess e a aula ainda não concluída, prioriza ela
  if (lastAccess && !lastAccess.completed) {
    const found = allLessons.find((l) => l.id === lastAccess.lessonId)
    if (found) nextLesson = found
  }

  // Certificado
  const certificate = await prisma.certificate.findFirst({
    where: { userId, courseId: course.id, status: { not: "CANCELLED" } },
    orderBy: { createdAt: "desc" },
  })

  const canRequestCertificate =
    progressPercent >= 100 && enrollment.status === "ACTIVE"

  return (
    <div className="min-h-screen bg-gray-50">
      <StudentHeader />

      <main className="max-w-6xl mx-auto px-4 py-8">
        {/* Saudação */}
        <div className="mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
            Olá, {session.user.name?.split(" ")[0]}!
          </h1>
          <p className="text-gray-500 mt-1">
            Continue sua formação profissional de cuidador.
          </p>
        </div>

        {/* Progresso principal */}
        <div className="card mb-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
            <div>
              <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">
                Progresso do Curso
              </p>
              <p className="text-3xl font-bold text-wine mt-1">
                {progressPercent}%
              </p>
            </div>
            <div className="flex gap-6 text-sm">
              <div>
                <p className="text-gray-500">Aulas concluídas</p>
                <p className="font-semibold text-gray-900">
                  {completedLessons}/{totalLessons}
                </p>
              </div>
              <div>
                <p className="text-gray-500">Módulos concluídos</p>
                <p className="font-semibold text-gray-900">
                  {completedModules}/{totalModules}
                </p>
              </div>
            </div>
          </div>

          {/* Barra de progresso */}
          <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
            <div
              className="bg-wine h-full rounded-full transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          {nextLesson && (
            <div className="mt-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-4 border-t border-gray-100">
              <div>
                <p className="text-sm text-gray-500">Próxima aula</p>
                <p className="font-medium text-gray-900">{nextLesson.title}</p>
              </div>
              <Link
                href={`/aula/${nextLesson.id}`}
                className="btn-primary inline-flex items-center gap-2 justify-center"
              >
                <PlayCircle className="w-5 h-5" />
                Continuar curso
              </Link>
            </div>
          )}

          {!nextLesson && progressPercent === 100 && (
            <div className="mt-6 pt-4 border-t border-gray-100 text-center">
              <CheckCircle2 className="w-10 h-10 text-green-600 mx-auto mb-2" />
              <p className="font-semibold text-gray-900">
                Parabéns! Você concluiu todas as aulas.
              </p>
              <p className="text-sm text-gray-500 mt-1">
                Agora você pode solicitar seu certificado.
              </p>
            </div>
          )}
        </div>

        {/* Cards de atalho */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Link
            href="/curso"
            className="card hover:shadow-md transition group"
          >
            <div className="w-11 h-11 rounded-lg bg-wine/10 flex items-center justify-center mb-3 group-hover:bg-wine/20 transition">
              <BookOpen className="w-5 h-5 text-wine" />
            </div>
            <h3 className="font-semibold text-gray-900">Meu Curso</h3>
            <p className="text-sm text-gray-500 mt-1">
              Ver módulos e aulas
            </p>
            <ArrowRight className="w-4 h-4 text-wine mt-3 opacity-0 group-hover:opacity-100 transition" />
          </Link>

          <Link
            href="/curso"
            className="card hover:shadow-md transition group"
          >
            <div className="w-11 h-11 rounded-lg bg-blue-50 flex items-center justify-center mb-3">
              <TrendingUp className="w-5 h-5 text-blue-600" />
            </div>
            <h3 className="font-semibold text-gray-900">Progresso</h3>
            <p className="text-sm text-gray-500 mt-1">
              {progressPercent}% concluído
            </p>
          </Link>

          <Link
            href="/avaliacoes"
            className="card hover:shadow-md transition group"
          >
            <div className="w-11 h-11 rounded-lg bg-amber-50 flex items-center justify-center mb-3">
              <ClipboardList className="w-5 h-5 text-amber-600" />
            </div>
            <h3 className="font-semibold text-gray-900">Avaliações</h3>
            <p className="text-sm text-gray-500 mt-1">
              Testes e prova final
            </p>
          </Link>

          <Link
            href="/certificado"
            className="card hover:shadow-md transition group"
          >
            <div className="w-11 h-11 rounded-lg bg-green-50 flex items-center justify-center mb-3">
              <Award className="w-5 h-5 text-green-600" />
            </div>
            <h3 className="font-semibold text-gray-900">Certificado</h3>
            <p className="text-sm text-gray-500 mt-1">
              {certificate?.status === "ISSUED"
                ? "Disponível para download"
                : certificate?.status === "PENDING_PAYMENT"
                ? "Aguardando pagamento (R$ 75)"
                : canRequestCertificate
                ? "Solicitar certificado"
                : "Conclua o curso para liberar"}
            </p>
          </Link>
        </div>

        {/* Resumo do curso */}
        <div className="card">
          <h2 className="font-semibold text-gray-900 mb-4">
            {course.title}
          </h2>
          <p className="text-sm text-gray-600 mb-4">
            {course.subtitle}
          </p>
          <div className="flex flex-wrap gap-4 text-sm text-gray-500 mb-4">
            <span>Carga horária: {course.workloadHours}h</span>
            <span>•</span>
            <span>{totalModules} módulos</span>
            <span>•</span>
            <span>{totalLessons} aulas</span>
            <span>•</span>
            <span>Nota mínima: {course.minScore * 10}%</span>
          </div>
          <a
            href="/apostila-oficial-200h.pdf"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-wine hover:underline font-medium"
          >
            📄 Baixar Apostila Oficial (PDF 200h)
          </a>
        </div>
      </main>
    </div>
  )
}
