import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { MODULE_READINGS } from "@/lib/lesson-content"

export const dynamic = "force-dynamic"

export async function GET(req: Request) {
  const key = new URL(req.url).searchParams.get("key")
  if (key !== "bene-curati-setup-2026") {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
  }

  const course = await prisma.course.findFirst({ orderBy: { createdAt: "asc" } })
  if (!course) {
    return NextResponse.json({ error: "Curso não encontrado" }, { status: 404 })
  }

  await prisma.course.update({
    where: { id: course.id },
    data: {
      title: "Curso Profissional de Cuidador",
      description:
        "Apostila Oficial Ampliada Bene Curati Cuidados — formação em Home Care, Cuidados Domiciliares e Assistência ao Paciente. Aulas com texto de leitura e vídeos de referência do YouTube. Prova final com aprovação mínima de 70%.",
    },
  })

  const modules = await prisma.module.findMany({
    where: { courseId: course.id },
    orderBy: { order: "asc" },
    include: { lessons: { orderBy: { order: "asc" } } },
  })

  let lessonsUpdated = 0
  let materialsUpserted = 0

  for (const reading of MODULE_READINGS) {
    const mod =
      modules.find((m) => m.order === reading.order) ||
      modules.find((m) => m.title.includes(reading.title.replace(/^\d+\.\s*/, "").slice(0, 12)))
    if (!mod) continue

    await prisma.module.update({
      where: { id: mod.id },
      data: {
        title: reading.title,
        description: `Carga horária do módulo na apostila Bene Curati Cuidados. Texto de leitura + vídeo de referência.`,
      },
    })

    for (const lesson of mod.lessons) {
      const focus =
        lesson.order === 1
          ? "Leitura — conceitos e fundamentos"
          : lesson.order === 2
            ? "Vídeo de referência e técnica"
            : "Fixação e estudo de caso"
      await prisma.lesson.update({
        where: { id: lesson.id },
        data: {
          videoUrl: reading.video,
          description: `${focus}. ${reading.videoTitle}. Material da Apostila Bene Curati Cuidados — sem referência a outras instituições.`,
        },
      })
      lessonsUpdated++

      const existing = await prisma.material.findFirst({
        where: { lessonId: lesson.id, type: "text", title: "Leitura do módulo" },
      })
      if (existing) {
        await prisma.material.update({
          where: { id: existing.id },
          data: { content: reading.reading },
        })
      } else {
        await prisma.material.create({
          data: {
            lessonId: lesson.id,
            title: "Leitura do módulo",
            type: "text",
            content: reading.reading,
          },
        })
      }
      materialsUpserted++
    }
  }

  return NextResponse.json({
    ok: true,
    courseId: course.id,
    modules: modules.length,
    lessonsUpdated,
    materialsUpserted,
  })
}
