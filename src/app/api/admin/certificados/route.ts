import { getServerSession } from "next-auth"
import { NextResponse } from "next/server"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

function generateCode() {
  const year = new Date().getFullYear()
  const rand = Math.floor(Math.random() * 900000) + 100000
  return `BC-${year}-${rand}`
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user || (session.user as any).role !== "ADMIN") {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
  }

  const { certificateId, action } = await req.json()
  if (!certificateId || action !== "ISSUE") {
    return NextResponse.json({ error: "Dados inválidos" }, { status: 400 })
  }

  const cert = await prisma.certificate.findUnique({
    where: { id: certificateId },
  })

  if (!cert) {
    return NextResponse.json({ error: "Certificado não encontrado" }, { status: 404 })
  }

  if (cert.status === "ISSUED") {
    return NextResponse.json({ error: "Já emitido", code: cert.code })
  }

  let code = cert.code
  if (!code) {
    // Garante unicidade
    for (let i = 0; i < 5; i++) {
      code = generateCode()
      const exists = await prisma.certificate.findUnique({ where: { code } })
      if (!exists) break
    }
  }

  const updated = await prisma.certificate.update({
    where: { id: certificateId },
    data: {
      status: "ISSUED",
      code,
      issuedAt: new Date(),
      paymentRef: "ADMIN_CONFIRMED",
    },
  })

  await prisma.auditLog.create({
    data: {
      actorId: (session.user as any).id,
      action: "CERTIFICATE_ISSUED_BY_ADMIN",
      entity: "Certificate",
      entityId: certificateId,
      details: `Código ${code}`,
    },
  })

  return NextResponse.json({ ok: true, code: updated.code })
}
