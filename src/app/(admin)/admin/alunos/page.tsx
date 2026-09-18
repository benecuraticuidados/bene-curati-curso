import { prisma } from "@/lib/prisma"
import Link from "next/link"
import { formatDate } from "@/lib/utils"
import ToggleStudentButton from "./ToggleStudentButton"
import DeleteUserButton from "./DeleteUserButton"
import CreateStudentForm from "./CreateStudentForm"

export default async function AdminAlunosPage({
  searchParams,
}: {
  searchParams: { q?: string }
}) {
  const q = searchParams.q?.trim() || ""

  const students = await prisma.user.findMany({
    where: {
      role: "STUDENT",
      ...(q
        ? {
            OR: [
              { name: { contains: q } },
              { email: { contains: q } },
              { cpf: { contains: q } },
            ],
          }
        : {}),
    },
    orderBy: { createdAt: "desc" },
    include: {
      enrollments: {
        include: { course: { select: { title: true } } },
        take: 1,
      },
      certificates: {
        where: { status: "ISSUED" },
        take: 1,
      },
      progress: true,
      _count: {
        select: { progress: true, quizAttempts: true },
      },
    },
  })

  // Total de aulas para calcular progresso
  const totalLessons = await prisma.lesson.count()

  return (
    <div>
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Alunos</h1>
          <p className="text-gray-500 text-sm mt-1">
            {students.length} aluno(s) encontrado(s)
          </p>
        </div>
        <form className="flex gap-2">
          <input
            type="search"
            name="q"
            defaultValue={q}
            placeholder="Buscar por nome, e-mail ou CPF..."
            className="input-field text-sm w-full sm:w-72"
          />
          <button type="submit" className="btn-primary text-sm px-4">
            Buscar
          </button>
        </form>
      </div>

      <CreateStudentForm />

      <div className="card overflow-x-auto p-0">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50">
              <th className="text-left py-3 px-4 font-semibold text-gray-600">
                Aluno
              </th>
              <th className="text-left py-3 px-4 font-semibold text-gray-600 hidden md:table-cell">
                Contato
              </th>
              <th className="text-left py-3 px-4 font-semibold text-gray-600">
                Progresso
              </th>
              <th className="text-left py-3 px-4 font-semibold text-gray-600 hidden lg:table-cell">
                Cadastro
              </th>
              <th className="text-left py-3 px-4 font-semibold text-gray-600">
                Status
              </th>
              <th className="text-right py-3 px-4 font-semibold text-gray-600">
                Ações
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {students.map((s) => {
              const completedLessons = s.progress.filter(
                (p) => p.completed
              ).length
              const pct =
                totalLessons > 0
                  ? Math.round((completedLessons / totalLessons) * 100)
                  : 0
              const hasCert = s.certificates.length > 0

              return (
                <tr key={s.id} className="hover:bg-gray-50/50">
                  <td className="py-3 px-4">
                    <p className="font-medium text-gray-900">{s.name}</p>
                    <p className="text-xs text-gray-500">{s.email}</p>
                    {s.cpf && (
                      <p className="text-xs text-gray-400">{s.cpf}</p>
                    )}
                  </td>
                  <td className="py-3 px-4 hidden md:table-cell text-gray-600">
                    {s.whatsapp || "—"}
                    {s.city && (
                      <span className="block text-xs text-gray-400">
                        {s.city}/{s.state}
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <div className="w-20 h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-wine rounded-full"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <span className="text-xs text-gray-600">{pct}%</span>
                    </div>
                    {hasCert && (
                      <span className="text-xs text-green-600 font-medium">
                        Certificado emitido
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-4 hidden lg:table-cell text-gray-500 text-xs">
                    {formatDate(s.createdAt)}
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full ${
                        s.isActive
                          ? "bg-green-50 text-green-700"
                          : "bg-red-50 text-red-600"
                      }`}
                    >
                      {s.isActive ? "Ativo" : "Bloqueado"}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex justify-end gap-2">
                      <ToggleStudentButton
                        userId={s.id}
                        isActive={s.isActive}
                        name={s.name}
                      />
                      <DeleteUserButton userId={s.id} name={s.name} />
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>

        {students.length === 0 && (
          <p className="text-center text-gray-500 py-10">
            Nenhum aluno encontrado.
          </p>
        )}
      </div>
    </div>
  )
}
