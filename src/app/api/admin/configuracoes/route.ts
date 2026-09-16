import { getServerSession } from "next-auth"
import { NextResponse } from "next/server"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function PUT(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user || (session.user as any).role !== "ADMIN") {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
  }

  const body = await req.json()

  await prisma.settings.upsert({
    where: { id: "main" },
    update: {
      institutionName: body.institutionName,
      phone: body.phone || null,
      whatsapp: body.whatsapp || null,
      email: body.email || null,
      address: body.address || null,
      courseName: body.courseName,
      workloadHours: Number(body.workloadHours) || 200,
      minScore: Number(body.minScore) || 7.0,
      certificateFee: Number(body.certificateFee) || 75,
      institutionalPhrase: body.institutionalPhrase,
      cnpj: body.cnpj || "60.725.201/0001-88",
    },
    create: {
      id: "main",
      institutionName: body.institutionName,
      phone: body.phone || null,
      whatsapp: body.whatsapp || null,
      email: body.email || null,
      address: body.address || null,
      courseName: body.courseName,
      workloadHours: Number(body.workloadHours) || 200,
      minScore: Number(body.minScore) || 7.0,
      certificateFee: Number(body.certificateFee) || 75,
      institutionalPhrase: body.institutionalPhrase,
      cnpj: body.cnpj || "60.725.201/0001-88",
    },
  })

  await prisma.auditLog.create({
    data: {
      actorId: (session.user as any).id,
      action: "SETTINGS_UPDATED",
      entity: "Settings",
      entityId: "main",
      details: "Configurações institucionais atualizadas",
    },
  })

  return NextResponse.json({ ok: true })
}
