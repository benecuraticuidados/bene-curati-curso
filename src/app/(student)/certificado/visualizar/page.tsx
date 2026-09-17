import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import Image from "next/image"
import Link from "next/link"
import { formatDate } from "@/lib/utils"
import PrintButton from "@/components/PrintButton"
import { canReleaseCertificate } from "@/lib/certificate-guard"

const CONTEUDO_PROGRAMATICO = [
  { titulo: "1. Papel do Cuidador", horas: 8 },
  { titulo: "2. Ética e Humanização", horas: 10 },
  { titulo: "3. Anatomia e Fisiologia", horas: 10 },
  { titulo: "4. Envelhecimento e Doenças", horas: 12 },
  { titulo: "5. Biossegurança", horas: 10 },
  { titulo: "6. Sinais Vitais", horas: 12 },
  { titulo: "7. Higiene e Banho no Leito", horas: 14 },
  { titulo: "8. Decúbito e Prevenção de LPP", horas: 10 },
  { titulo: "9. Nutrição, Hidratação e Disfagia", horas: 10 },
  { titulo: "10. Medicamentos – Limites", horas: 8 },
  { titulo: "11. Sondas e Ostomias", horas: 8 },
  { titulo: "12. Curativos e Pele", horas: 8 },
  { titulo: "13. Mobilização e Prevenção de Quedas", horas: 12 },
  { titulo: "14. Alzheimer, Parkinson, AVC, DM, HAS", horas: 12 },
  { titulo: "15. Primeiros Socorros", horas: 14 },
  { titulo: "16. Cuidados Paliativos", horas: 8 },
  { titulo: "17. Comunicação e Família", horas: 8 },
  { titulo: "18. Diário de Bordo", horas: 6 },
  { titulo: "19. Autocuidado e Burnout", horas: 8 },
  { titulo: "20. Ética e Legislação", horas: 8 },
  { titulo: "21. Código de Excelência + Técnicas Avançadas", horas: 8 },
]

export default async function VisualizarCertificadoPage() {
  const session = await getServerSession(authOptions)
  if (!session?.user) redirect("/login")

  const userId = (session.user as any).id as string

  const raw = await prisma.certificate.findFirst({
    where: { userId },
    include: {
      user: true,
      course: true,
    },
    orderBy: { createdAt: "desc" },
  })

  if (!raw) {
    redirect("/certificado")
  }

  const access = await canReleaseCertificate({
    userId,
    certificateId: raw.id,
  })
  if (!access.ok || raw.status !== "ISSUED") {
    redirect("/certificado")
  }

  const certificate = raw

  const totalHoras =
    CONTEUDO_PROGRAMATICO.reduce((acc, m) => acc + m.horas, 0) ||
    certificate.course.workloadHours ||
    200

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4 print:bg-white print:py-0 certificate-print">
      <style>{`
        @media print {
          @page { size: A4 landscape; margin: 10mm; }
          .print\\:break-after-page { page-break-after: always; }
        }
      `}</style>
      {/* Controles — não imprimem */}
      <div className="max-w-4xl mx-auto mb-6 print:hidden flex flex-wrap gap-3">
        <Link href="/certificado" className="btn-outline text-sm">
          ← Voltar
        </Link>
        <PrintButton />
        <p className="text-xs text-gray-500 self-center">
          Dica: ao imprimir, use “frente e verso” (duplex) ou imprima página 1 e 2 separadamente.
        </p>
      </div>

      {/* ========== FRENTE DO CERTIFICADO ========== */}
      <div className="max-w-4xl mx-auto bg-white shadow-xl border-8 border-wine print:shadow-none print:border-4 print:break-after-page">
        <div className="bg-wine h-4" />

        <div className="px-8 py-10 md:px-16 md:py-14 text-center">
          <div className="flex justify-center mb-6">
            <Image
              src="/logo-bene-curati-v2.png"
              alt="Bene Curati Cuidados"
              width={100}
              height={100}
              className="object-contain"
            />
          </div>

          <p className="text-wine font-semibold tracking-widest text-sm uppercase mb-2">
            Bene Curati Cuidados
          </p>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-1">
            CERTIFICADO DE CONCLUSÃO
          </h1>
          <p className="text-gray-500 text-sm mb-8">
            Curso Profissional de Cuidador • {totalHoras} horas
          </p>

          <p className="text-gray-700 text-lg mb-2">Certificamos que</p>
          <p className="text-2xl md:text-3xl font-bold text-wine mb-6 border-b-2 border-wine/20 pb-3 inline-block px-8">
            {certificate.user.name}
          </p>

          <p className="text-gray-700 max-w-2xl mx-auto leading-relaxed mb-8">
            concluiu com êxito o{" "}
            <strong>Curso Profissional de Cuidador</strong> da Bene Curati
            Cuidados, com carga horária total de{" "}
            <strong>{totalHoras} horas</strong>, abrangendo formação teórica e
            técnica em Home Care, Cuidados Domiciliares, Assistência ao
            Paciente, técnicas de enfermagem aplicadas e primeiros socorros,
            conforme a Apostila Oficial Ampliada e o conteúdo programático
            constante no verso deste certificado.
          </p>

          <div className="grid grid-cols-2 gap-6 max-w-md mx-auto text-sm text-gray-600 mb-10">
            <div>
              <p className="text-gray-400 text-xs uppercase">
                Data de conclusão
              </p>
              <p className="font-semibold text-gray-800">
                {formatDate(certificate.issuedAt)}
              </p>
            </div>
            <div>
              <p className="text-gray-400 text-xs uppercase">
                Código de autenticação
              </p>
              <p className="font-mono font-semibold text-wine">
                {certificate.code}
              </p>
            </div>
          </div>

          <div className="border-t border-gray-200 pt-8 mt-4 max-w-sm mx-auto">
            <div className="h-14 flex items-end justify-center">
              {/* Área reservada: substituir por /public/assinatura-diretor.png quando houver imagem oficial */}
              <span className="sr-only">Assinatura do diretor</span>
            </div>
            <div className="border-t border-gray-800 w-56 mx-auto mt-1 pt-2">
              <p className="font-semibold text-gray-900 tracking-wide">MARCELO RIOS</p>
              <p className="text-xs text-gray-600 uppercase">Diretor</p>
              <p className="text-xs text-gray-500">Bene Curati Cuidados</p>
            </div>
            <p className="text-sm text-gray-500 mt-4">
              CNPJ: 60.725.201/0001-88
            </p>
            <p className="text-xs text-gray-400 mt-2">
              Documento válido somente com o verso • Validação em /validar
            </p>
          </div>
        </div>

        <div className="bg-wine h-4" />
      </div>

      {/* Espaçamento na tela */}
      <div className="h-10 print:hidden" />

      {/* ========== VERSO DO CERTIFICADO — Conteúdo Programático ========== */}
      <div className="max-w-4xl mx-auto bg-white shadow-xl border-8 border-wine print:shadow-none print:border-4">
        <div className="bg-wine h-4" />

        <div className="px-6 py-8 md:px-12 md:py-10">
          {/* Cabeçalho do verso */}
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-wine/20">
            <div className="flex items-center gap-3">
              <Image
                src="/logo-bene-curati-v2.png"
                alt="Bene Curati Cuidados"
                width={48}
                height={48}
                className="object-contain"
              />
              <div>
                <p className="font-bold text-wine text-sm">
                  Bene Curati Cuidados
                </p>
                <p className="text-xs text-gray-500">
                  CNPJ 60.725.201/0001-88
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-xs text-gray-400 uppercase">Verso do certificado</p>
              <p className="font-mono text-sm font-semibold text-wine">
                {certificate.code}
              </p>
            </div>
          </div>

          <h2 className="text-xl font-bold text-gray-900 text-center mb-1">
            CONTEÚDO PROGRAMÁTICO
          </h2>
          <p className="text-center text-sm text-gray-500 mb-6">
            Curso Profissional de Cuidador — Carga horária total:{" "}
            <strong>{totalHoras} horas</strong>
          </p>

          {/* Tabela de módulos */}
          <div className="border border-gray-200 rounded-lg overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-wine text-white">
                  <th className="text-left py-2.5 px-3 font-semibold">
                    Módulo / Conteúdo
                  </th>
                  <th className="text-right py-2.5 px-3 font-semibold w-24">
                    Carga horária
                  </th>
                </tr>
              </thead>
              <tbody>
                {CONTEUDO_PROGRAMATICO.map((mod, i) => (
                  <tr
                    key={mod.titulo}
                    className={i % 2 === 0 ? "bg-white" : "bg-gray-50"}
                  >
                    <td className="py-1.5 px-3 text-gray-800">{mod.titulo}</td>
                    <td className="py-1.5 px-3 text-right text-gray-700 font-medium">
                      {mod.horas}h
                    </td>
                  </tr>
                ))}
                <tr className="bg-wine/10 border-t-2 border-wine">
                  <td className="py-2.5 px-3 font-bold text-gray-900">
                    CARGA HORÁRIA TOTAL
                  </td>
                  <td className="py-2.5 px-3 text-right font-bold text-wine">
                    {totalHoras}h
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Observações */}
          <div className="mt-6 text-xs text-gray-600 space-y-2 leading-relaxed">
            <p>
              <strong>Modalidade:</strong> formação teórica e técnica em Home
              Care, Cuidados Domiciliares e Assistência ao Paciente, com vídeos
              de referência em técnicas de enfermagem e primeiros socorros.
            </p>
            <p>
              <strong>Avaliação:</strong> prova final com 20 questões (aprovação
              mínima de 70%). Este certificado só é válido quando acompanhado
              deste verso com o conteúdo programático completo.
            </p>
            <p>
              <strong>Validação:</strong> consulte o código{" "}
              <span className="font-mono text-wine">{certificate.code}</span> em
              nosso site de validação pública. Emitido por Bene Curati Cuidados
              — CNPJ 60.725.201/0001-88.
            </p>
          </div>

          {/* Rodapé do verso */}
          <div className="mt-8 pt-4 border-t border-gray-200 text-center">
            <p className="text-xs text-gray-400">
              Bene Curati Cuidados • “NOSSA PAIXÃO É CUIDAR DE QUEM VOCÊ AMA!”
            </p>
            <p className="text-xs text-gray-400 mt-1">
              Aluno: {certificate.user.name} • Emitido em{" "}
              {formatDate(certificate.issuedAt)}
            </p>
          </div>
        </div>

        <div className="bg-wine h-4" />
      </div>

      <p className="text-center text-xs text-gray-400 mt-6 print:hidden">
        Certificado frente e verso • Valide em /validar • CNPJ
        60.725.201/0001-88
      </p>
    </div>
  )
}
