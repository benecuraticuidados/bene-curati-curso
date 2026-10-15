import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { canReleaseCertificate } from "@/lib/certificate-guard"
import { fillMasterCertificate, CERTIFICATE_TEMPLATE_VERSION } from "@/lib/certificate-pdf"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

const SOCORROS = "curso-socorros-01"

const SOCORROS_EIXOS = [
  "Princípios e desmaio",
  "Convulsão e sangramento",
  "Queimadura e AVC",
  "Engasgo e PCR",
  "Quedas e fraturas",
  "Intoxicação e peçonhentos",
  "Afogamento e calor",
  "Prevenção e 192",
  "Crianças e DEA",
  "Rua, escola e lazer",
]

const SOCORROS_AULAS = [
  "01. Princípios do atendimento",
  "02. Desmaio",
  "03. Crises convulsivas",
  "04. Sangramentos",
  "05. Queimaduras",
  "06. AVC",
  "07. Engasgo",
  "08. PCR e suporte básico",
  "09. Quedas",
  "10. Fraturas",
  "11. Intoxicações",
  "12. Animais peçonhentos",
  "13. Afogamento",
  "14. Extremos térmicos",
  "15. Saúde mental",
  "16. Gestação",
  "17. Prevenção",
  "18. Como acionar o 192",
  "19. Kit de emergência",
  "20. Bebês e crianças",
  "21. DEA para qualquer pessoa",
  "22. Rua e trânsito",
  "23. Escola, trabalho e eventos",
  "24. Cena com várias pessoas",
  "25. Esporte, praia e lazer",
  "26. Avaliação final",
]

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 })
  }

  const userId = (session.user as { id?: string }).id as string
  const raw = await prisma.certificate.findFirst({
    where: { userId },
    include: { user: true, course: true },
    orderBy: { createdAt: "desc" },
  })
  if (!raw) return NextResponse.json({ error: "Certificado não encontrado" }, { status: 404 })

  const access = await canReleaseCertificate({ userId, certificateId: raw.id })
  if (!access.ok || raw.status !== "ISSUED") {
    return NextResponse.json({ error: "Certificado indisponível" }, { status: 403 })
  }

  const socorros = raw.courseId === SOCORROS
  const bytes = await fillMasterCertificate({
    name: raw.user.name,
    startedAt: raw.user.createdAt,
    issuedAt: raw.issuedAt || raw.createdAt,
    code: raw.code,
    courseTitle: socorros ? "PRIMEIROS SOCORROS E PREVENÇÃO DE ACIDENTES" : undefined,
    courseSubtitle: socorros ? "Formação para o público geral: casa, rua, escola e trabalho" : undefined,
    courseLine: socorros
      ? "concluiu com aproveitamento o Curso de Primeiros Socorros e Prevenção de Acidentes, promovido pela Bene Curati Cuidados."
      : undefined,
    hoursMain: socorros ? "40 horas" : undefined,
    hoursSub: socorros ? "34h + 6h" : undefined,
    eixos: socorros ? SOCORROS_EIXOS : undefined,
    aulas: socorros ? SOCORROS_AULAS : undefined,
    carga: socorros ? "40h (34h teóricas + 6h práticas). Modalidade EAD. Prova 70%. Público geral." : undefined,
    total: socorros ? "TOTAL: 40h (34h teóricas + 6h práticas)" : undefined,
  })

  const filename = `certificado-bene-curati-\( {raw.code}- \){CERTIFICATE_TEMPLATE_VERSION}.pdf`
  return new NextResponse(Buffer.from(bytes), {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="${filename}"`,
      "Cache-Control": "private, no-store",
    },
  })
}
