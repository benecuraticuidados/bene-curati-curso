import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import StudentHeader from "@/components/StudentHeader"
import Link from "next/link"
import { Award, CheckCircle2, Lock, CreditCard, Download } from "lucide-react"
import PayCertificateButton from "./PayCertificateButton"

export default async function CertificadoPage({ searchParams }: { searchParams?: { curso?: string } }) {
  const session = await getServerSession(authOptions)
  if (!session?.user) redirect("/login")

  const userId = (session.user as any).id as string
  const wantSocorros = searchParams?.curso === "socorros"

  const enrollments = await prisma.enrollment.findMany({
    where: { userId, status: { in: ["ACTIVE", "COMPLETED"] } },
    include: {
      course: { include: { modules: { include: { lessons: true } } } },
    },
  })
  if (!enrollments.length) redirect("/dashboard")

  const enrollment = wantSocorros
    ? enrollments.find((e) => e.courseId === "curso-socorros-01") || enrollments[0]
    : enrollments.find((e) => e.courseId !== "curso-socorros-01") || enrollments[0]

  const course = enrollment.course
  const socorros = course.id === "curso-socorros-01"
  const allLessons = course.modules.flatMap((m) => m.lessons)
  const totalLessons = allLessons.length

  const progressList = await prisma.progress.findMany({
    where: { userId, lessonId: { in: allLessons.map((l) => l.id) }, completed: true },
  })
  const progressPercent = totalLessons > 0 ? Math.round((progressList.length / totalLessons) * 100) : 0
  const allLessonsDone = progressPercent >= 100

  const finalQuiz = await prisma.quiz.findFirst({
    where: { courseId: course.id, isFinal: true },
    include: { attempts: { where: { userId, passed: true }, take: 1 } },
  })
  const finalPassed = !finalQuiz || finalQuiz.attempts.length > 0
  const canRequestCertificate = allLessonsDone && finalPassed

  const settings = await prisma.settings.findUnique({ where: { id: "main" } })
  const fee = settings?.certificateFee ?? 75
  const feeLabel = fee.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })

  let certificate = await prisma.certificate.findFirst({
    where: { userId, courseId: course.id, status: { not: "CANCELLED" } },
    include: { payments: { orderBy: { createdAt: "desc" }, take: 3 } },
    orderBy: { createdAt: "desc" },
  })

  if (!certificate && canRequestCertificate) {
    const { generateCertificateCode } = await import("@/lib/utils")
    certificate = await prisma.certificate.create({
      data: { userId, courseId: course.id, code: generateCertificateCode(course.id), status: "PENDING_PAYMENT" },
      include: { payments: true },
    })
  }

  const viewHref = socorros ? "/certificado/visualizar?curso=socorros" : "/certificado/visualizar?curso=cuidador"

  return (
    <div className="min-h-screen bg-gray-50">
      <StudentHeader />
      <main className="max-w-3xl mx-auto px-4 py-8">
        <div className="mb-4 flex gap-2">
          {enrollments.map((e) => {
            const isSoc = e.courseId === "curso-socorros-01"
            const active = e.courseId === course.id
            return (
              <Link
                key={e.id}
                href={isSoc ? "/certificado?curso=socorros" : "/certificado"}
                className={"px-3 py-2 rounded-lg text-sm border " + (active ? "bg-wine text-white border-wine" : "bg-white text-gray-700")}
              >
                {isSoc ? "Primeiros Socorros" : "Cuidador"}
              </Link>
            )
          })}
        </div>

        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Certificado</h1>
          <p className="text-sm text-gray-500">{course.title}</p>
        </div>

        {!canRequestCertificate && (
          <div className="card text-center">
            <Lock className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <h2 className="font-semibold text-gray-900 mb-2">Certificado ainda bloqueado</h2>
            <p className="text-sm text-gray-600">Conclua todas as aulas e a avaliação final para liberar.</p>
            <p className="text-sm text-wine mt-2">{progressPercent}% concluído</p>
          </div>
        )}

        {canRequestCertificate && certificate?.status === "PENDING_PAYMENT" && (
          <div className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Taxa de manutenção</p>
                <p className="text-2xl font-bold text-wine">{feeLabel}</p>
              </div>
              <CreditCard className="w-10 h-10 text-wine/60" />
            </div>
            <p className="text-xs text-gray-500 mt-3">O valor cobre a emissão, armazenamento e validação pública do certificado.</p>
            <PayCertificateButton amountLabel={feeLabel} courseId={course.id} />
          </div>
        )}

        {certificate?.status === "CANCELLED" && (
          <div className="card text-center">
            <h2 className="font-semibold text-gray-900 mb-2">Certificado invalidado</h2>
            <p className="text-sm text-gray-600">Este certificado foi cancelado. Procure a administração.</p>
          </div>
        )}

        {certificate?.status === "ISSUED" && (
          <div className="card text-center">
            <CheckCircle2 className="w-14 h-14 text-green-600 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-gray-900 mb-2">Certificado emitido!</h2>
            <p className="text-sm text-gray-600 mb-1">Código de autenticação:</p>
            <p className="font-mono font-semibold text-wine text-lg mb-6">{certificate.code}</p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link href={viewHref} className="btn-primary inline-flex items-center justify-center gap-2">
                <Download className="w-5 h-5" />
                Ver / Baixar certificado
              </Link>
              <Link href={"/validar?codigo=" + certificate.code} className="btn-secondary inline-flex items-center justify-center gap-2" target="_blank">
                Validar autenticidade
              </Link>
            </div>
          </div>
        )}
      </main>
    </div>
  )
                                                }

