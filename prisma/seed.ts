import { PrismaClient, Role } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

const MODULES = [
  { title: "1. Papel do Cuidador", hours: 8, order: 1, video: "https://www.youtube.com/embed/dQw4w9WgXcQ", videoTitle: "Papel do cuidador de idosos" },
  { title: "2. Ética e Humanização", hours: 10, order: 2, video: "https://www.youtube.com/embed/9BEwb30x4RQ", videoTitle: "Sigilo Profissional – Coren SP" },
  { title: "3. Anatomia e Fisiologia", hours: 10, order: 3, video: "https://www.youtube.com/embed/dQw4w9WgXcQ", videoTitle: "Anatomia básica para cuidadores" },
  { title: "4. Envelhecimento e Doenças", hours: 12, order: 4, video: "https://www.youtube.com/embed/3hl92GPFIN0", videoTitle: "Primeiros socorros em idosos" },
  { title: "5. Biossegurança", hours: 10, order: 5, video: "https://www.youtube.com/embed/6EFG_u41LpE", videoTitle: "Técnica de lavagem das mãos – Santa Casa" },
  { title: "6. Sinais Vitais", hours: 12, order: 6, video: "https://www.youtube.com/embed/dQw4w9WgXcQ", videoTitle: "Aferição de sinais vitais" },
  { title: "7. Higiene e Banho no Leito", hours: 14, order: 7, video: "https://www.youtube.com/embed/Y0woaElMsXA", videoTitle: "Técnica de banho no leito – Unifesp (validado)" },
  { title: "8. Decúbito e Prevenção de LPP", hours: 10, order: 8, video: "https://www.youtube.com/embed/dQw4w9WgXcQ", videoTitle: "Prevenção de lesões por pressão" },
  { title: "9. Nutrição, Hidratação e Disfagia", hours: 10, order: 9, video: "https://www.youtube.com/embed/dQw4w9WgXcQ", videoTitle: "Cuidados com disfagia e alimentação" },
  { title: "10. Medicamentos - Limites", hours: 8, order: 10, video: "https://www.youtube.com/embed/dQw4w9WgXcQ", videoTitle: "Limites do cuidador na medicação" },
  { title: "11. Sondas e Ostomias", hours: 8, order: 11, video: "https://www.youtube.com/embed/dQw4w9WgXcQ", videoTitle: "Cuidados com sondas e ostomias" },
  { title: "12. Curativos e Pele", hours: 8, order: 12, video: "https://www.youtube.com/embed/dQw4w9WgXcQ", videoTitle: "Cuidados com a pele e curativos simples" },
  { title: "13. Mobilização e Prevenção de Quedas", hours: 12, order: 13, video: "https://www.youtube.com/embed/dQw4w9WgXcQ", videoTitle: "Transferências e prevenção de quedas" },
  { title: "14. Alzheimer, Parkinson, AVC, DM, HAS", hours: 12, order: 14, video: "https://www.youtube.com/embed/3hl92GPFIN0", videoTitle: "Cuidados em doenças crônicas do idoso" },
  { title: "15. Primeiros Socorros", hours: 14, order: 15, video: "https://www.youtube.com/embed/3hl92GPFIN0", videoTitle: "Primeiros socorros em idosos – aula completa" },
  { title: "16. Cuidados Paliativos", hours: 8, order: 16, video: "https://www.youtube.com/embed/dQw4w9WgXcQ", videoTitle: "Cuidados paliativos e conforto" },
  { title: "17. Comunicação e Família", hours: 8, order: 17, video: "https://www.youtube.com/embed/dQw4w9WgXcQ", videoTitle: "Comunicação com paciente e família" },
  { title: "18. Diário de Bordo", hours: 6, order: 18, video: "https://www.youtube.com/embed/dQw4w9WgXcQ", videoTitle: "Registro e diário de bordo" },
  { title: "19. Autocuidado e Burnout", hours: 8, order: 19, video: "https://www.youtube.com/embed/dQw4w9WgXcQ", videoTitle: "Autocuidado do cuidador" },
  { title: "20. Ética e Legislação", hours: 8, order: 20, video: "https://www.youtube.com/embed/9BEwb30x4RQ", videoTitle: "Ética, legislação e responsabilidade" },
  { title: "21. Código de Excelência + Técnicas Avançadas", hours: 8, order: 21, video: "https://www.youtube.com/embed/Y0woaElMsXA", videoTitle: "Revisão de técnicas de enfermagem para cuidadores" },
]

async function main() {
  console.log('🌱 Iniciando seed da Bene Curati Cuidados...')

  // Settings
  await prisma.settings.upsert({
    where: { id: 'main' },
    update: {},
    create: {
      id: 'main',
      institutionName: 'Bene Curati Cuidados',
      phone: '(11) 99999-0000',
      whatsapp: '5511999990000',
      email: 'contato@benecurati.com.br',
      address: 'São Paulo - SP',
      courseName: 'CURSO PROFISSIONAL DE CUIDADOR',
      workloadHours: 200,
      minScore: 7.0,
      certificateFee: 75.0,
      institutionalPhrase: 'NOSSA PAIXÃO É CUIDAR DE QUEM VOCÊ AMA!',
      cnpj: '60.725.201/0001-88',
    },
  })

  // Admin
  const adminHash = await bcrypt.hash('admin123', 12)
  const admin = await prisma.user.upsert({
    where: { email: 'admin@benecurati.com.br' },
    update: {},
    create: {
      email: 'admin@benecurati.com.br',
      passwordHash: adminHash,
      name: 'Administrador Bene Curati',
      role: Role.ADMIN,
      isActive: true,
    },
  })
  console.log('✅ Admin criado:', admin.email, '| senha: admin123')

  // Student demo
  const studentHash = await bcrypt.hash('aluno123', 12)
  const student = await prisma.user.upsert({
    where: { email: 'aluno@teste.com' },
    update: {},
    create: {
      email: 'aluno@teste.com',
      passwordHash: studentHash,
      name: 'Maria Silva Santos',
      cpf: '123.456.789-00',
      whatsapp: '11988887777',
      city: 'São Paulo',
      state: 'SP',
      role: Role.STUDENT,
      isActive: true,
    },
  })
  console.log('✅ Aluno demo criado:', student.email, '| senha: aluno123')

  // Course
  const course = await prisma.course.upsert({
    where: { id: 'curso-cuidador-01' },
    update: {},
    create: {
      id: 'curso-cuidador-01',
      title: 'Curso Profissional de Cuidador',
      subtitle: 'Formação em Home Care, Cuidados Domiciliares e Assistência ao Paciente',
      description:
        'Apostila Oficial Ampliada Bene Curati Cuidados — 200 horas. Formação em Home Care, Cuidados Domiciliares e Assistência ao Paciente. Base 160h (padrão SENAC) + 40h de aprofundamento técnico em enfermagem e primeiros socorros. Vídeos de referência, estudos de caso e prova final (aprovação 70%).',
      workloadHours: 200,
      minScore: 7.0,
      isPublished: true,
      createdById: admin.id,
    },
  })
  console.log('✅ Curso criado')

  // Modules + aulas com vídeos reais de YouTube (técnicas de enfermagem e primeiros socorros)
  for (const mod of MODULES) {
    const module = await prisma.module.upsert({
      where: { id: `mod-${mod.order}` },
      update: {},
      create: {
        id: `mod-${mod.order}`,
        courseId: course.id,
        title: mod.title,
        order: mod.order,
        description: `Carga horária: ${mod.hours}h. Conteúdo oficial da Apostila Ampliada 200h + técnicas de enfermagem e primeiros socorros.`,
      },
    })

    const shortTitle = mod.title.replace(/^\d+\.\s*/, '')
    const aulas = [
      {
        order: 1,
        title: `Aula 01 — ${shortTitle} (Conceitos e fundamentos)`,
        desc: `Conteúdo teórico oficial da Apostila Bene Curati. Conceitos, limites do cuidador, sinais de alerta e postura profissional. Estudo de caso incluído.`,
        video: mod.video,
      },
      {
        order: 2,
        title: `Aula 02 — ${shortTitle} (Técnica prática e demonstração)`,
        desc: `Demonstração em vídeo de técnicas de enfermagem e cuidados. Passo a passo para aplicação segura no domicílio (home care). Material complementar da apostila.`,
        video: mod.video,
      },
      {
        order: 3,
        title: `Aula 03 — ${shortTitle} (Fixação, estudo de caso e revisão)`,
        desc: `Revisão dos pontos-chave, atividades de fixação da apostila, estudo de caso realista e orientação para registro no Diário de Bordo. Preparação para a prova.`,
        video: mod.video,
      },
    ]

    for (const aula of aulas) {
      await prisma.lesson.upsert({
        where: { id: `lesson-${mod.order}-${aula.order}` },
        update: {},
        create: {
          id: `lesson-${mod.order}-${aula.order}`,
          moduleId: module.id,
          title: aula.title,
          description: aula.desc,
          videoUrl: aula.video,
          durationMin: Math.round((mod.hours * 60) / 3),
          order: aula.order,
        },
      })
    }
  }
  console.log('✅ 21 módulos + 63 aulas com vídeos de referência criados (200 horas)')

  // Enrollment for student
  await prisma.enrollment.upsert({
    where: {
      userId_courseId: {
        userId: student.id,
        courseId: course.id,
      },
    },
    update: {},
    create: {
      userId: student.id,
      courseId: course.id,
      status: 'ACTIVE',
    },
  })
  console.log('✅ Aluno matriculado no curso')

  // Sample quiz for module 1
  const quiz = await prisma.quiz.create({
    data: {
      courseId: course.id,
      moduleId: 'mod-1',
      title: 'Avaliação do Módulo 01',
      description: 'Teste seus conhecimentos sobre a introdução à profissão de cuidador.',
      minScore: 7.0,
      maxAttempts: 3,
      isFinal: false,
      order: 1,
      questions: {
        create: [
          {
            text: 'Qual é o principal papel do cuidador profissional?',
            type: 'multiple_choice',
            explanation: 'O cuidador atua na assistência às atividades da vida diária, promovendo conforto, segurança e humanização.',
            order: 1,
            options: {
              create: [
                { text: 'Realizar procedimentos médicos invasivos', isCorrect: false, order: 1 },
                { text: 'Prestar assistência nas atividades da vida diária com humanização', isCorrect: true, order: 2 },
                { text: 'Substituir o médico e o enfermeiro', isCorrect: false, order: 3 },
                { text: 'Apenas acompanhar o paciente em consultas', isCorrect: false, order: 4 },
              ],
            },
          },
          {
            text: 'A ética e a postura profissional são fundamentais para o cuidador.',
            type: 'true_false',
            explanation: 'Verdadeiro. Ética, respeito e postura profissional são pilares da atuação.',
            order: 2,
            options: {
              create: [
                { text: 'Verdadeiro', isCorrect: true, order: 1 },
                { text: 'Falso', isCorrect: false, order: 2 },
              ],
            },
          },
        ],
      },
    },
  })
  console.log('✅ Avaliação demo criada')

  // ========== PROVA FINAL (20 questões — 1 por módulo) ==========
  // Aprovação: 70% (14/20). maxAttempts: 2
  await prisma.quiz.create({
    data: {
      courseId: course.id,
      title: 'PROVA FINAL — Curso Profissional de Cuidador',
      description: 'Avaliação final oficial da Bene Curati Cuidados. 20 questões (1 por módulo). Aprovação com 70% de acertos (14/20). Você tem até 2 tentativas.',
      minScore: 7.0,
      maxAttempts: 2,
      isFinal: true,
      order: 99,
      questions: {
        create: [
          {
            text: 'Qual é a principal diferença entre o papel do cuidador e o do técnico de enfermagem?',
            type: 'multiple_choice',
            explanation: 'O cuidador presta assistência às AVDs e não realiza procedimentos invasivos nem substitui a enfermagem.',
            order: 1,
            options: {
              create: [
                { text: 'O cuidador pode administrar medicamentos injetáveis', isCorrect: false, order: 1 },
                { text: 'O cuidador auxilia nas atividades da vida diária; o técnico de enfermagem tem atribuições técnicas e invasivas autorizadas', isCorrect: true, order: 2 },
                { text: 'Não há diferença relevante', isCorrect: false, order: 3 },
                { text: 'O cuidador diagnostica doenças', isCorrect: false, order: 4 },
              ],
            },
          },
          {
            text: 'Humanizar o cuidado significa enxergar o paciente apenas como a doença ou o “caso”.',
            type: 'true_false',
            explanation: 'Falso. Humanizar é tratar o paciente como pessoa, com história, sentimentos e preferências.',
            order: 2,
            options: {
              create: [
                { text: 'Verdadeiro', isCorrect: false, order: 1 },
                { text: 'Falso', isCorrect: true, order: 2 },
              ],
            },
          },
          {
            text: 'Qual sistema do corpo transporta oxigênio e nutrientes?',
            type: 'multiple_choice',
            explanation: 'O sistema cardiovascular transporta O₂ e nutrientes.',
            order: 3,
            options: {
              create: [
                { text: 'Sistema nervoso', isCorrect: false, order: 1 },
                { text: 'Sistema respiratório', isCorrect: false, order: 2 },
                { text: 'Sistema cardiovascular', isCorrect: true, order: 3 },
                { text: 'Sistema tegumentar', isCorrect: false, order: 4 },
              ],
            },
          },
          {
            text: 'Em pacientes com Parkinson, a principal preocupação de segurança costuma ser o risco elevado de quedas.',
            type: 'true_false',
            explanation: 'Verdadeiro. Tremor, rigidez e lentidão aumentam muito o risco de quedas.',
            order: 4,
            options: {
              create: [
                { text: 'Verdadeiro', isCorrect: true, order: 1 },
                { text: 'Falso', isCorrect: false, order: 2 },
              ],
            },
          },
          {
            text: 'Qual é a medida mais eficaz para prevenir a transmissão de infecções?',
            type: 'multiple_choice',
            explanation: 'A higienização correta das mãos é a medida mais eficaz.',
            order: 5,
            options: {
              create: [
                { text: 'Usar apenas luvas, sem lavar as mãos', isCorrect: false, order: 1 },
                { text: 'Higienização das mãos (água e sabonete ou álcool 70%)', isCorrect: true, order: 2 },
                { text: 'Usar máscara o tempo todo, mesmo sem indicação', isCorrect: false, order: 3 },
                { text: 'Evitar qualquer contato com o paciente', isCorrect: false, order: 4 },
              ],
            },
          },
          {
            text: 'Os sinais vitais principais incluem temperatura, frequência cardíaca, frequência respiratória, pressão arterial e dor (5º sinal vital).',
            type: 'true_false',
            explanation: 'Verdadeiro. A dor é considerada o quinto sinal vital.',
            order: 6,
            options: {
              create: [
                { text: 'Verdadeiro', isCorrect: true, order: 1 },
                { text: 'Falso', isCorrect: false, order: 2 },
              ],
            },
          },
          {
            text: 'No banho no leito, a higiene deve começar pelas partes mais limpas e terminar nas mais sujas (região íntima por último).',
            type: 'true_false',
            explanation: 'Verdadeiro. Essa ordem reduz a contaminação de áreas limpas.',
            order: 7,
            options: {
              create: [
                { text: 'Verdadeiro', isCorrect: true, order: 1 },
                { text: 'Falso', isCorrect: false, order: 2 },
              ],
            },
          },
          {
            text: 'Quais fatores aumentam o risco de lesão por pressão (LPP)?',
            type: 'multiple_choice',
            explanation: 'Pressão prolongada, cisalhamento, umidade e mobilidade reduzida são fatores de risco.',
            order: 8,
            options: {
              create: [
                { text: 'Apenas a idade avançada', isCorrect: false, order: 1 },
                { text: 'Pressão prolongada, cisalhamento, umidade e mobilidade reduzida', isCorrect: true, order: 2 },
                { text: 'Somente falta de alimentação', isCorrect: false, order: 3 },
                { text: 'Uso de fraldas descartáveis', isCorrect: false, order: 4 },
              ],
            },
          },
          {
            text: 'Sinais de alerta de disfagia incluem engasgo, tosse durante a refeição, voz “molhada” e escape de alimento.',
            type: 'true_false',
            explanation: 'Verdadeiro. Esses sinais indicam risco de aspiração e devem ser comunicados.',
            order: 9,
            options: {
              create: [
                { text: 'Verdadeiro', isCorrect: true, order: 1 },
                { text: 'Falso', isCorrect: false, order: 2 },
              ],
            },
          },
          {
            text: 'O cuidador pode alterar o horário ou a dose de um medicamento se achar necessário.',
            type: 'true_false',
            explanation: 'Falso. O cuidador não altera tratamento. Apenas lembra horários e observa, dentro do autorizado.',
            order: 10,
            options: {
              create: [
                { text: 'Verdadeiro', isCorrect: false, order: 1 },
                { text: 'Falso', isCorrect: true, order: 2 },
              ],
            },
          },
          {
            text: 'Se a sonda sair acidentalmente, o cuidador deve tentar recolocá-la imediatamente.',
            type: 'true_false',
            explanation: 'Falso. Recolocar sonda exige habilitação. Não manipular para reintroduzir; comunicar a enfermagem.',
            order: 11,
            options: {
              create: [
                { text: 'Verdadeiro', isCorrect: false, order: 1 },
                { text: 'Falso', isCorrect: true, order: 2 },
              ],
            },
          },
          {
            text: 'Sinais de infecção em ferida incluem calor, pus, odor, aumento de dor e vermelhidão.',
            type: 'true_false',
            explanation: 'Verdadeiro. Esses sinais devem ser registrados e comunicados à equipe.',
            order: 12,
            options: {
              create: [
                { text: 'Verdadeiro', isCorrect: true, order: 1 },
                { text: 'Falso', isCorrect: false, order: 2 },
              ],
            },
          },
          {
            text: 'Antes de transferir um paciente, o cuidador deve:',
            type: 'multiple_choice',
            explanation: 'Explicar, verificar calçados, travar rodas, ajustar posição e garantir espaço seguro.',
            order: 13,
            options: {
              create: [
                { text: 'Puxar o paciente pelos braços sem avisar', isCorrect: false, order: 1 },
                { text: 'Explicar o procedimento, travar rodas da cadeira/cama, verificar calçados e espaço', isCorrect: true, order: 2 },
                { text: 'Levantar sozinho mesmo se o paciente for pesado', isCorrect: false, order: 3 },
                { text: 'Não comunicar a equipe em caso de queda', isCorrect: false, order: 4 },
              ],
            },
          },
          {
            text: 'Sinais de hipoglicemia incluem sudorese, tremores, fome, confusão e irritabilidade.',
            type: 'true_false',
            explanation: 'Verdadeiro. Reconhecer e comunicar rapidamente é essencial.',
            order: 14,
            options: {
              create: [
                { text: 'Verdadeiro', isCorrect: true, order: 1 },
                { text: 'Falso', isCorrect: false, order: 2 },
              ],
            },
          },
          {
            text: 'Em uma convulsão, o cuidador deve colocar objetos na boca da vítima para evitar que “engula a língua”.',
            type: 'true_false',
            explanation: 'Falso. Nunca colocar nada na boca. Proteger a cabeça, afastar objetos e observar o tempo.',
            order: 15,
            options: {
              create: [
                { text: 'Verdadeiro', isCorrect: false, order: 1 },
                { text: 'Falso', isCorrect: true, order: 2 },
              ],
            },
          },
          {
            text: 'O número de emergência do SAMU é:',
            type: 'multiple_choice',
            explanation: 'SAMU 192.',
            order: 16,
            options: {
              create: [
                { text: '190', isCorrect: false, order: 1 },
                { text: '193', isCorrect: false, order: 2 },
                { text: '192', isCorrect: true, order: 3 },
                { text: '199', isCorrect: false, order: 4 },
              ],
            },
          },
          {
            text: 'Cuidados paliativos têm como objetivo principal a cura da doença.',
            type: 'true_false',
            explanation: 'Falso. O foco é aliviar sofrimento, promover conforto, qualidade de vida e dignidade.',
            order: 17,
            options: {
              create: [
                { text: 'Verdadeiro', isCorrect: false, order: 1 },
                { text: 'Falso', isCorrect: true, order: 2 },
              ],
            },
          },
          {
            text: 'No registro (Diário de Bordo), o cuidador deve registrar fatos objetivos, não interpretações ou diagnósticos.',
            type: 'true_false',
            explanation: 'Verdadeiro. Registro deve ser verdadeiro, objetivo, legível e próximo do horário do cuidado.',
            order: 18,
            options: {
              create: [
                { text: 'Verdadeiro', isCorrect: true, order: 1 },
                { text: 'Falso', isCorrect: false, order: 2 },
              ],
            },
          },
          {
            text: 'Negligência, imprudência e imperícia são formas de conduta inadequada. Imperícia é:',
            type: 'multiple_choice',
            explanation: 'Imperícia é executar tarefa sem a habilitação ou conhecimento adequado.',
            order: 19,
            options: {
              create: [
                { text: 'Deixar de fazer o que deveria (omissão)', isCorrect: false, order: 1 },
                { text: 'Agir de forma precipitada', isCorrect: false, order: 2 },
                { text: 'Executar tarefa sem habilitação ou conhecimento adequado', isCorrect: true, order: 3 },
                { text: 'Divulgar dados do paciente', isCorrect: false, order: 4 },
              ],
            },
          },
          {
            text: 'O sigilo profissional termina quando o atendimento acaba.',
            type: 'true_false',
            explanation: 'Falso. A obrigação de proteger informações continua após o término do atendimento.',
            order: 20,
            options: {
              create: [
                { text: 'Verdadeiro', isCorrect: false, order: 1 },
                { text: 'Falso', isCorrect: true, order: 2 },
              ],
            },
          },
        ],
      },
    },
  })
  console.log('✅ PROVA FINAL com 20 questões criada')

  console.log('')
  console.log('🎉 Seed concluído com sucesso!')
  console.log('────────────────────────────────────')
  console.log('Admin:  admin@benecurati.com.br / admin123')
  console.log('Aluno:  aluno@teste.com / aluno123')
  console.log('────────────────────────────────────')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
