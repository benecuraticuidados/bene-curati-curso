import { prisma } from "@/lib/prisma"
import { formatDate } from "@/lib/utils"
import CreateAdminForm from "./CreateAdminForm"
import DeleteUserButton from "../alunos/DeleteUserButton"

export default async function AdminEquipePage() {
  const admins = await prisma.user.findMany({
    where: { role: "ADMIN" },
    orderBy: { createdAt: "asc" },
  })

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Equipe / Administradores</h1>
        <p className="text-gray-500 text-sm mt-1">
          Cadastre outros administradores. O último admin não pode ser excluído.
        </p>
      </div>

      <div className="card mb-8">
        <h2 className="font-semibold text-gray-900 mb-4">Novo administrador</h2>
        <CreateAdminForm />
      </div>

      <div className="card overflow-x-auto p-0">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50">
              <th className="text-left py-3 px-4 font-semibold text-gray-600">Nome</th>
              <th className="text-left py-3 px-4 font-semibold text-gray-600">E-mail</th>
              <th className="text-left py-3 px-4 font-semibold text-gray-600">Status</th>
              <th className="text-left py-3 px-4 font-semibold text-gray-600">Cadastro</th>
              <th className="text-right py-3 px-4 font-semibold text-gray-600">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {admins.map((a) => (
              <tr key={a.id}>
                <td className="py-3 px-4 font-medium text-gray-900">{a.name}</td>
                <td className="py-3 px-4 text-gray-600">{a.email}</td>
                <td className="py-3 px-4">
                  <span className={`text-xs px-2 py-0.5 rounded-full ${a.isActive ? "bg-green-50 text-green-700" : "bg-red-50 text-red-600"}`}>
                    {a.isActive ? "Ativo" : "Inativo"}
                  </span>
                </td>
                <td className="py-3 px-4 text-xs text-gray-500">{formatDate(a.createdAt)}</td>
                <td className="py-3 px-4 text-right">
                  <DeleteUserButton userId={a.id} name={a.name} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
