import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import Link from "next/link"
import { canReleaseCertificate } from "@/lib/certificate-guard"

export default async function VisualizarCertificadoPage() {
  const session = await getServerSession(authOptions)
  if (!session?.user) redirect("/login")

  const userId = (session.user as { id?: string }).id as string
  const raw = await prisma.certificate.findFirst({
    where: { userId },
    orderBy: { createdAt: "desc" },
  })
  if (!raw) redirect("/certificado")

  const access = await canReleaseCertificate({ userId, certificateId: raw.id })
  if (!access.ok || raw.status !== "ISSUED") redirect("/certificado")

  return (
    <div className="min-h-screen bg-[#3a0f16] py-6 px-3">
      <div className="max-w-5xl mx-auto mb-4 flex flex-wrap gap-3">
        <Link href="/certificado" className="btn-outline text-sm bg-white">
          Voltar
        </Link>
        <a href="/api/certificado/pdf" className="btn-primary text-sm" target="_blank" rel="noreferrer">
          Baixar PDF
        </a>
        <p className="text-xs text-white/80 self-center">
          Modelo oficial Bene Curati • código {raw.code}
        </p>
      </div>
      <iframe
        title="Certificado Bene Curati"
        src="/api/certificado/pdf"
        className="w-full max-w-5xl mx-auto bg-white rounded shadow-2xl"
        style={{ height: "80vh", minHeight: 480 }}
      />
    </div>
  )
}
