import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { canReleaseCertificate } from "@/lib/certificate-guard"
import { fillMasterCertificate, CERTIFICATE_TEMPLATE_VERSION } from "@/lib/certificate-pdf"
import { resolveCertificateDates } from "@/lib/enrollment-dates"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

export async function GET(request: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 })
  }

  const userId = (session.user as { id?: string }).id as string
  const courseId = new URL(request.url).searchParams.get("courseId")
  if (!courseId) {
    return NextResponse.json({ error: "Informe o curso" }, { status: 400 })
  }

  const raw = await prisma.certificate.findFirst({
    where: { userId, courseId, status: "ISSUED" },
    include: { user: true, course: true },
    orderBy: { createdAt: "desc" },
  })
  if (!raw) return NextResponse.json({ error: "Certificado não encontrado" }, { status: 404 })

  const access = await canReleaseCertificate({ userId, certificateId: raw.id })
  if (!access.ok) {
    return NextResponse.json({ error: "Certificado indisponível" }, { status: 403 })
  }

  const dates = await resolveCertificateDates(raw.userId, raw.courseId)
  if (!dates) {
    return NextResponse.json({ error: "Requisitos de conclusão não registrados" }, { status: 403 })
  }

  try {
    const bytes = await fillMasterCertificate({
      name: raw.user.name,
      startedAt: dates.startedAt,
      issuedAt: dates.requirementsCompletedAt,
      code: raw.code,
      courseId: raw.courseId,
    })
    const filename = "certificado-bene-curati-" + raw.code + "-" + CERTIFICATE_TEMPLATE_VERSION + ".pdf"
    return new NextResponse(Buffer.from(bytes), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `inline; filename="${filename}"`,
        "Cache-Control": "private, no-store",
      },
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : "Falha ao gerar PDF"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
