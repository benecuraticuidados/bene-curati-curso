import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import Link from "next/link"
import { canReleaseCertificate } from "@/lib/certificate-guard"

export default async function VisualizarCertificadoPage({ searchParams }: { searchParams?: { curso?: string } }) {
  const session = await getServerSession(authOptions)
  if (!session?.user) redirect("/login")

  const userId = (session.user as { id?: string }).id as string
  const socorros = searchParams?.curso === "socorros"

  const enrollment = await prisma.enrollment.findFirst({
    where: socorros
      ? { userId, courseId: "curso-socorros-01" }
      : { userId, courseId: { not: "curso-socorros-01" } },
  })
  if (!enrollment) redirect("/certificado")

  const courseId = enrollment.courseId
  const raw = await prisma.certificate.findFirst({
    where: { userId, courseId, status: "ISSUED" },
    orderBy: { createdAt: "desc" },
  })
  if (!raw) redirect(socorros ? "/certificado?curso=socorros" : "/certificado")

  const access = await canReleaseCertificate({ userId, certificateId: raw.id })
  if (!access.ok) redirect("/certificado")

  const pdf = "/api/certificado/pdf?courseId=" + encodeURIComponent(courseId)
  const back = socorros ? "/certificado?curso=socorros" : "/certificado"

  return (
    <div className="min-h-screen bg-[#3a0f16] py-6 px-3">
      <div className="max-w-5xl mx-auto mb-4 flex flex-wrap gap-3">
        <Link href={back} className="btn-outline text-sm bg-white">
          Voltar
        </Link>
        <a href={pdf} className="btn-primary text-sm" target="_blank" rel="noreferrer">
          Baixar PDF
        </a>
        <p className="text-xs text-white/80 self-center">
          Modelo oficial Bene Curati • código {raw.code}
        </p>
      </div>
      <iframe
        title="Certificado Bene Curati"
        src={pdf}
        className="w-full max-w-5xl mx-auto bg-white rounded shadow-2xl"
        style={{ height: "80vh", minHeight: 480 }}
      />
    </div>
  )
}
