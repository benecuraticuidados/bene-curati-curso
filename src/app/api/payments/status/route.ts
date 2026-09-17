import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { markCertificateIssued } from "@/lib/issue-certificate"

export const dynamic = "force-dynamic"

export async function GET(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
  }
  const userId = (session.user as { id?: string }).id
  const paymentId = new URL(req.url).searchParams.get("paymentId")
  if (!paymentId) {
    return NextResponse.json({ error: "paymentId obrigatório" }, { status: 400 })
  }

  const row = await prisma.certificatePayment.findFirst({
    where: { id: paymentId, userId },
  })
  if (!row) {
    return NextResponse.json({ error: "Pagamento não encontrado" }, { status: 404 })
  }

  const token = process.env.MERCADOPAGO_ACCESS_TOKEN
  if (token && row.providerPaymentId && /^\d+$/.test(row.providerPaymentId)) {
    const payRes = await fetch(
      `https://api.mercadopago.com/v1/payments/${row.providerPaymentId}`,
      { headers: { Authorization: `Bearer ${token}` } }
    )
    if (payRes.ok) {
      const pay = await payRes.json()
      if (pay.status === "approved" && row.status !== "PAID") {
        await prisma.certificatePayment.update({
          where: { id: row.id },
          data: { status: "PAID", paidAt: new Date(), rawStatus: "approved" },
        })
        await markCertificateIssued({
          certificateId: row.certificateId,
          paymentRef: String(pay.id),
          actorId: userId,
          details: "Pagamento Pix confirmado na consulta de status",
        })
        return NextResponse.json({ status: "PAID", issued: true })
      }
      return NextResponse.json({ status: pay.status, issued: false })
    }
  }

  return NextResponse.json({ status: row.status, issued: false })
}
