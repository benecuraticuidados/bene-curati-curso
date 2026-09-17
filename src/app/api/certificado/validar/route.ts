import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const codigo = searchParams.get("codigo")?.trim().toUpperCase()

  if (!codigo) {
    return NextResponse.json(
      { valid: false, message: "Código não informado" },
      { status: 400 }
    )
  }

  const certificate = await prisma.certificate.findUnique({
    where: { code: codigo },
    include: {
      user: { select: { name: true } },
      course: { select: { title: true, workloadHours: true } },
    },
  })

  if (!certificate) {
    return NextResponse.json({
      valid: false,
      invalidated: false,
      message:
        "O código informado não corresponde a nenhum certificado emitido pela Bene Curati Cuidados.",
    })
  }

  if (certificate.status === "CANCELLED") {
    return NextResponse.json({
      valid: false,
      invalidated: true,
      studentName: certificate.user.name,
      courseName: certificate.course.title,
      code: certificate.code,
      message: "CERTIFICADO INVALIDADO",
    })
  }

  if (certificate.status !== "ISSUED") {
    return NextResponse.json({
      valid: false,
      invalidated: false,
      message:
        "O código informado não corresponde a nenhum certificado válido emitido pela Bene Curati Cuidados.",
    })
  }

  // Apenas dados necessários para autenticação (sem CPF, e-mail, etc.)
  return NextResponse.json({
    valid: true,
    studentName: certificate.user.name,
    courseName: certificate.course.title,
    workloadHours: certificate.course.workloadHours,
    issuedAt: certificate.issuedAt,
    code: certificate.code,
  })
}
