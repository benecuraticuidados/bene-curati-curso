import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

const AULAS: [string, string][] = [
  ["Princípios do atendimento", "https://www.youtube.com/watch?v=3MDp487I7h4"],
  ["Desmaio", "https://www.youtube.com/watch?v=vz7puletXeg"],
  ["Crises convulsivas", "https://www.youtube.com/watch?v=bL9PROpCv9s"],
  ["Sangramentos", "https://www.youtube.com/watch?v=21EJyLwoxpw"],
  ["Queimaduras", "https://www.youtube.com/watch?v=ZtkwWQEiznY"],
  ["AVC", "https://www.youtube.com/watch?v=kOncLqHEEQU"],
  ["Engasgo", "https://www.youtube.com/watch?v=nVztTfKBT6M"],
  ["PCR e suporte básico", "https://www.youtube.com/watch?v=WoB0AQ2aqgA"],
  ["Quedas", "https://www.youtube.com/watch?v=igx1kfTCYiA"],
  ["Fraturas", "https://www.youtube.com/watch?v=h7Wh-U7yInA"],
  ["Intoxicações", "https://www.youtube.com/watch?v=RLVeq3EM5Nw"],
  ["Animais peçonhentos", "https://www.youtube.com/watch?v=vZJ5mCCC9bg"],
  ["Afogamento", "https://www.youtube.com/watch?v=CiBaKoPI4IM"],
  ["Extremos térmicos", "https://www.youtube.com/watch?v=-EgS9ockutk"],
  ["Saúde mental", "https://www.youtube.com/watch?v=An_08nS-ymU"],
  ["Gestação", ""],
  ["Prevenção", "https://www.youtube.com/watch?v=8il_Mlbi8-4"],
  ["Como acionar o 192", "https://www.youtube.com/watch?v=An_08nS-ymU"],
  ["Kit de emergência", "https://www.youtube.com/watch?v=8il_Mlbi8-4"],
  ["Bebês e crianças", "https://www.youtube.com/watch?v=NRBK74-P6JU"],
  ["DEA para qualquer pessoa", "https://www.youtube.com/watch?v=xKaXFOvWQxk"],
  ["Rua e trânsito", "https://www.youtube.com/watch?v=TJHL1wLMj00"],
  ["Escola, trabalho e eventos", "https://www.youtube.com/watch?v=t4dvTr03JJM"],
  ["Cena com várias pessoas", "https://www.youtube.com/watch?v=TJHL1wLMj00"],
  ["Esporte, praia e lazer", "https://www.youtube.com/watch?v=IfoQL7xzAGQ"],
  ["Avaliação final", ""],
]

export async function GET(req: NextRequest) {
  const key = req.nextUrl.searchParams.get("key")
  if (key !== "bene-curati-setup-2026") {
    return NextResponse.json({ error: "Chave inválida" }, { status: 401 })
  }

  const course = await prisma.course.upsert({
    where: { id: "curso-socorros-01" },
    update: { title: "Primeiros Socorros e Prevenção de Acidentes", workloadHours: 40, minScore: 7, isPublished: true },
    create: {
      id: "curso-socorros-01",
      title: "Primeiros Socorros e Prevenção de Acidentes",
      subtitle: "Formação para o público geral",
      description: "Curso livre para o público geral. 40 horas. Certificado BC-PS, taxa de R$ 50.",
      workloadHours: 40,
      minScore: 7,
      isPublished: true,
    },
  })

  for (let i = 0; i < AULAS.length; i++) {
    const [title, video] = AULAS[i]
    const order = i + 1
    const module = await prisma.module.upsert({
      where: { id: `soc-mod-${order}` },
      update: {},
      create: {
        id: `soc-mod-${order}`,
        courseId: course.id,
        title: `${String(order).padStart(2, "0")}. ${title}`,
        order,
        description: "Aula do curso de Primeiros Socorros.",
      },
    })
    await prisma.lesson.upsert({
      where: { id: `soc-lesson-${order}` },
      update: { title, videoUrl: video || null },
      create: {
        id: `soc-lesson-${order}`,
        moduleId: module.id,
        title,
        description: "Leia a apostila, assista ao vídeo e marque a aula como concluída.",
        videoUrl: video || null,
        durationMin: order === 8 ? 120 : 60,
        order: 1,
      },
    })
  }

  return NextResponse.json({ ok: true, courseId: course.id, aulas: AULAS.length })
}
