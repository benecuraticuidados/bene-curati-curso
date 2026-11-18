import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import StudentHeader from "@/components/StudentHeader"
import Link from "next/link"
import { BookOpen, Award, PlayCircle, CheckCircle2, ClipboardList, TrendingUp } from "lucide-react"

export default async function DashboardPage({ searchParams }: { searchParams?: { curso?: string } }) {
  const session = await getServerSession(authOptions)
  if (!session?.user) redirect("/login")

  const userId = (session.user as any).id as string
  const enrollments = await prisma.enrollment.findMany({
    where: { userId, status: { in: ["ACTIVE", "COMPLETED"] } },
    include: {
      course: {
        include: {
          modules: {
            orderBy: { order: "asc" },
            include: { lessons: { orderBy: { order: "asc" } } },
          },
        },
      },
    },
    orderBy: { enrolledAt: "asc" },
  })

  if (enrollments.length === 0) redirect("/cadastro")

  const socorros = searchParams?.curso === "socorros"
  const enrollment = socorros
    ? enrollments.find((e) => e.courseId === "curso-socorros-01") || enrollments[0]
    : enrollments.find((e) => e.courseId !== "curso-socorros-01") || enrollments[0]

  const course = enrollment.course
  const isSocorros = course.id === "curso-socorros-01"
  const q = isSocorros ? "?curso=socorros" : "?curso=cuidador"
  const allLessons = course.modules.flatMap((m) => m.lessons)
  const totalLessons = allLessons.length
  const totalModules = course.modules.length

  const progressList = await prisma.progress.findMany({
    where: { userId, lessonId: { in: allLessons.map((l) => l.id) } },
  })
  const completedLessons = progressList.filter((p) => p.completed).length
  const progressPercent = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0

  let completedModules = 0
  for (const mod of course.modules) {
    const ids = mod.lessons.map((l) => l.id)
    if (ids.length && ids.every((id) => progressList.some((p) => p.lessonId === id && p.completed))) {
      completedModules++
    }
  }

  const nextLesson = allLessons.find((l) => !progressList.some((p) => p.lessonId === l.id && p.completed))
  const certificate = await prisma.certificate.findFirst({
    where: { userId, courseId: course.id, status: { not: "CANCELLED" } },
    orderBy: { createdAt: "desc" },
  })

  return (
    <div className="min-h-screen bg-gray-50">
      <StudentHeader />
      <main className="max-w-6xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-gray-900">Olá, {session.user.name?.split(" ")[0]}!</h1>
        <p className="text-gray-500 mt-1 mb-6">Escolha o curso. Cada um tem aulas, avaliação e certificado próprios.</p>

        <div className="grid sm:grid-cols-2 gap-3 mb-6">
          {enrollments.map((e) => {
            const selected = e.courseId === course.id
            const href = e.courseId === "curso-socorros-01" ? "/dashboard?curso=socorros" : "/dashboard?curso=cuidador"
            return (
              <Link key={e.id} href={href} className={`card border ${selected ? "border-wine bg-wine/5" : "border-gray-200"}`}>
                <p className="text-xs uppercase tracking-wider text-wine font-medium">{selected ? "Aberto agora" : "Abrir este curso"}</p>
                <h3 className="font-semibold text-gray-900 mt-1">{e.course.title}</h3>
              </Link>
            )
          })}
        </div>

        <div className="card mb-6">
          <p className="text-sm text-gray-500 uppercase">Progresso de {course.title}</p>
          <p className="text-3xl font-bold text-wine mt-1">{progressPercent}%</p>
          <p className="text-sm text-gray-600 mt-2">{completedLessons}/{totalLessons} aulas • {completedModules}/{totalModules} módulos</p>
          <div className="w-full bg-gray-200 rounded-full h-3 mt-4 overflow-hidden">
            <div className="bg-wine h-full" style={{ width: `${progressPercent}%` }} />
          </div>
          {nextLesson ? (
            <div className="mt-6 pt-4 border-t border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <p className="text-sm text-gray-500">Próxima aula</p>
                <p className="font-medium text-gray-900">{nextLesson.title}</p>
              </div>
              <Link href={`/aula/${nextLesson.id}`} className="btn-primary inline-flex items-center gap-2 justify-center">
                <PlayCircle className="w-5 h-5" />
                Continuar aula
              </Link>
            </div>
          ) : (
            <div className="mt-6 pt-4 border-t text-center">
              <CheckCircle2 className="w-8 h-8 text-green-600 mx-auto mb-2" />
              <p className="font-medium">Aulas concluídas.</p>
            </div>
          )}
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link href={`/curso${q}`} className="card">
            <BookOpen className="w-5 h-5 text-wine mb-2" />
            <h3 className="font-semibold">Meu Curso</h3>
            <p className="text-sm text-gray-500">Aulas deste curso</p>
          </Link>
          <Link href={`/curso${q}`} className="card">
            <TrendingUp className="w-5 h-5 text-blue-600 mb-2" />
            <h3 className="font-semibold">Progresso</h3>
            <p className="text-sm text-gray-500">{progressPercent}% concluído</p>
          </Link>
          <Link href={`/avaliacoes${q}`} className="card">
            <ClipboardList className="w-5 h-5 text-amber-600 mb-2" />
            <h3 className="font-semibold">Avaliações</h3>
            <p className="text-sm text-gray-500">Prova deste curso</p>
          </Link>
          <Link href={`/certificado${q}`} className="card">
            <Award className="w-5 h-5 text-green-600 mb-2" />
            <h3 className="font-semibold">Certificado</h3>
            <p className="text-sm text-gray-500">{certificate?.status === "ISSUED" ? "Disponível" : "Deste curso"}</p>
          </Link>
        </div>
      </main>
    </div>
  )
}