import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import StudentHeader from "@/components/StudentHeader"
import Link from "next/link"
import { CheckCircle2, Circle, ChevronRight } from "lucide-react"

export default async function CursoPage({
  searchParams,
}: {
  searchParams?: Promise<{ curso?: string }> | { curso?: string }
}) {
  const session = await getServerSession(authOptions)
  if (!session?.user) redirect("/login")

  const params = searchParams instanceof Promise ? await searchParams : searchParams
  const key = params?.curso
  const userId = (session.user as any).id as string

  const enrollment = await prisma.enrollment.findFirst({
    where: {
      userId,
      status: { in: ["ACTIVE", "COMPLETED"] },
      courseId: key === "socorros" ? "curso-socorros-01" : { not: "curso-socorros-01" },
    },
    include: {
      course: {
        include: {
          modules: {
            orderBy: { order: "asc" },
            include: { lessons: { orderBy: { order: "asc" } } },
          },
        },
      },
    },
  })

  if (!enrollment) redirect("/dashboard?curso=cuidador")

  const course = enrollment.course
  const progressList = await prisma.progress.findMany({
    where: { userId, lessonId: { in: course.modules.flatMap((m) => m.lessons.map((l) => l.id)) } },
  })
  const done = (id: string) => progressList.some((p) => p.lessonId === id && p.completed)

  return (
    <div className="min-h-screen bg-gray-50">
      <StudentHeader />
      <main className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-gray-900">{course.title}</h1>
        <p className="text-gray-500 mt-1 mb-6">{course.subtitle}</p>

        <div className="space-y-4">
          {course.modules.map((mod) => {
            const lessons = mod.lessons
            const completed = lessons.filter((l) => done(l.id)).length
            const allDone = lessons.length > 0 && completed === lessons.length
            const target = lessons.find((l) => !done(l.id)) || lessons[0]

            return (
              <div key={mod.id} className="card">
                <div className="flex items-start gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${allDone ? "bg-green-100 text-green-700" : "bg-wine/10 text-wine"}`}>
                    {allDone ? <CheckCircle2 className="w-5 h-5" /> : String(mod.order).padStart(2, "0")}
                  </div>
                  <div className="flex-1">
                    {target ? (
                      <Link href={`/aula/${target.id}`} className="font-semibold text-lg text-gray-900 hover:text-wine">
                        {mod.title}
                      </Link>
                    ) : (
                      <h2 className="font-semibold text-lg">{mod.title}</h2>
                    )}
                    <p className="text-sm text-gray-500 mt-1">{completed}/{lessons.length} aulas</p>
                    <ul className="mt-3 space-y-1">
                      {lessons.map((lesson) => (
                        <li key={lesson.id}>
                          <Link href={`/aula/${lesson.id}`} className="flex items-center gap-2 py-2">
                            {done(lesson.id) ? (
                              <CheckCircle2 className="w-4 h-4 text-green-600" />
                            ) : (
                              <Circle className="w-4 h-4 text-gray-300" />
                            )}
                            <span className="text-sm flex-1">{lessons.length === 1 ? (done(lesson.id) ? "Concluído" : "Em andamento") : lesson.title}</span>
                            <ChevronRight className="w-4 h-4 text-gray-300" />
                          </Link>
                        </li>
                      ))}
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