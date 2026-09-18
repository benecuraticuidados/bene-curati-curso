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
      workloadHours: 210,
      description:
        "Apostila Oficial Ampliada Bene Curati Cuidados — 22 módulos, 210 horas (204h teóricas + 6h práticas). Cada aula tem texto próprio. O YouTube aparece como vídeo de encerramento do módulo.",
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

  const PRACTICA = [
    {
      order: 1,
      title: "Transferência para a cadeira",
      video: "https://www.youtube.com/embed/Gcoj_yG2Y1U",
      reading:
        "<h2>Transferência para a cadeira</h2><p>Aula prática obrigatória 1 de 5. O vídeo roda neste aplicativo. Trave a cadeira e transfira sem puxar pelos braços.</p>",
    },
    {
      order: 2,
      title: "Trocar lençol com acamados",
      video: "https://www.youtube.com/embed/F_J2ZiDjBgY",
      reading:
        "<h2>Trocar lençol com acamados</h2><p>Aula prática obrigatória 2 de 5. Lateralize a pessoa, enrole o lençol sujo e coloque o limpo sem arrastar.</p>",
    },
    {
      order: 3,
      title: "Vestir roupas em acamados",
      video: "https://www.youtube.com/embed/4qKbNpcKuXM",
      reading:
        "<h2>Vestir roupas em acamados</h2><p>Aula prática obrigatória 3 de 5. Vista primeiro o lado mais comprometido. Não force articulações.</p>",
    },
    {
      order: 4,
      title: "Mudança de decúbito",
      video: "https://www.youtube.com/embed/WXvyHrn90eQ",
      reading:
        "<h2>Mudança de decúbito</h2><p>Aula prática obrigatória 4 de 5. Reposicione no leito para prevenir lesão por pressão. Evite arrastar.</p>",
    },
    {
      order: 5,
      title: "Higiene íntima e troca de fralda",
      video: "https://www.youtube.com/embed/MhGAFzpE8pA",
      reading:
        "<h2>Higiene íntima e troca de fralda</h2><p>Aula prática obrigatória 5 de 5. Proteja a intimidade, prepare o material e registre lesão ou recusa.</p>",
    },
  ]

  const praticaMod = await prisma.module.upsert({
    where: { id: "mod-pratica-obrigatoria" },
    update: {
      title: "22. Manejo prático obrigatório",
      order: 22,
      description:
        "Vídeos práticos obrigatórios para concluir o curso. Não pontuam na prova.",
      courseId: course.id,
    },
    create: {
      id: "mod-pratica-obrigatoria",
      courseId: course.id,
      title: "22. Manejo prático obrigatório",
      order: 22,
      description:
        "Vídeos práticos obrigatórios para concluir o curso. Não pontuam na prova.",
    },
  })

  for (const item of PRACTICA) {
    const lesson = await prisma.lesson.upsert({
      where: { id: `lesson-pratica-${item.order}` },
      update: {
        title: `P${item.order} — ${item.title}`,
        description:
          "Vídeo prático obrigatório. Não entra na nota da avaliação final.",
        videoUrl: item.video,
        moduleId: praticaMod.id,
        order: item.order,
      },
      create: {
        id: `lesson-pratica-${item.order}`,
        moduleId: praticaMod.id,
        title: `P${item.order} — ${item.title}`,
        description:
          "Vídeo prático obrigatório. Não entra na nota da avaliação final.",
        videoUrl: item.video,
        order: item.order,
        durationMin: 15,
      },
    })
    const existingP = await prisma.material.findFirst({
      where: { lessonId: lesson.id, type: "text" },
    })
    if (existingP) {
      await prisma.material.update({
        where: { id: existingP.id },
        data: { title: "Leitura da aula", content: item.reading },
      })
    } else {
      await prisma.material.create({
        data: {
          lessonId: lesson.id,
          title: "Leitura da aula",
          type: "text",
          content: item.reading,
        },
      })
    }
    lessonsUpdated++
    materialsUpserted++
  }

  const FINAL_QUESTIONS: { text: string; correct: boolean; explanation: string }[] = [
    { text: "O cuidador apoia atividades da vida diária e não substitui o técnico de enfermagem nem o enfermeiro.", correct: true, explanation: "O limite de atuação é obrigatório." },
    { text: "O sigilo sobre dados de saúde termina quando o plantão acaba.", correct: false, explanation: "O sigilo permanece após o atendimento." },
    { text: "A higienização das mãos é a medida mais eficaz para prevenir infecção no domicílio.", correct: true, explanation: "Mãos são o principal veículo de transmissão." },
    { text: "O cuidador pode administrar medicação injetável por conta própria se a família pedir.", correct: false, explanation: "Injetáveis não são atribuição do cuidador." },
    { text: "Mudança de decúbito ajuda a prevenir lesão por pressão.", correct: true, explanation: "Alívio de pressão é medida essencial." },
    { text: "Pessoa com suspeita de disfagia pode ser alimentada deitada, desde que depressa.", correct: false, explanation: "Alimentar deitado aumenta risco de aspiração." },
    { text: "O número do SAMU é 192.", correct: true, explanation: "192 é o SAMU." },
    { text: "Após uma queda, o cuidador deve levantar a pessoa imediatamente, mesmo com dor intensa.", correct: false, explanation: "Avalie, proteja e acione ajuda se houver gravidade." },
    { text: "Registrar hora, fato e o que foi feito no diário de bordo é parte do cuidado profissional.", correct: true, explanation: "O registro comunica o plantão seguinte." },
    { text: "Fotografar o paciente e enviar no grupo da família sem critério institucional é adequado.", correct: false, explanation: "Imagem de saúde exige sigilo e autorização." },
    { text: "Os cinco certos da medicação incluem paciente, medicamento, dose, via e horário.", correct: true, explanation: "Essa checagem reduz erro." },
    { text: "Vermelhidão no sacro que não some após alívio de pressão deve ser descrita e comunicada.", correct: true, explanation: "Pode ser início de lesão por pressão." },
    { text: "O cuidador diagnostica Alzheimer e inicia tratamento por conta própria.", correct: false, explanation: "Diagnóstico e prescrição não são do cuidador." },
    { text: "Em engasgo com tosse eficaz, o primeiro passo é estimular a tosse e não iniciar manobra agressiva.", correct: true, explanation: "Tosse eficaz é o mecanismo mais eficiente." },
    { text: "Cuidado paliativo significa abandonar conforto e higiene.", correct: false, explanation: "Paliativo prioriza conforto e dignidade." },
    { text: "Contrato, limites de função e registro protegem o profissional e a pessoa cuidada.", correct: true, explanation: "Formalizar reduz risco jurídico." },
    { text: "Burnout do cuidador não interfere na segurança do paciente.", correct: false, explanation: "Exaustão aumenta erro e risco." },
    { text: "Na transferência cama-cadeira, a cadeira deve estar travada.", correct: true, explanation: "Travar evita deslizamento e queda." },
    { text: "A conclusão do curso exige as aulas práticas obrigatórias de manejo, além da prova.", correct: true, explanation: "As 5 aulas práticas são requisito de conclusão." },
    { text: "Concluir o curso da Bene Curati Cuidados cria automaticamente vínculo de emprego com a empresa.", correct: false, explanation: "O curso forma; não contrata." },
  ]

  let quiz = await prisma.quiz.findFirst({
    where: { courseId: course.id, isFinal: true },
    include: { questions: true },
  })
  if (!quiz) {
    quiz = await prisma.quiz.create({
      data: {
        courseId: course.id,
        title: "PROVA FINAL — Curso Profissional de Cuidador",
        description: "20 questões. Aprovação com 70%. Tentativas ilimitadas.",
        minScore: 7.0,
        maxAttempts: 0,
        isFinal: true,
        order: 99,
      },
      include: { questions: true },
    })
  } else {
    await prisma.quiz.update({
      where: { id: quiz.id },
      data: {
        title: "PROVA FINAL — Curso Profissional de Cuidador",
        description: "20 questões. Aprovação com 70%. Tentativas ilimitadas.",
        minScore: 7.0,
        maxAttempts: 0,
      },
    })
  }

  if (quiz.questions.length !== 20) {
    await prisma.question.deleteMany({ where: { quizId: quiz.id } })
    for (let i = 0; i < FINAL_QUESTIONS.length; i++) {
      const q = FINAL_QUESTIONS[i]
      await prisma.question.create({
        data: {
          quizId: quiz.id,
          text: q.text,
          type: "true_false",
          explanation: q.explanation,
          order: i + 1,
          options: {
            create: [
              { text: "Verdadeiro", isCorrect: q.correct, order: 1 },
              { text: "Falso", isCorrect: !q.correct, order: 2 },
            ],
          },
        },
      })
    }
  }

  const finalCount = await prisma.question.count({ where: { quizId: quiz.id } })

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
    finalQuestions: finalCount,
    aulasCurtas: audit.flatMap((a) =>
      a.wordCounts
        .map((w, i) => (w < 650 ? `${a.module} aula ${i + 1} (${w} palavras)` : null))
        .filter(Boolean)
    ),
  })
}
