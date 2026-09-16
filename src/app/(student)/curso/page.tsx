import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import StudentHeader from "@/components/StudentHeader"
import Link from "next/link"
import { CheckCircle2, Circle, ChevronRight, PlayCircle } from "lucide-react"

export default async function CursoPage() {
  const session = await getServerSession(authOptions)
  if (!session?.user) redirect("/login")

  const userId = (session.user as any).id as string

  const enrollment = await prisma.enrollment.findFirst({
    where: { userId, status: { in: ["ACTIVE", "COMPLETED"] } },
    include: {
      course: {
        include: {
          modules: {
            orderBy: { order: "asc" },
            include: {
              lessons: { orderBy: { order: "asc" } },
            },
          },
        },
      },
    },
  })

  if (!enrollment) {
    redirect("/dashboard")
  }

  const course = enrollment.course
  const allLessonIds = course.modules.flatMap((m) => m.lessons.map((l) => l.id))

  const progressList = await prisma.progress.findMany({
    where: { userId, lessonId: { in: allLessonIds } },
  })

  const isLessonCompleted = (lessonId: string) =>
    progressList.some((p) => p.lessonId === lessonId && p.completed)

  return (
    <div className="min-h-screen bg-gray-50">
      <StudentHeader />

      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">{course.title}</h1>
          <p className="text-gray-500 mt-1">{course.subtitle}</p>
        </div>

        <div className="space-y-4">
          {course.modules.map((mod) => {
            const modLessons = mod.lessons
            const completedInMod = modLessons.filter((l) =>
              isLessonCompleted(l.id)
            ).length
            const allDone =
              modLessons.length > 0 && completedInMod === modLessons.length

            return (
              <div key={mod.id} className="card overflow-hidden">
                <div className="flex items-start gap-3">
                  <div
                    className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                      allDone
                        ? "bg-green-100 text-green-700"
                        : "bg-wine/10 text-wine"
                    }`}
                  >
                    {allDone ? (
                      <CheckCircle2 className="w-5 h-5" />
                    ) : (
                      String(mod.order).padStart(2, "0")
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h2 className="font-semibold text-gray-900">{mod.title}</h2>
                    <p className="text-sm text-gray-500 mt-0.5">
                      {completedInMod}/{modLessons.length} aulas •{" "}
                      {mod.description}
                    </p>

                    {/* Lista de aulas */}
                    <ul className="mt-3 space-y-1">
                      {modLessons.map((lesson) => {
                        const done = isLessonCompleted(lesson.id)
                        return (
                          <li key={lesson.id}>
                            <Link
                              href={`/aula/${lesson.id}`}
                              className="flex items-center gap-2 py-2 px-2 -mx-2 rounded-lg hover:bg-gray-50 transition group"
                            >
                              {done ? (
                                <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0" />
                              ) : (
                                <Circle className="w-4 h-4 text-gray-300 flex-shrink-0" />
                              )}
                              <span
                                className={`text-sm flex-1 ${
                                  done ? "text-gray-500" : "text-gray-800"
                                }`}
                              >
                                {lesson.title}
                              </span>
                              {lesson.durationMin && (
                                <span className="text-xs text-gray-400">
                                  {lesson.durationMin} min
                                </span>
                              )}
                              <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-wine transition" />
                            </Link>
                          </li>
                        )
                      })}
                    </ul>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </main>
    </div>
  )
}
