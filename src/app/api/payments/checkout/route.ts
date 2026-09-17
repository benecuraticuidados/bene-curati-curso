import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { courseCompleted } from "@/lib/certificate-guard"
import { generateCertificateCode } from "@/lib/utils"

export const dynamic = "force-dynamic"

export async function POST() {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
  }
  const userId = (session.user as { id?: string }).id
  if (!userId) {
    return NextResponse.json({ error: "Sessão inválida" }, { status: 401 })
  }

  const enrollment = await prisma.enrollment.findFirst({
    where: { userId, status: { in: ["ACTIVE", "COMPLETED"] } },
  })
  if (!enrollment) {
    return NextResponse.json({ error: "Matrícula não encontrada" }, { status: 404 })
  }

  const completed = await courseCompleted(userId, enrollment.courseId)
  if (!completed) {
    return NextResponse.json(
      { error: "Conclua todas as aulas e a prova final antes de solicitar o certificado." },
      { status: 403 }
    )
  }

  const settings = await prisma.settings.findUnique({ where: { id: "main" } })
  const amount = settings?.certificateFee ?? 75

  let certificate = await prisma.certificate.findFirst({
    where: {
      userId,
      courseId: enrollment.courseId,
      status: { not: "CANCELLED" },
    },
    orderBy: { createdAt: "desc" },
  })
  if (!certificate) {
    certificate = await prisma.certificate.create({
      data: {
        userId,
        courseId: enrollment.courseId,
        code: generateCertificateCode(),
        status: "PENDING_PAYMENT",
        paymentAmount: amount,
      },
    })
  } else if (certificate.status === "ISSUED") {
    return NextResponse.json({ alreadyIssued: true, certificateId: certificate.id })
  }

  const payment = await prisma.certificatePayment.create({
    data: {
      userId,
      certificateId: certificate.id,
      courseId: enrollment.courseId,
      amount,
      status: "PENDING",
      provider: process.env.PAYMENT_PROVIDER || "mercadopago",
    },
  })

  const token = process.env.MERCADOPAGO_ACCESS_TOKEN
  const appUrl = process.env.NEXTAUTH_URL || "https://bene-curati-curso.vercel.app"

  if (!token) {
    await prisma.auditLog.create({
      data: {
        actorId: userId,
        action: "PAYMENT_CHECKOUT_UNCONFIGURED",
        entity: "CertificatePayment",
        entityId: payment.id,
        details: "Gateway ainda sem MERCADOPAGO_ACCESS_TOKEN",
      },
    })
    return NextResponse.json({
      configured: false,
      paymentId: payment.id,
      amount,
      message:
        "O checkout PIX/cartão ainda não está configurado. Adicione MERCADOPAGO_ACCESS_TOKEN na Vercel. O certificado não será liberado sem confirmação real do pagamento.",
    })
  }

  const prefRes = await fetch("https://api.mercadopago.com/checkout/preferences", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      items: [
        {
          title: "Taxa de emissão de certificado — Bene Curati Cuidados",
          quantity: 1,
          currency_id: "BRL",
          unit_price: amount,
        },
      ],
      external_reference: payment.id,
      notification_url: `${appUrl}/api/payments/webhook`,
      back_urls: {
        success: `${appUrl}/certificado?pagamento=ok`,
        failure: `${appUrl}/certificado?pagamento=falhou`,
        pending: `${appUrl}/certificado?pagamento=pendente`,
      },
      auto_return: "approved",
    }),
  })

  if (!prefRes.ok) {
    const errText = await prefRes.text()
    console.error("Mercado Pago preference error")
    await prisma.certificatePayment.update({
      where: { id: payment.id },
      data: { status: "FAILED", rawStatus: "preference_error", failedAt: new Date() },
    })
    return NextResponse.json(
      { error: "Falha ao iniciar o checkout. Tente novamente.", details: errText.slice(0, 200) },
      { status: 502 }
    )
  }

  const pref = await prefRes.json()
  await prisma.certificatePayment.update({
    where: { id: payment.id },
    data: {
      providerPaymentId: String(pref.id || ""),
      checkoutUrl: pref.init_point || pref.sandbox_init_point || null,
    },
  })

  return NextResponse.json({
    configured: true,
    paymentId: payment.id,
    amount,
    checkoutUrl: pref.init_point || pref.sandbox_init_point,
  })
}
