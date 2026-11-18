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

const SOCORROS_ID = "curso-socorros-01"

export default async function AdminDashboardPage({
  searchParams,
}: {
  searchParams?: { curso?: string }
}) {
  const isSocorros = searchParams?.curso === "socorros"
  const courseWhere = isSocorros
    ? { courseId: SOCORROS_ID }
    : { courseId: { not: SOCORROS_ID } }
  const title = isSocorros
    ? "Primeiros Socorros e Prevenção de Acidentes"
    : "Curso Profissional de Cuidador"

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
    prisma.user.count({
      where: { role: "STUDENT", enrollments: { some: courseWhere } },
    }),
    prisma.enrollment.count({ where: { status: "ACTIVE", ...courseWhere } }),
    prisma.certificate.count({ where: { status: "ISSUED", ...courseWhere } }),
    prisma.certificate.count({
      where: { status: "PENDING_PAYMENT", ...courseWhere },
    }),
    prisma.lesson.count({
      where: { module: { courseId: courseWhere.courseId } },
    }),
    prisma.user.findMany({
      where: { role: "STUDENT", enrollments: { some: courseWhere } },
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
      where: { status: "ISSUED", ...courseWhere },
      orderBy: { issuedAt: "desc" },
      take: 5,
      include: {
        user: { select: { name: true, email: true } },
      },
    }),
    prisma.quizAttempt.count({
      where: {
        passed: true,
        quiz: { lesson: { module: { courseId: courseWhere.courseId } } },
      },
    }),
  ])

  const base = isSocorros ? "?curso=socorros" : ""
  const cards = [
    {
      label: "Alunos cadastrados",
      value: totalStudents,
      icon: Users,
      color: "bg-blue-50 text-blue-600",
      href: "/admin/alunos" + base,
    },
    {
      label: "Matrículas ativas",
      value: activeEnrollments,
      icon: BookOpen,
      color: "bg-green-50 text-green-600",
      href: "/admin/alunos" + base,
    },
    {
      label: "Certificados emitidos",
      value: certificatesIssued,
      icon: Award,
      color: "bg-wine/10 text-wine",
      href: "/admin/certificados" + base,
    },
    {
      label: "Aguardando pagamento",
      value: certificatesPending,
      icon: Clock,
      color: "bg-amber-50 text-amber-600",
      href: "/admin/certificados" + base,
    },
    {
      label: "Aulas no curso",
      value: totalLessons,
      icon: TrendingUp,
      color: "bg-purple-50 text-purple-600",
      href: "/admin/curso" + base,
    },
    {
      label: "Aprovações em provas",
      value: quizPasses,
      icon: ClipboardCheck,
      color: "bg-teal-50 text-teal-600",
      href: "/admin/curso" + base,
    },
  ]

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500 text-sm mt-1">
          Visão geral do {title} — Bene Curati Cuidados
        </p>
        <div className="mt-4 flex gap-2">
          <Link
            href="/admin"
            className={`text-sm px-3 py-1.5 rounded-full border ${
              !isSocorros
                ? "bg-wine text-white border-wine"
                : "bg-white text-gray-700 border-gray-200"
            }`}
          >
            Cuidador
          </Link>
          <Link
            href="/admin?curso=socorros"
            className={`text-sm px-3 py-1.5 rounded-full border ${
              isSocorros
                ? "bg-wine text-white border-wine"
                : "bg-white text-gray-700 border-gray-200"
            }`}
          >
            Primeiros Socorros
          </Link>
        </div>
      </div>

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
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-900">Últimos alunos</h2>
            <Link
              href={"/admin/alunos" + base}
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

        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-900">
              Últimos certificados emitidos
            </h2>
            <Link
              href={"/admin/certificados" + base}
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