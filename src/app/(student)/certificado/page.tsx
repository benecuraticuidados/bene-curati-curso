import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import StudentHeader from "@/components/StudentHeader"
import Link from "next/link"
import { Award, CheckCircle2, Lock, CreditCard, Download } from "lucide-react"
import PayCertificateButton from "./PayCertificateButton"

export default async function CertificadoPage() {
  const session = await getServerSession(authOptions)
  if (!session?.user) redirect("/login")

  const userId = (session.user as any).id as string

  const enrollment = await prisma.enrollment.findFirst({
    where: { userId, status: { in: ["ACTIVE", "COMPLETED"] } },
    include: {
      course: {
        include: {
          modules: {
            include: { lessons: true },
          },
        },
      },
    },
  })

  if (!enrollment) redirect("/dashboard")

  const course = enrollment.course
  const allLessons = course.modules.flatMap((m) => m.lessons)
  const totalLessons = allLessons.length

  const progressList = await prisma.progress.findMany({
    where: {
      userId,
      lessonId: { in: allLessons.map((l) => l.id) },
      completed: true,
    },
  })

  const completedLessons = progressList.length
  const progressPercent =
    totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0

  const allLessonsDone = progressPercent >= 100

  // Verificar se passou na Prova Final
  const finalQuiz = await prisma.quiz.findFirst({
    where: { courseId: course.id, isFinal: true },
    include: {
      attempts: {
        where: { userId, passed: true },
        take: 1,
      },
    },
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
      data: {
        userId,
        courseId: course.id,
        code: generateCertificateCode(),
        status: "PENDING_PAYMENT",
        paymentAmount: fee,
      },
      include: { payments: true },
    })
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <StudentHeader />

      <main className="max-w-2xl mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-wine/10 mb-4">
            <Award className="w-8 h-8 text-wine" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">
            Certificado de Conclusão
          </h1>
          <p className="text-gray-500 mt-2">
            {course.title}
          </p>
        </div>

        {/* Ainda não concluiu aulas ou prova */}
        {(!allLessonsDone || !finalPassed) && (
          <div className="card text-center">
            <Lock className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h2 className="font-semibold text-gray-900 mb-2">
              Certificado ainda não disponível
            </h2>
            <p className="text-sm text-gray-600 mb-4">
              {!allLessonsDone
                ? "Você precisa concluir 100% das aulas e ser aprovado na Prova Final."
                : "Você concluiu as aulas, mas ainda precisa ser aprovado na Prova Final (70%)."}
            </p>
            <div className="bg-gray-100 rounded-full h-3 mb-2 overflow-hidden">
              <div
                className="bg-wine h-full rounded-full"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <p className="text-sm text-gray-500 mb-6">
              Progresso atual: {progressPercent}% ({completedLessons}/
              {totalLessons} aulas)
            </p>
            <Link href="/curso" className="btn-primary inline-flex">
              Continuar estudando
            </Link>
          </div>
        )}

        {/* Concluiu, mas precisa pagar */}
        {canRequestCertificate && certificate?.status === "PENDING_PAYMENT" && (
          <div className="card">
            <div className="flex items-start gap-3 mb-6">
              <CheckCircle2 className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" />
              <div>
                <h2 className="font-semibold text-gray-900">
                  Parabéns! Você concluiu o curso
                </h2>
                <p className="text-sm text-gray-600 mt-1">
                  Para emitir seu certificado digital oficial da Bene Curati
                  Cuidados, é necessário o pagamento da taxa de manutenção.
                </p>
              </div>
            </div>

            <div className="bg-wine/5 border border-wine/20 rounded-xl p-5 mb-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Taxa de manutenção</p>
                  <p className="text-2xl font-bold text-wine">{feeLabel}</p>
                </div>
                <CreditCard className="w-10 h-10 text-wine/60" />
              </div>
              <p className="text-xs text-gray-500 mt-3">
                O valor cobre a emissão, armazenamento e validação pública do
                certificado com código único e QR Code.
              </p>
            </div>

            <PayCertificateButton amountLabel={feeLabel} />
          </div>
        )}

        {certificate?.status === "CANCELLED" && (
          <div className="card text-center">
            <h2 className="font-semibold text-gray-900 mb-2">Certificado invalidado</h2>
            <p className="text-sm text-gray-600">
              Este certificado foi cancelado. Procure a administração da Bene Curati Cuidados.
            </p>
          </div>
        )}

        {/* Já emitido */}
        {certificate?.status === "ISSUED" && (
          <div className="card text-center">
            <CheckCircle2 className="w-14 h-14 text-green-600 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-gray-900 mb-2">
              Certificado emitido!
            </h2>
            <p className="text-sm text-gray-600 mb-1">
              Código de autenticação:
            </p>
            <p className="font-mono font-semibold text-wine text-lg mb-6">
              {certificate.code}
            </p>

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                href={`/certificado/visualizar`}
                className="btn-primary inline-flex items-center justify-center gap-2"
              >
                <Download className="w-5 h-5" />
                Ver / Baixar certificado
              </Link>
              <Link
                href={`/validar?codigo=${certificate.code}`}
                className="btn-secondary inline-flex items-center justify-center gap-2"
                target="_blank"
              >
                Validar autenticidade
              </Link>
            </div>

            <p className="text-xs text-gray-400 mt-6">
              Emitido em{" "}
              {certificate.issuedAt
                ? new Date(certificate.issuedAt).toLocaleDateString("pt-BR")
                : "—"}
            </p>
          </div>
        )}
      </main>
    </div>
  )
}
