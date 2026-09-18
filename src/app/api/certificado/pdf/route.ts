import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { canReleaseCertificate } from "@/lib/certificate-guard"
import { fillMasterCertificate, CERTIFICATE_TEMPLATE_VERSION } from "@/lib/certificate-pdf"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 })
  }

  const userId = (session.user as { id?: string }).id as string
  const raw = await prisma.certificate.findFirst({
    where: { userId },
    include: { user: true },
    orderBy: { createdAt: "desc" },
  })
  if (!raw) return NextResponse.json({ error: "Certificado não encontrado" }, { status: 404 })

  const access = await canReleaseCertificate({ userId, certificateId: raw.id })
  if (!access.ok || raw.status !== "ISSUED") {
    return NextResponse.json({ error: "Certificado indisponível" }, { status: 403 })
  }

  const bytes = await fillMasterCertificate({
    name: raw.user.name,
    startedAt: raw.user.createdAt,
    issuedAt: raw.issuedAt || raw.createdAt,
    code: raw.code,
  })

  const filename = `certificado-bene-curati-${raw.code}-${CERTIFICATE_TEMPLATE_VERSION}.pdf`
  return new NextResponse(Buffer.from(bytes), {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="${filename}"`,
      "Cache-Control": "private, no-store",
    },
  })
}
