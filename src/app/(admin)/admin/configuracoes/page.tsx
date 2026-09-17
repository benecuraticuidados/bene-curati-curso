import { prisma } from "@/lib/prisma"
import SettingsForm from "./SettingsForm"

export default async function AdminConfigPage() {
  const settings = await prisma.settings.findUnique({
    where: { id: "main" },
  })

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Configurações</h1>
        <p className="text-gray-500 text-sm mt-1">
          Dados institucionais da Bene Curati Cuidados
        </p>
      </div>

      <SettingsForm
        initial={{
          institutionName: settings?.institutionName || "Bene Curati Cuidados",
          phone: settings?.phone || "",
          whatsapp: settings?.whatsapp || "",
          email: settings?.email || "",
          address: settings?.address || "",
          courseName: settings?.courseName || "CURSO PROFISSIONAL DE CUIDADOR",
          workloadHours: settings?.workloadHours || 210,
          minScore: settings?.minScore || 7.0,
          certificateFee: settings?.certificateFee || 75,
          institutionalPhrase:
            settings?.institutionalPhrase ||
            "NOSSA PAIXÃO É CUIDAR DE QUEM VOCÊ AMA!",
          cnpj: (settings as any)?.cnpj || "60.725.201/0001-88",
        }}
      />
    </div>
  )
}
