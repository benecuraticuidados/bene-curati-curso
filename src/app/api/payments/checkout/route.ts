import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { courseCompleted } from "@/lib/certificate-guard"
import { generateCertificateCode } from "@/lib/utils"

export const dynamic = "force-dynamic"

export async function POST(req: Request) {
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

  let method = "pix"
  try {
    const body = await req.json()
    if (body?.method === "checkout") method = "checkout"
  } catch {
    method = "pix"
  }

  const payerEmail = (session.user as { email?: string }).email || undefined

  if (method === "pix") {
    const pixRes = await fetch("https://api.mercadopago.com/v1/payments", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        "X-Idempotency-Key": payment.id,
      },
      body: JSON.stringify({
        transaction_amount: Number(amount),
        description: "Taxa de emissao de certificado Bene Curati",
        payment_method_id: "pix",
        notification_url: `${appUrl}/api/payments/webhook`,
        external_reference: payment.id,
        payer: {
          email: payerEmail || "aluno@bene-curati-curso.vercel.app",
        },
      }),
    })
    const pixRaw = await pixRes.text()
    let pixJson: Record<string, any> = {}
    try {
      pixJson = JSON.parse(pixRaw)
    } catch {
      pixJson = {}
    }
    const tx = pixJson?.point_of_interaction?.transaction_data || {}
    if (pixRes.ok && (tx.qr_code || tx.ticket_url)) {
      await prisma.certificatePayment.update({
        where: { id: payment.id },
        data: {
          providerPaymentId: String(pixJson.id || ""),
          checkoutUrl: tx.ticket_url || null,
          rawStatus: String(pixJson.status || "pending"),
        },
      })
      return NextResponse.json({
        configured: true,
        method: "pix",
        paymentId: payment.id,
        amount,
        status: pixJson.status,
        qrCode: tx.qr_code || null,
        qrCodeBase64: tx.qr_code_base64 || null,
        ticketUrl: tx.ticket_url || null,
      })
    }
    // se Pix direto falhar, segue para Checkout Pro
  }
  const items = [
    {
      id: "certificado-bene-curati",
      title: "Taxa de emissao de certificado Bene Curati",
      description: "Certificado Curso Profissional de Cuidador",
      category_id: "services",
      quantity: 1,
      currency_id: "BRL",
      unit_price: Number(amount),
    },
  ]
  const basePref = {
    items,
    external_reference: payment.id,
    notification_url: `${appUrl}/api/payments/webhook`,
    back_urls: {
      success: `${appUrl}/certificado?pagamento=ok`,
      failure: `${appUrl}/certificado?pagamento=falhou`,
      pending: `${appUrl}/certificado?pagamento=pendente`,
    },
    auto_return: "approved",
    statement_descriptor: "BENE CURATI",
    ...(payerEmail ? { payer: { email: payerEmail } } : {}),
  }

  const attempts = [
    {
      ...basePref,
      payment_methods: {
        default_payment_method_id: "pix",
        installments: 12,
      },
    },
    basePref,
    { items, external_reference: payment.id },
  ]

  let pref: Record<string, unknown> | null = null
  let lastError = ""

  for (let i = 0; i < attempts.length; i++) {
    const prefRes = await fetch("https://api.mercadopago.com/checkout/preferences", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        "X-Idempotency-Key": `${payment.id}-${i}`,
      },
      body: JSON.stringify(attempts[i]),
    })
    const raw = await prefRes.text()
    let parsed: Record<string, unknown> = {}
    try {
      parsed = JSON.parse(raw)
    } catch {
      parsed = { message: raw.slice(0, 240) }
    }
    if (prefRes.ok && (parsed.init_point || parsed.sandbox_init_point)) {
      pref = parsed
      break
    }
    lastError = String(parsed.message || parsed.error || raw).slice(0, 240)
    if (/unauthorized|invalid access/i.test(lastError)) break
  }

  if (!pref) {
    await prisma.certificatePayment.update({
      where: { id: payment.id },
      data: { status: "FAILED", rawStatus: lastError.slice(0, 180), failedAt: new Date() },
    })
    const tokenHint = token.startsWith("TEST-")
      ? "Token de TESTE. Para Pix use o Access Token de produção (APP_USR-)."
      : token.startsWith("APP_USR-")
        ? "Token de produção reconhecido, mas o Mercado Pago recusou a preferência."
        : "MERCADOPAGO_ACCESS_TOKEN não parece um Access Token válido."
    return NextResponse.json(
      { error: "Falha ao iniciar o checkout.", details: lastError, hint: tokenHint },
      { status: 502 }
    )
  }
  await prisma.certificatePayment.update({
    where: { id: payment.id },
    data: {
      providerPaymentId: String(pref.id || ""),
      checkoutUrl: String(pref.init_point || pref.sandbox_init_point || ""),
    },
  })

  return NextResponse.json({
    configured: true,
    paymentId: payment.id,
    amount,
    checkoutUrl: pref.init_point || pref.sandbox_init_point,
  })
}
