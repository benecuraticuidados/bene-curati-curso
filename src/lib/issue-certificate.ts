import { prisma } from "@/lib/prisma"
import { generateCertificateCode } from "@/lib/utils"

export async function markCertificateIssued(params: {
  certificateId: string
  paymentRef: string
  actorId?: string
  details?: string
}) {
  const current = await prisma.certificate.findUnique({
    where: { id: params.certificateId },
  })
  if (!current) throw new Error("Certificado não encontrado")
  if (current.status === "ISSUED") return current

  const code = current.code || generateCertificateCode()

  const updated = await prisma.certificate.update({
    where: { id: params.certificateId },
    data: {
      status: "ISSUED",
      code,
      issuedAt: new Date(),
      paymentRef: params.paymentRef,
    },
  })

  await prisma.enrollment.updateMany({
    where: { userId: current.userId, courseId: current.courseId },
    data: { status: "COMPLETED", completedAt: new Date() },
  })

  await prisma.auditLog.create({
    data: {
      actorId: params.actorId || current.userId,
      action: "CERTIFICATE_ISSUED",
      entity: "Certificate",
      entityId: current.id,
      details: params.details || `Ref ${params.paymentRef} código ${code}`,
    },
  })

  return updated
}
