import { getServerSession } from "next-auth"
import { NextResponse } from "next/server"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
  }

  const userId = (session.user as any).id as string
  const { certificateId } = await req.json()

  if (!certificateId) {
    return NextResponse.json({ error: "certificateId obrigatório" }, { status: 400 })
  }

  const certificate = await prisma.certificate.findUnique({
    where: { id: certificateId },
  })

  if (!certificate || certificate.userId !== userId) {
    return NextResponse.json({ error: "Certificado não encontrado" }, { status: 404 })
  }

  if (certificate.status === "ISSUED") {
    return NextResponse.json({ error: "Certificado já emitido" }, { status: 400 })
  }

  // Simulação de pagamento bem-sucedido
  // Em produção: integrar Mercado Pago / Stripe / Pix e validar webhook

  const updated = await prisma.certificate.update({
    where: { id: certificateId },
    data: {
      status: "ISSUED",
      issuedAt: new Date(),
      paymentRef: `SIM-${Date.now()}`,
    },
  })

  // Atualiza matrícula para COMPLETED
  await prisma.enrollment.updateMany({
    where: {
      userId,
      courseId: certificate.courseId,
    },
    data: {
      status: "COMPLETED",
      completedAt: new Date(),
    },
  })

  // Log de auditoria
  await prisma.auditLog.create({
    data: {
      actorId: userId,
      action: "CERTIFICATE_ISSUED",
      entity: "Certificate",
      entityId: certificateId,
      details: `Pagamento simulado de R$ ${certificate.paymentAmount}. Código: ${certificate.code}`,
    },
  })

  return NextResponse.json({ success: true, certificate: updated })
}
