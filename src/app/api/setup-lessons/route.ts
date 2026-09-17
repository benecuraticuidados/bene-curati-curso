import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { MODULE_PACKS } from "@/lib/lesson-content"

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
      workloadHours: 204,
      description:
        "Apostila Oficial Ampliada Bene Curati Cuidados — 21 módulos, 204 horas. Cada aula tem texto próprio. O YouTube aparece como vídeo de encerramento do módulo.",
    },
  })

  const modules = await prisma.module.findMany({
    where: { courseId: course.id },
    orderBy: { order: "asc" },
    include: { lessons: { orderBy: { order: "asc" } } },
  })

  const audit: {
    module: string
    titles: string[]
    duplicateText: boolean
    wordCounts: number[]
    videoId: string | null
  }[] = []
  const videoIds: string[] = []
  let lessonsUpdated = 0
  let materialsUpserted = 0

  for (const pack of MODULE_PACKS) {
    const mod = modules.find((m) => m.order === pack.order)
    if (!mod) continue

    await prisma.module.update({
      where: { id: mod.id },
      data: {
        title: pack.title,
        description: `${pack.hours}h. Apostila Bene Curati. Vídeo de encerramento apenas na última aula do módulo.`,
      },
    })

    const texts: string[] = []
    const wordCounts: number[] = []
    const youtubeId = pack.closingVideo.url.split("/embed/")[1] || null
    if (youtubeId && videoIds.includes(youtubeId)) {
      return NextResponse.json(
        { error: "Vídeo duplicado bloqueado", youtubeId, module: pack.title },
        { status: 409 }
      )
    }
    if (youtubeId) videoIds.push(youtubeId)
    for (let i = 0; i < mod.lessons.length; i++) {
      const lesson = mod.lessons[i]
      const unit = pack.lessons[i] || pack.lessons[pack.lessons.length - 1]
      const isLast = i === mod.lessons.length - 1
      texts.push(unit.reading)
      wordCounts.push((unit.reading || "").replace(/<[^>]+>/g, " ").split(/\s+/).filter(Boolean).length)

      await prisma.lesson.update({
        where: { id: lesson.id },
        data: {
          title: `${pack.order}.${i + 1} — ${unit.title}`,
          description: isLast
            ? `Leitura específica desta aula. ${pack.closingVideo.title}.`
            : "Leitura específica desta aula. O vídeo de encerramento do módulo está na última aula.",
          videoUrl: isLast ? pack.closingVideo.url : null,
        },
      })
      lessonsUpdated++

      const existing = await prisma.material.findFirst({
        where: { lessonId: lesson.id, type: "text" },
      })
      const payload = {
        title: "Leitura da aula",
        type: "text" as const,
        content: unit.reading,
        url: isLast ? pack.closingVideo.url.replace("/embed/", "/watch?v=") : null,
      }
      if (existing) {
        await prisma.material.update({ where: { id: existing.id }, data: payload })
      } else {
        await prisma.material.create({ data: { lessonId: lesson.id, ...payload } })
      }
      materialsUpserted++
    }

    audit.push({
      module: pack.title,
      titles: pack.lessons.map((l) => l.title),
      duplicateText: new Set(texts).size !== texts.length,
      wordCounts,
      videoId: youtubeId,
    })
  }

  return NextResponse.json({
    ok: true,
    courseId: course.id,
    modules: modules.length,
    lessonsUpdated,
    materialsUpserted,
    audit,
    duplicates: audit.filter((a) => a.duplicateText).map((a) => a.module),
    uniqueVideos: videoIds.length,
    duplicateVideos: videoIds.length !== new Set(videoIds).size,
    aulasCurtas: audit.flatMap((a) =>
      a.wordCounts
        .map((w, i) => (w < 650 ? `${a.module} aula ${i + 1} (${w} palavras)` : null))
        .filter(Boolean)
    ),
  })
}
