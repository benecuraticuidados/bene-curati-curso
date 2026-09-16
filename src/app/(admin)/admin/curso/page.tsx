import { prisma } from "@/lib/prisma"
import Link from "next/link"

export default async function AdminCursoPage() {
  const course = await prisma.course.findFirst({
    include: {
      modules: {
        orderBy: { order: "asc" },
        include: {
          lessons: { orderBy: { order: "asc" } },
          _count: { select: { lessons: true } },
        },
      },
      quizzes: {
        orderBy: { order: "asc" },
        include: {
          _count: { select: { questions: true, attempts: true } },
        },
      },
      _count: {
        select: { enrollments: true, certificates: true },
      },
    },
  })

  if (!course) {
    return (
      <div className="card text-center text-gray-500">
        Nenhum curso cadastrado. Execute o seed.
      </div>
    )
  }

  const totalLessons = course.modules.reduce(
    (acc, m) => acc + m.lessons.length,
    0
  )

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Curso</h1>
        <p className="text-gray-500 text-sm mt-1">
          Estrutura do Curso Profissional de Cuidador
        </p>
      </div>

      {/* Resumo */}
      <div className="card mb-6">
        <h2 className="font-semibold text-gray-900 text-lg">{course.title}</h2>
        {course.subtitle && (
          <p className="text-gray-500 text-sm mt-1">{course.subtitle}</p>
        )}
        <div className="flex flex-wrap gap-4 mt-4 text-sm text-gray-600">
          <span>
            <strong>{course.workloadHours}h</strong> de carga horária
          </span>
          <span>•</span>
          <span>
            <strong>{course.modules.length}</strong> módulos
          </span>
          <span>•</span>
          <span>
            <strong>{totalLessons}</strong> aulas
          </span>
          <span>•</span>
          <span>
            <strong>{course._count.enrollments}</strong> matrículas
          </span>
          <span>•</span>
          <span>
            Nota mínima: <strong>{(course.minScore * 10).toFixed(0)}%</strong>
          </span>
        </div>
      </div>

      {/* Módulos */}
      <div className="card mb-6">
        <h2 className="font-semibold text-gray-900 mb-4">Módulos e aulas</h2>
        <div className="space-y-3">
          {course.modules.map((mod) => (
            <div
              key={mod.id}
              className="border border-gray-100 rounded-lg p-3"
            >
              <div className="flex items-center justify-between">
                <p className="font-medium text-gray-900 text-sm">{mod.title}</p>
                <span className="text-xs text-gray-500">
                  {mod._count.lessons} aula(s)
                </span>
              </div>
              {mod.lessons.length > 0 && (
                <ul className="mt-2 ml-2 space-y-1">
                  {mod.lessons.map((l) => (
                    <li key={l.id} className="text-xs text-gray-500 flex gap-2">
                      <span className="text-wine">•</span>
                      {l.title}
                      {l.videoUrl && (
                        <span className="text-green-600">▶ vídeo</span>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Avaliações */}
      <div className="card">
        <h2 className="font-semibold text-gray-900 mb-4">Avaliações</h2>
        {course.quizzes.length === 0 ? (
          <p className="text-sm text-gray-500">Nenhuma avaliação cadastrada.</p>
        ) : (
          <ul className="divide-y divide-gray-100">
            {course.quizzes.map((q) => (
              <li
                key={q.id}
                className="py-3 flex items-center justify-between"
              >
                <div>
                  <p className="font-medium text-sm text-gray-900">
                    {q.title}
                    {q.isFinal && (
                      <span className="ml-2 text-xs bg-wine text-white px-1.5 py-0.5 rounded">
                        FINAL
                      </span>
                    )}
                  </p>
                  <p className="text-xs text-gray-500">
                    {q._count.questions} questões • {q._count.attempts}{" "}
                    tentativa(s) • mín. {(q.minScore * 10).toFixed(0)}%
                  </p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
