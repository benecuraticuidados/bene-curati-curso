import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { markCertificateIssued } from "@/lib/issue-certificate"

export const dynamic = "force-dynamic"

async function applyPaid(paymentRowId: string, providerPaymentId: string) {
  const row = await prisma.certificatePayment.findUnique({
    where: { id: paymentRowId },
  })
  if (!row) return
  if (row.status === "PAID") return

  await prisma.certificatePayment.update({
    where: { id: row.id },
    data: {
      status: "PAID",
      providerPaymentId,
      paidAt: new Date(),
      rawStatus: "approved",
    },
  })
  await markCertificateIssued({
    certificateId: row.certificateId,
    paymentRef: providerPaymentId,
    actorId: row.userId,
    details: "Pagamento confirmado via webhook",
  })
}

export async function POST(req: Request) {
  const secret = process.env.PAYMENT_WEBHOOK_SECRET || process.env.MERCADOPAGO_WEBHOOK_SECRET
  const headerSecret = req.headers.get("x-signature") || req.headers.get("x-webhook-secret")
  if (secret && headerSecret && headerSecret !== secret) {
    return NextResponse.json({ error: "Assinatura inválida" }, { status: 401 })
  }

  let body: Record<string, unknown> = {}
  try {
    body = (await req.json()) as Record<string, unknown>
  } catch {
    return NextResponse.json({ received: true })
  }

  const type = String(body.type || body.topic || "")
  const data = (body.data || {}) as Record<string, unknown>
  const mpId = String(data.id || body.id || "")

  const token = process.env.MERCADOPAGO_ACCESS_TOKEN
  if (!token || !mpId) {
    return NextResponse.json({ received: true, ignored: true })
  }

  if (type && !type.includes("payment")) {
    return NextResponse.json({ received: true })
  }

  const payRes = await fetch(`https://api.mercadopago.com/v1/payments/${mpId}`, {
    headers: { Authorization: `Bearer ${token}` },
  })
  if (!payRes.ok) {
    return NextResponse.json({ received: true, lookup: "failed" })
  }
  const pay = await payRes.json()
  const externalRef = String(pay.external_reference || "")
  const status = String(pay.status || "")

  if (!externalRef) {
    return NextResponse.json({ received: true })
  }

  const row =
    (await prisma.certificatePayment.findUnique({ where: { id: externalRef } })) ||
    (await prisma.certificatePayment.findFirst({
      where: { providerPaymentId: String(pay.id) },
    }))

  if (!row) {
    return NextResponse.json({ received: true, unknown: true })
  }

  if (status === "approved") {
    await applyPaid(row.id, String(pay.id))
  } else if (status === "rejected" || status === "cancelled") {
    if (row.status !== "PAID") {
      await prisma.certificatePayment.update({
        where: { id: row.id },
        data: {
          status: status === "cancelled" ? "CANCELLED" : "FAILED",
          rawStatus: status,
          failedAt: status === "rejected" ? new Date() : undefined,
          cancelledAt: status === "cancelled" ? new Date() : undefined,
        },
      })
    }
  }

  return NextResponse.json({ received: true })
}

export async function GET() {
  return NextResponse.json({ ok: true, endpoint: "payments-webhook" })
}
