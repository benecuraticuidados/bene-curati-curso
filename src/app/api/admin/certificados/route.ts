import { getServerSession } from "next-auth"
import { NextResponse } from "next/server"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { markCertificateIssued } from "@/lib/issue-certificate"
import { generateCertificateCode } from "@/lib/utils"

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user || (session.user as { role?: string }).role !== "ADMIN") {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
  }

  const actorId = (session.user as { id?: string }).id
  const { certificateId, action, reason } = await req.json()
  if (!certificateId || !action) {
    return NextResponse.json({ error: "Dados inválidos" }, { status: 400 })
  }

  const cert = await prisma.certificate.findUnique({ where: { id: certificateId } })
  if (!cert) {
    return NextResponse.json({ error: "Certificado não encontrado" }, { status: 404 })
  }

  if (action === "ISSUE") {
    const settings = await prisma.settings.findUnique({ where: { id: "main" } })
    await prisma.certificatePayment.create({
      data: {
        userId: cert.userId,
        certificateId: cert.id,
        courseId: cert.courseId,
        amount: settings?.certificateFee ?? cert.paymentAmount,
        status: "PAID",
        provider: "manual-admin",
        providerPaymentId: `ADMIN-${Date.now()}`,
        paidAt: new Date(),
        rawStatus: "admin_manual",
      },
    })
    const updated = await markCertificateIssued({
      certificateId: cert.id,
      paymentRef: "ADMIN_CONFIRMED",
      actorId,
      details: "Emissão manual registrada pelo administrador",
    })
    return NextResponse.json({ ok: true, code: updated.code })
  }

  if (action === "CANCEL") {
    const updated = await prisma.certificate.update({
      where: { id: cert.id },
      data: {
        status: "CANCELLED",
        cancelledAt: new Date(),
        cancelReason: reason || "Invalidado pelo administrador",
      },
    })
    await prisma.auditLog.create({
      data: {
        actorId,
        action: "CERTIFICATE_CANCELLED",
        entity: "Certificate",
        entityId: cert.id,
        details: updated.cancelReason || "",
      },
    })
    return NextResponse.json({ ok: true, status: updated.status })
  }

  if (action === "REISSUE") {
    const newCode = generateCertificateCode()
    await prisma.certificate.update({
      where: { id: cert.id },
      data: {
        status: "CANCELLED",
        cancelledAt: new Date(),
        cancelReason: reason || "Substituído por reemissão",
      },
    })
    const reissued = await prisma.certificate.create({
      data: {
        userId: cert.userId,
        courseId: cert.courseId,
        code: newCode,
        status: "PENDING_PAYMENT",
        paymentAmount: cert.paymentAmount,
      },
    })
    await prisma.auditLog.create({
      data: {
        actorId,
        action: "CERTIFICATE_REISSUED",
        entity: "Certificate",
        entityId: reissued.id,
        details: `Anterior ${cert.code} → novo ${newCode}`,
      },
    })
    return NextResponse.json({ ok: true, code: reissued.code })
  }

  return NextResponse.json({ error: "Ação inválida" }, { status: 400 })
}
