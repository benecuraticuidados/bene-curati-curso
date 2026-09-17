import { getServerSession } from "next-auth"
import { redirect, notFound } from "next/navigation"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import StudentHeader from "@/components/StudentHeader"
import Link from "next/link"
import { ChevronLeft, ChevronRight, CheckCircle2 } from "lucide-react"
import MarkCompleteButton from "./MarkCompleteButton"

export default async function AulaPage({
  params,
}: {
  params: { id: string }
}) {
  const session = await getServerSession(authOptions)
  if (!session?.user) redirect("/login")

  const userId = (session.user as any).id as string
  const lessonId = params.id

  const lesson = await prisma.lesson.findUnique({
    where: { id: lessonId },
    include: {
      module: {
        include: {
          course: {
            include: {
              modules: {
                orderBy: { order: "asc" },
                include: { lessons: { orderBy: { order: "asc" } } },
              },
            },
          },
          lessons: { orderBy: { order: "asc" } },
        },
      },
      materials: true,
    },
  })

  if (!lesson) notFound()

  // Verificar se o aluno está matriculado
  const enrollment = await prisma.enrollment.findFirst({
    where: {
      userId,
      courseId: lesson.module.courseId,
      status: { in: ["ACTIVE", "COMPLETED"] },
    },
  })

  if (!enrollment) redirect("/dashboard")

  // Progresso desta aula
  let progress = await prisma.progress.findUnique({
    where: {
      userId_lessonId: { userId, lessonId },
    },
  })

  // Atualizar lastAccess
  if (progress) {
    await prisma.progress.update({
      where: { id: progress.id },
      data: { lastAccess: new Date() },
    })
  } else {
    progress = await prisma.progress.create({
      data: {
        userId,
        lessonId,
        completed: false,
        lastAccess: new Date(),
      },
    })
  }

  // Navegação: aula anterior / próxima
  const allLessons = lesson.module.course.modules.flatMap((m) => m.lessons)
  const currentIndex = allLessons.findIndex((l) => l.id === lessonId)
  const prevLesson = currentIndex > 0 ? allLessons[currentIndex - 1] : null
  const nextLesson =
    currentIndex < allLessons.length - 1 ? allLessons[currentIndex + 1] : null

  return (
    <div className="min-h-screen bg-gray-50">
      <StudentHeader />

      <main className="max-w-4xl mx-auto px-4 py-6">
        {/* Breadcrumb */}
        <div className="mb-4 text-sm text-gray-500">
          <Link href="/curso" className="hover:text-wine">
            Meu Curso
          </Link>
          <span className="mx-2">/</span>
          <span>{lesson.module.title}</span>
        </div>

        <div className="card mb-6">
          <p className="text-sm font-medium text-wine mb-1">
            {lesson.module.title}
          </p>
          <h1 className="text-xl md:text-2xl font-bold text-gray-900 mb-4">
            {lesson.title}
          </h1>

          {lesson.videoUrl && (
            <div className="mb-6">
              <p className="text-xs font-semibold tracking-widest uppercase text-wine mb-2">
                {lesson.module.order === 22
                  ? "Vídeo prático obrigatório"
                  : "Vídeo de encerramento do módulo"}
              </p>
              <div className="aspect-video bg-gray-900 rounded-lg overflow-hidden">
                <iframe
                  src={lesson.videoUrl}
                  title={lesson.title}
                  className="w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
              <a
                href={lesson.videoUrl.replace("/embed/", "/watch?v=")}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-outline text-sm mt-3 inline-flex"
              >
                Assistir no YouTube
              </a>
            </div>
          )}

          {lesson.description && (
            <p className="text-sm text-gray-600 mb-4">{lesson.description}</p>
          )}

          {lesson.materials
            .filter((mat) => mat.type === "text" && mat.content)
            .map((mat) => (
              <article
                key={mat.id}
                className="border border-wine/15 bg-wine/[0.03] rounded-xl p-5 mb-6 lesson-reading"
              >
                <p className="text-xs font-semibold tracking-widest uppercase text-wine mb-3">
                  {mat.title} • Bene Curati Cuidados
                </p>
                <div
                  className="text-gray-800 text-sm leading-relaxed space-y-3 [&_h2]:text-lg [&_h2]:font-bold [&_h2]:text-wine [&_h3]:font-semibold [&_h3]:text-gray-900 [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5"
                  dangerouslySetInnerHTML={{ __html: mat.content || "" }}
                />
              </article>
            ))}

          {lesson.materials.filter((mat) => mat.url).length > 0 && (
            <div className="border-t border-gray-100 pt-4 mb-6">
              <h3 className="font-semibold text-gray-900 mb-3">Material complementar</h3>
              <ul className="space-y-2">
                {lesson.materials
                  .filter((mat) => mat.url)
                  .map((mat) => (
                    <li key={mat.id}>
                      <a
                        href={mat.url || "#"}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-wine hover:underline text-sm"
                      >
                        {mat.title}
                      </a>
                    </li>
                  ))}
              </ul>
            </div>
          )}

          {/* Botão marcar como concluída */}
          <MarkCompleteButton
            lessonId={lessonId}
            initiallyCompleted={progress.completed}
          />
        </div>

        {/* Navegação entre aulas */}
        <div className="flex justify-between gap-4">
          {prevLesson ? (
            <Link
              href={`/aula/${prevLesson.id}`}
              className="btn-outline inline-flex items-center gap-2 text-sm"
            >
              <ChevronLeft className="w-4 h-4" />
              Aula anterior
            </Link>
          ) : (
            <div />
          )}

          {nextLesson ? (
            <Link
              href={`/aula/${nextLesson.id}`}
              className="btn-primary inline-flex items-center gap-2 text-sm"
            >
              Próxima aula
              <ChevronRight className="w-4 h-4" />
            </Link>
          ) : (
            <Link
              href="/curso"
              className="btn-primary inline-flex items-center gap-2 text-sm"
            >
              Voltar ao curso
            </Link>
          )}
        </div>
      </main>
    </div>
  )
}
