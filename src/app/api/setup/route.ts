import { NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { prisma } from "@/lib/prisma"

export const dynamic = "force-dynamic"

const MODULES = [
  { title: "1. Papel do Cuidador", hours: 8, order: 1 },
  { title: "2. Ética e Humanização", hours: 10, order: 2 },
  { title: "3. Anatomia e Fisiologia", hours: 10, order: 3 },
  { title: "4. Envelhecimento e Doenças", hours: 12, order: 4 },
  { title: "5. Biossegurança", hours: 10, order: 5 },
  { title: "6. Sinais Vitais", hours: 12, order: 6 },
  { title: "7. Higiene e Banho no Leito", hours: 14, order: 7 },
  { title: "8. Decúbito e Prevenção de LPP", hours: 10, order: 8 },
  { title: "9. Nutrição, Hidratação e Disfagia", hours: 10, order: 9 },
  { title: "10. Medicamentos - Limites", hours: 8, order: 10 },
  { title: "11. Sondas e Ostomias", hours: 8, order: 11 },
  { title: "12. Curativos e Pele", hours: 8, order: 12 },
  { title: "13. Mobilização e Prevenção de Quedas", hours: 12, order: 13 },
  { title: "14. Alzheimer, Parkinson, AVC, DM, HAS", hours: 12, order: 14 },
  { title: "15. Primeiros Socorros", hours: 14, order: 15 },
  { title: "16. Cuidados Paliativos", hours: 8, order: 16 },
  { title: "17. Comunicação e Família", hours: 8, order: 17 },
  { title: "18. Diário de Bordo", hours: 6, order: 18 },
  { title: "19. Autocuidado e Burnout", hours: 8, order: 19 },
  { title: "20. Ética e Legislação", hours: 8, order: 20 },
  { title: "21. Código de Excelência + Técnicas Avançadas", hours: 8, order: 21 },
]

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const key = searchParams.get("key")

  if (key !== "bene-curati-setup-2026") {
    return NextResponse.json({ error: "Chave inválida" }, { status: 401 })
  }

  try {
    // Settings
    await prisma.settings.upsert({
      where: { id: "main" },
      update: {
        institutionName: "Bene Curati Cuidados",
        cnpj: "60.725.201/0001-88",
        workloadHours: 210,
        certificateFee: 75,
        institutionalPhrase: "NOSSA PAIXÃO É CUIDAR DE QUEM VOCÊ AMA!",
      },
      create: {
        id: "main",
        institutionName: "Bene Curati Cuidados",
        cnpj: "60.725.201/0001-88",
        workloadHours: 210,
        minScore: 7.0,
        certificateFee: 75,
        courseName: "CURSO PROFISSIONAL DE CUIDADOR",
        institutionalPhrase: "NOSSA PAIXÃO É CUIDAR DE QUEM VOCÊ AMA!",
        email: "contato@benecurati.com.br",
      },
    })

    // Admin
    const adminHash = await bcrypt.hash("admin123", 12)
    const admin = await prisma.user.upsert({
      where: { email: "admin@benecurati.com.br" },
      update: { passwordHash: adminHash, isActive: true, role: "ADMIN" },
      create: {
        email: "admin@benecurati.com.br",
        passwordHash: adminHash,
        name: "Administrador Bene Curati",
        role: "ADMIN",
        isActive: true,
      },
    })

    // Aluno demo
    const studentHash = await bcrypt.hash("aluno123", 12)
    const student = await prisma.user.upsert({
      where: { email: "aluno@teste.com" },
      update: { passwordHash: studentHash, isActive: true },
      create: {
        email: "aluno@teste.com",
        passwordHash: studentHash,
        name: "Maria Silva Santos",
        cpf: "123.456.789-00",
        whatsapp: "11988887777",
        city: "São Paulo",
        state: "SP",
        role: "STUDENT",
        isActive: true,
      },
    })

    // Curso
    let course = await prisma.course.findFirst()
    if (!course) {
      course = await prisma.course.create({
        data: {
          title: "Curso Profissional de Cuidador",
          subtitle: "Formação em Home Care, Cuidados Domiciliares e Assistência ao Paciente",
          description:
            "Apostila Oficial Ampliada Bene Curati Cuidados — 200 horas. Formação em Home Care.",
          workloadHours: 210,
          minScore: 7.0,
          isPublished: true,
          createdById: admin.id,
        },
      })
    }

    // Matrícula aluno
    const existingEnroll = await prisma.enrollment.findFirst({
      where: { userId: student.id, courseId: course.id },
    })
    if (!existingEnroll) {
      await prisma.enrollment.create({
        data: { userId: student.id, courseId: course.id, status: "ACTIVE" },
      })
    }

    // Módulos e aulas
    let lessonsCreated = 0
    for (const mod of MODULES) {
      const module = await prisma.module.upsert({
        where: { id: `mod-${mod.order}` },
        update: {},
        create: {
          id: `mod-${mod.order}`,
          courseId: course.id,
          title: mod.title,
          order: mod.order,
          description: `Carga horária: ${mod.hours}h`,
        },
      })

      const shortTitle = mod.title.replace(/^\d+\.\s*/, "")
      for (let i = 1; i <= 3; i++) {
        const lessonId = `lesson-${mod.order}-${i}`
        await prisma.lesson.upsert({
          where: { id: lessonId },
          update: {},
          create: {
            id: lessonId,
            moduleId: module.id,
            title: `Aula 0${i} — ${shortTitle}`,
            description: `Conteúdo oficial da Apostila Bene Curati — ${mod.title}`,
            videoUrl: "https://www.youtube.com/embed/Y0woaElMsXA",
            durationMin: Math.round((mod.hours * 60) / 3),
            order: i,
          },
        })
        lessonsCreated++
      }
    }

    // Prova final (se não existir)
    const finalQuiz = await prisma.quiz.findFirst({
      where: { courseId: course.id, isFinal: true },
    })
    if (!finalQuiz) {
      await prisma.quiz.create({
        data: {
          courseId: course.id,
          title: "PROVA FINAL — Curso Profissional de Cuidador",
          description: "20 questões. Aprovação com 70%. Até 2 tentativas.",
          minScore: 7.0,
          maxAttempts: 2,
          isFinal: true,
          order: 99,
          questions: {
            create: [
              {
                text: "O cuidador auxilia nas atividades da vida diária e não substitui o técnico de enfermagem.",
                type: "true_false",
                explanation: "Verdadeiro.",
                order: 1,
                options: {
                  create: [
                    { text: "Verdadeiro", isCorrect: true, order: 1 },
                    { text: "Falso", isCorrect: false, order: 2 },
                  ],
                },
              },
              {
                text: "A higienização das mãos é a medida mais eficaz para prevenir infecções.",
                type: "true_false",
                explanation: "Verdadeiro.",
                order: 2,
                options: {
                  create: [
                    { text: "Verdadeiro", isCorrect: true, order: 1 },
                    { text: "Falso", isCorrect: false, order: 2 },
                  ],
                },
              },
              {
                text: "O número do SAMU é 192.",
                type: "true_false",
                explanation: "Verdadeiro.",
                order: 3,
                options: {
                  create: [
                    { text: "Verdadeiro", isCorrect: true, order: 1 },
                    { text: "Falso", isCorrect: false, order: 2 },
                  ],
                },
              },
              {
                text: "O cuidador pode administrar medicamentos injetáveis sem orientação.",
                type: "true_false",
                explanation: "Falso. Não pode.",
                order: 4,
                options: {
                  create: [
                    { text: "Verdadeiro", isCorrect: false, order: 1 },
                    { text: "Falso", isCorrect: true, order: 2 },
                  ],
                },
              },
              {
                text: "O sigilo profissional continua após o fim do atendimento.",
                type: "true_false",
                explanation: "Verdadeiro.",
                order: 5,
                options: {
                  create: [
                    { text: "Verdadeiro", isCorrect: true, order: 1 },
                    { text: "Falso", isCorrect: false, order: 2 },
                  ],
                },
              },
            ],
          },
        },
      })
    }

    return NextResponse.json({
      ok: true,
      message: "Banco populado com sucesso!",
      admin: "admin@benecurati.com.br / admin123",
      aluno: "aluno@teste.com / aluno123",
      modules: MODULES.length,
      lessons: lessonsCreated,
      course: course.title,
    })
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error)
    console.error("Setup error:", error)
    return NextResponse.json(
      {
        error: "Falha no setup",
        details: msg,
        dica: "Se a mensagem falar de tabela inexistente, o db push do deploy pode ter falhado. Faça um Redeploy e tente de novo.",
      },
      { status: 500 }
    )
  }
}
