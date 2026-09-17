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
    <div className="min-h-screen bg-gray-100 py-8 px-4 print:bg-white print:py-0 print:px-0">
      <style>{`
        .sheet {
          width: 297mm;
          min-height: 190mm;
        }
        @media print {
          @page { size: A4 landscape; margin: 6mm; }
          html, body { margin: 0; background: white; }
          .no-print { display: none !important; }
          .sheet {
            width: 285mm !important;
            min-height: 0 !important;
            max-height: 198mm !important;
            overflow: hidden !important;
            box-shadow: none !important;
            border-width: 4px !important;
            page-break-inside: avoid;
            break-inside: avoid;
          }
          .sheet-front { page-break-after: always; break-after: page; }
          .sheet-back { page-break-after: auto; }
        }
      `}</style>
      {/* Controles — não imprimem */}
      <div className="max-w-[297mm] mx-auto mb-6 no-print flex flex-wrap gap-3">
        <Link href="/certificado" className="btn-outline text-sm">
          ← Voltar
        </Link>
        <PrintButton />
        <p className="text-xs text-gray-500 self-center">
          Ao imprimir: A4 • Paisagem (horizontal) • 2 páginas (frente e verso).
        </p>
      </div>

      {/* ========== FRENTE DO CERTIFICADO ========== */}
      <div className="sheet sheet-front max-w-[297mm] mx-auto bg-white shadow-xl border-8 border-wine">
        <div className="bg-wine h-3" />

        <div className="px-8 py-6 md:px-12 md:py-8 text-center">
          <div className="flex justify-center mb-3">
            <Image
              src="/logo-bene-curati-v2.png"
              alt="Bene Curati Cuidados"
              width={88}
              height={88}
              className="object-contain"
            />
          </div>

          <p className="text-wine font-semibold tracking-widest text-sm uppercase mb-2">
            Bene Curati Cuidados
          </p>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-1">
            CERTIFICADO DE CONCLUSÃO
          </h1>
          <p className="text-gray-500 text-sm mb-5">
            Curso Profissional de Cuidador • {totalHoras} horas
          </p>

          <p className="text-gray-700 text-lg mb-2">Certificamos que</p>
          <p className="text-2xl md:text-3xl font-bold text-wine mb-4 border-b-2 border-wine/20 pb-2 inline-block px-8">
            {certificate.user.name}
          </p>

          <p className="text-gray-700 max-w-2xl mx-auto leading-relaxed mb-6 text-sm md:text-base">
            concluiu com êxito o{" "}
            <strong>Curso Profissional de Cuidador</strong> da Bene Curati
            Cuidados, com carga horária total de{" "}
            <strong>{totalHoras} horas</strong>, abrangendo formação teórica e
            técnica em Home Care, Cuidados Domiciliares, Assistência ao
            Paciente, técnicas de enfermagem aplicadas e primeiros socorros,
            conforme a Apostila Oficial Ampliada e o conteúdo programático
            constante no verso deste certificado.
          </p>

          <div className="grid grid-cols-2 gap-6 max-w-md mx-auto text-sm text-gray-600 mb-6">
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

          <div className="border-t border-gray-200 pt-5 mt-2 max-w-sm mx-auto">
            <div className="h-10 flex items-end justify-center">
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

        <div className="bg-wine h-3" />
      </div>

      <div className="h-8 no-print" />

      <div className="sheet sheet-back max-w-[297mm] mx-auto bg-white shadow-xl border-8 border-wine">
        <div className="bg-wine h-3" />

        <div className="px-5 py-5 md:px-8 md:py-6">
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

          <h2 className="text-lg font-bold text-gray-900 text-center mb-1">
            CONTEÚDO PROGRAMÁTICO
          </h2>
          <p className="text-center text-xs text-gray-500 mb-3">
            Curso Profissional de Cuidador — Carga horária total:{" "}
            <strong>{totalHoras} horas</strong>
          </p>

          <div className="grid grid-cols-2 gap-2">
            {[CONTEUDO_PROGRAMATICO.slice(0, 11), CONTEUDO_PROGRAMATICO.slice(11)].map((col, ci) => (
              <table key={ci} className="w-full text-[11px] border border-gray-200">
                <thead>
                  <tr className="bg-wine text-white">
                    <th className="text-left py-1 px-2 font-semibold">Módulo</th>
                    <th className="text-right py-1 px-2 font-semibold w-10">Horas</th>
                  </tr>
                </thead>
                <tbody>
                  {col.map((mod, i) => (
                    <tr key={mod.titulo} className={i % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                      <td className="py-0.5 px-2 text-gray-800">{mod.titulo}</td>
                      <td className="py-0.5 px-2 text-right font-medium">{mod.horas}h</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ))}
          </div>
          <p className="text-right text-sm font-bold text-wine mt-2">
            CARGA HORÁRIA TOTAL: {totalHoras}h
          </p>

          {/* Observações */}
          <div className="mt-3 text-[11px] text-gray-600 space-y-1 leading-snug">
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
          <div className="mt-3 pt-2 border-t border-gray-200 text-center">
            <p className="text-xs text-gray-400">
              Bene Curati Cuidados • “NOSSA PAIXÃO É CUIDAR DE QUEM VOCÊ AMA!”
            </p>
            <p className="text-xs text-gray-400 mt-1">
              Aluno: {certificate.user.name} • Emitido em{" "}
              {formatDate(certificate.issuedAt)}
            </p>
          </div>
        </div>

        <div className="bg-wine h-3" />
      </div>

      <p className="text-center text-xs text-gray-400 mt-6 no-print">
        Certificado frente e verso • Valide em /validar • CNPJ
        60.725.201/0001-88
      </p>
    </div>
  )
}
