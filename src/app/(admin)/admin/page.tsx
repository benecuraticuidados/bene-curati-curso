import { prisma } from "@/lib/prisma"
import {
  Users,
  BookOpen,
  Award,
  ClipboardCheck,
  TrendingUp,
  Clock,
} from "lucide-react"
import Link from "next/link"

export default async function AdminDashboardPage() {
  const [
    totalStudents,
    activeEnrollments,
    certificatesIssued,
    certificatesPending,
    totalLessons,
    recentStudents,
    recentCertificates,
    quizPasses,
  ] = await Promise.all([
    prisma.user.count({ where: { role: "STUDENT" } }),
    prisma.enrollment.count({ where: { status: "ACTIVE" } }),
    prisma.certificate.count({ where: { status: "ISSUED" } }),
    prisma.certificate.count({ where: { status: "PENDING_PAYMENT" } }),
    prisma.lesson.count(),
    prisma.user.findMany({
      where: { role: "STUDENT" },
      orderBy: { createdAt: "desc" },
      take: 5,
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
        isActive: true,
      },
    }),
    prisma.certificate.findMany({
      where: { status: "ISSUED" },
      orderBy: { issuedAt: "desc" },
      take: 5,
      include: {
        user: { select: { name: true, email: true } },
      },
    }),
    prisma.quizAttempt.count({ where: { passed: true } }),
  ])

  const cards = [
    {
      label: "Alunos cadastrados",
      value: totalStudents,
      icon: Users,
      color: "bg-blue-50 text-blue-600",
      href: "/admin/alunos",
    },
    {
      label: "Matrículas ativas",
      value: activeEnrollments,
      icon: BookOpen,
      color: "bg-green-50 text-green-600",
      href: "/admin/alunos",
    },
    {
      label: "Certificados emitidos",
      value: certificatesIssued,
      icon: Award,
      color: "bg-wine/10 text-wine",
      href: "/admin/certificados",
    },
    {
      label: "Aguardando pagamento",
      value: certificatesPending,
      icon: Clock,
      color: "bg-amber-50 text-amber-600",
      href: "/admin/certificados",
    },
    {
      label: "Aulas no curso",
      value: totalLessons,
      icon: TrendingUp,
      color: "bg-purple-50 text-purple-600",
      href: "/admin/curso",
    },
    {
      label: "Aprovações em provas",
      value: quizPasses,
      icon: ClipboardCheck,
      color: "bg-teal-50 text-teal-600",
      href: "/admin/curso",
    },
  ]

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500 text-sm mt-1">
          Visão geral do Curso Profissional de Cuidador — Bene Curati Cuidados
        </p>
      </div>

      {/* Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
        {cards.map((c) => (
          <Link
            key={c.label}
            href={c.href}
            className="card hover:shadow-md transition group"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-gray-500">{c.label}</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">
                  {c.value}
                </p>
              </div>
              <div
                className={`w-10 h-10 rounded-lg flex items-center justify-center ${c.color}`}
              >
                <c.icon className="w-5 h-5" />
              </div>
            </div>
          </Link>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Últimos alunos */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-900">Últimos alunos</h2>
            <Link
              href="/admin/alunos"
              className="text-sm text-wine hover:underline"
            >
              Ver todos
            </Link>
          </div>
          {recentStudents.length === 0 ? (
            <p className="text-sm text-gray-500">Nenhum aluno cadastrado.</p>
          ) : (
            <ul className="divide-y divide-gray-100">
              {recentStudents.map((s) => (
                <li
                  key={s.id}
                  className="py-3 flex items-center justify-between"
                >
                  <div>
                    <p className="font-medium text-gray-900 text-sm">
                      {s.name}
                    </p>
                    <p className="text-xs text-gray-500">{s.email}</p>
                  </div>
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full ${
                      s.isActive
                        ? "bg-green-50 text-green-700"
                        : "bg-red-50 text-red-600"
                    }`}
                  >
                    {s.isActive ? "Ativo" : "Inativo"}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Últimos certificados */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-900">
              Últimos certificados emitidos
            </h2>
            <Link
              href="/admin/certificados"
              className="text-sm text-wine hover:underline"
            >
              Ver todos
            </Link>
          </div>
          {recentCertificates.length === 0 ? (
            <p className="text-sm text-gray-500">
              Nenhum certificado emitido ainda.
            </p>
          ) : (
            <ul className="divide-y divide-gray-100">
              {recentCertificates.map((c) => (
                <li key={c.id} className="py-3">
                  <p className="font-medium text-gray-900 text-sm">
                    {c.user.name}
                  </p>
                  <p className="text-xs text-gray-500 font-mono">{c.code}</p>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  )
}
