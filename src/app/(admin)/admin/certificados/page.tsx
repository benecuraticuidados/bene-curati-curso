import { prisma } from "@/lib/prisma"
import { formatDate } from "@/lib/utils"
import IssueCertificateButton from "./IssueCertificateButton"

export default async function AdminCertificadosPage({
  searchParams,
}: {
  searchParams: { status?: string }
}) {
  const statusFilter = searchParams.status || "ALL"

  const certificates = await prisma.certificate.findMany({
    where:
      statusFilter === "ALL"
        ? {}
        : { status: statusFilter as "PENDING_PAYMENT" | "ISSUED" | "CANCELLED" },
    orderBy: { createdAt: "desc" },
    include: {
      user: { select: { name: true, email: true, cpf: true } },
      course: { select: { title: true, workloadHours: true } },
    },
  })

  const counts = await prisma.certificate.groupBy({
    by: ["status"],
    _count: true,
  })

  const countMap = Object.fromEntries(
    counts.map((c) => [c.status, c._count])
  )

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Certificados</h1>
        <p className="text-gray-500 text-sm mt-1">
          Gestão de emissão e status dos certificados
        </p>
      </div>

      {/* Filtros */}
      <div className="flex flex-wrap gap-2 mb-6">
        {[
          { key: "ALL", label: "Todos" },
          { key: "PENDING_PAYMENT", label: `Aguardando pagamento (${countMap.PENDING_PAYMENT || 0})` },
          { key: "ISSUED", label: `Emitidos (${countMap.ISSUED || 0})` },
          { key: "CANCELLED", label: `Cancelados (${countMap.CANCELLED || 0})` },
        ].map((f) => (
          <a
            key={f.key}
            href={`/admin/certificados?status=${f.key}`}
            className={`text-sm px-3 py-1.5 rounded-lg border transition ${
              statusFilter === f.key
                ? "bg-wine text-white border-wine"
                : "bg-white text-gray-600 border-gray-200 hover:border-wine/40"
            }`}
          >
            {f.label}
          </a>
        ))}
      </div>

      <div className="card overflow-x-auto p-0">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50">
              <th className="text-left py-3 px-4 font-semibold text-gray-600">
                Aluno
              </th>
              <th className="text-left py-3 px-4 font-semibold text-gray-600">
                Código
              </th>
              <th className="text-left py-3 px-4 font-semibold text-gray-600 hidden md:table-cell">
                Status
              </th>
              <th className="text-left py-3 px-4 font-semibold text-gray-600 hidden lg:table-cell">
                Data
              </th>
              <th className="text-right py-3 px-4 font-semibold text-gray-600">
                Ações
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {certificates.map((c) => (
              <tr key={c.id} className="hover:bg-gray-50/50">
                <td className="py-3 px-4">
                  <p className="font-medium text-gray-900">{c.user.name}</p>
                  <p className="text-xs text-gray-500">{c.user.email}</p>
                </td>
                <td className="py-3 px-4">
                  <span className="font-mono text-wine text-xs">
                    {c.code || "—"}
                  </span>
                </td>
                <td className="py-3 px-4 hidden md:table-cell">
                  <StatusBadge status={c.status} />
                </td>
                <td className="py-3 px-4 hidden lg:table-cell text-xs text-gray-500">
                  {c.issuedAt
                    ? formatDate(c.issuedAt)
                    : formatDate(c.createdAt)}
                </td>
                <td className="py-3 px-4 text-right">
                  {c.status === "PENDING_PAYMENT" && (
                    <IssueCertificateButton
                      certificateId={c.id}
                      studentName={c.user.name}
                    />
                  )}
                  {c.status === "ISSUED" && (
                    <a
                      href={`/validar?codigo=${c.code}`}
                      target="_blank"
                      className="text-xs text-wine hover:underline"
                    >
                      Validar
                    </a>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {certificates.length === 0 && (
          <p className="text-center text-gray-500 py-10">
            Nenhum certificado encontrado.
          </p>
        )}
      </div>
    </div>
  )
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    PENDING_PAYMENT: "bg-amber-50 text-amber-700",
    ISSUED: "bg-green-50 text-green-700",
    CANCELLED: "bg-red-50 text-red-600",
  }
  const labels: Record<string, string> = {
    PENDING_PAYMENT: "Aguardando pagamento",
    ISSUED: "Emitido",
    CANCELLED: "Cancelado",
  }
  return (
    <span
      className={`text-xs px-2 py-0.5 rounded-full ${map[status] || "bg-gray-100"}`}
    >
      {labels[status] || status}
    </span>
  )
}
