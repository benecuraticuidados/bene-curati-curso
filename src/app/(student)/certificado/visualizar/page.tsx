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

  const userId = (session.user as { id?: string }).id as string

  const raw = await prisma.certificate.findFirst({
    where: { userId },
    include: { user: true, course: true },
    orderBy: { createdAt: "desc" },
  })
  if (!raw) redirect("/certificado")

  const access = await canReleaseCertificate({ userId, certificateId: raw.id })
  if (!access.ok || raw.status !== "ISSUED") redirect("/certificado")

  const certificate = raw
  const totalHoras =
    CONTEUDO_PROGRAMATICO.reduce((acc, m) => acc + m.horas, 0) ||
    certificate.course.workloadHours ||
    200
  const validateUrl = `https://bene-curati-curso.vercel.app/validar?codigo=${certificate.code}`
  const qrSrc = `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(validateUrl)}`
  const started = certificate.user.createdAt

  const colA = CONTEUDO_PROGRAMATICO.slice(0, 7)
  const colB = CONTEUDO_PROGRAMATICO.slice(7, 14)
  const colC = CONTEUDO_PROGRAMATICO.slice(14)

  return (
    <div className="min-h-screen bg-[#3a0f16] py-6 px-3 print:bg-white print:p-0">
      <style>{`
        .stage { width: 297mm; height: 210mm; }
        @media print {
          @page { size: A4 landscape; margin: 0; }
          html, body { margin: 0 !important; background: white !important; }
          .no-print { display: none !important; }
          .stage {
            width: 297mm !important;
            height: 210mm !important;
            margin: 0 !important;
            box-shadow: none !important;
            page-break-after: always;
            break-after: page;
          }
          .stage-back { page-break-after: auto; }
        }
      `}</style>

      <div className="no-print max-w-[297mm] mx-auto mb-4 flex flex-wrap gap-3">
        <Link href="/certificado" className="btn-outline text-sm bg-white">← Voltar</Link>
        <PrintButton />
        <p className="text-xs text-white/80 self-center">
          Imprimir: A4 • Paisagem • margens nenhuma • 2 páginas
        </p>
      </div>

      {/* FRENTE — modelo técnico paisagem */}
      <div className="stage mx-auto relative overflow-hidden bg-white shadow-2xl">
        <div className="absolute inset-0 flex">
          <aside className="w-[52mm] h-full bg-[#5b1320] text-white flex flex-col items-center py-6 px-3 relative">
            <Image src="/logo-bene-curati-v2.png" alt="" width={92} height={92} className="object-contain bg-white rounded-full p-1" />
            <p className="mt-4 text-center text-[10px] tracking-[0.25em] font-semibold uppercase">Bene Curati</p>
            <p className="text-center text-[10px] tracking-[0.25em] font-semibold uppercase">Cuidados</p>
            <div className="flex-1" />
            <p className="text-[9px] text-center leading-tight opacity-90 px-1">
              Nossa Paixão é Cuidar de Quem Você Ama!
            </p>
            <p className="mt-4 text-[8px] tracking-widest uppercase opacity-70">Institucional</p>
          </aside>

          <div className="flex-1 relative px-8 py-5 flex flex-col">
            <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-[#c9a227] to-transparent opacity-80" />
            <div className="absolute bottom-0 right-0 w-16 h-16 border-b-8 border-r-8 border-[#c9a227]" />

            <p className="text-[#5b1320] text-xs tracking-[0.35em] uppercase font-semibold">Bene Curati Cuidados</p>
            <h1 className="text-[42px] leading-none font-bold text-[#1a1a1a] mt-1">CERTIFICADO</h1>
            <p className="text-lg tracking-wide text-[#5b1320] font-semibold mt-1">
              CURSO PROFISSIONAL DE CUIDADOR
            </p>

            <div className="mt-4 inline-block bg-[#5b1320] text-white text-[11px] font-semibold tracking-widest px-3 py-1">
              CERTIFICAMOS QUE
            </div>

            <p className="mt-3 text-[28px] leading-tight font-bold text-[#5b1320]">
              {certificate.user.name}
            </p>
            {certificate.user.cpf && (
              <p className="text-xs text-gray-500 mt-1">CPF: {certificate.user.cpf}</p>
            )}

            <p className="mt-3 text-sm text-gray-700 leading-relaxed max-w-[210mm]">
              concluiu com aproveitamento o <strong>Curso Profissional de Cuidador</strong> —
              Formação em Home Care, Cuidados Domiciliares e Assistência ao Paciente,
              promovido pela Bene Curati Cuidados.
            </p>

            <div className="mt-4 grid grid-cols-3 gap-4 text-sm">
              <div className="border-l-4 border-[#5b1320] pl-3">
                <p className="text-[10px] uppercase tracking-wider text-gray-500">Carga horária</p>
                <p className="text-xl font-bold text-[#5b1320]">{totalHoras} horas</p>
              </div>
              <div className="border-l-4 border-[#c9a227] pl-3">
                <p className="text-[10px] uppercase tracking-wider text-gray-500">Início</p>
                <p className="font-semibold text-gray-800">{formatDate(started)}</p>
              </div>
              <div className="border-l-4 border-[#c9a227] pl-3">
                <p className="text-[10px] uppercase tracking-wider text-gray-500">Conclusão</p>
                <p className="font-semibold text-gray-800">{formatDate(certificate.issuedAt)}</p>
              </div>
            </div>

            <div className="mt-4 flex-1">
              <p className="text-[10px] uppercase tracking-widest text-[#5b1320] font-semibold mb-1">
                Eixos da formação
              </p>
              <div className="grid grid-cols-3 gap-x-4 text-[11px] text-gray-700">
                <ul className="space-y-0.5">
                  <li>Home Care e domicílio</li>
                  <li>Ética e humanização</li>
                  <li>Sinais vitais e biossegurança</li>
                </ul>
                <ul className="space-y-0.5">
                  <li>Higiene e mobilização</li>
                  <li>Enfermagem aplicada</li>
                  <li>Primeiros socorros</li>
                </ul>
                <ul className="space-y-0.5">
                  <li>Doenças crônicas</li>
                  <li>Cuidados paliativos</li>
                  <li>Legislação e excelência</li>
                </ul>
              </div>
            </div>

            <div className="mt-auto pt-3 flex items-end justify-between gap-4">
              <div className="flex items-end gap-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={qrSrc} alt="QR validação" width={78} height={78} className="border border-gray-200" />
                <div className="text-[10px] text-gray-600 leading-snug max-w-[46mm]">
                  <p className="font-semibold text-[#5b1320]">Certificado nº</p>
                  <p className="font-mono text-[11px]">{certificate.code}</p>
                  <p className="mt-1">Valide em /validar</p>
                </div>
              </div>
              <div className="text-center min-w-[72mm]">
                <Image
                  src="/assinatura-digital-diretor.jpg"
                  alt="Assinatura digital do diretor"
                  width={280}
                  height={70}
                  className="object-contain mx-auto mb-1"
                />
                <div className="border-t border-gray-800 pt-1">
                  <p className="font-bold text-sm tracking-wide">MARCELO RIOS</p>
                  <p className="text-[10px] uppercase text-gray-600">Diretor</p>
                  <p className="text-[10px] text-gray-500">Bene Curati Cuidados</p>
                </div>
              </div>
              <div className="text-right text-[10px] text-gray-500 leading-snug">
                <p>CNPJ 60.725.201/0001-88</p>
                <p>bene-curati-curso.vercel.app</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="h-6 no-print" />

      {/* VERSO */}
      <div className="stage stage-back mx-auto relative overflow-hidden bg-white shadow-2xl">
        <div className="h-3 bg-[#5b1320]" />
        <div className="px-8 py-5 h-[calc(210mm-12px)] flex flex-col">
          <div className="flex items-center justify-between border-b border-[#5b1320]/20 pb-3">
            <div className="flex items-center gap-3">
              <Image src="/logo-bene-curati-v2.png" alt="" width={44} height={44} className="object-contain" />
              <div>
                <p className="font-bold text-[#5b1320] text-sm">Bene Curati Cuidados</p>
                <p className="text-[10px] text-gray-500">CNPJ 60.725.201/0001-88</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-[10px] uppercase text-gray-400">Verso • Certificado nº</p>
              <p className="font-mono font-semibold text-[#5b1320]">{certificate.code}</p>
            </div>
          </div>

          <h2 className="text-center text-xl font-bold mt-3">CONTEÚDO PROGRAMÁTICO</h2>
          <p className="text-center text-xs text-gray-500 mb-3">
            Curso Profissional de Cuidador — {totalHoras} horas
          </p>

          <div className="grid grid-cols-3 gap-4 flex-1">
            {[colA, colB, colC].map((col, i) => (
              <table key={i} className="w-full text-[11px]">
                <thead>
                  <tr className="bg-[#5b1320] text-white">
                    <th className="text-left py-1 px-2 font-semibold">Módulo</th>
                    <th className="text-right py-1 px-2 w-10">H</th>
                  </tr>
                </thead>
                <tbody>
                  {col.map((m, idx) => (
                    <tr key={m.titulo} className={idx % 2 ? "bg-gray-50" : "bg-white"}>
                      <td className="py-1 px-2">{m.titulo}</td>
                      <td className="py-1 px-2 text-right font-medium">{m.horas}h</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ))}
          </div>

          <p className="text-right font-bold text-[#5b1320] mt-2">TOTAL: {totalHoras}h</p>
          <p className="text-[10px] text-gray-600 mt-2 leading-snug">
            Modalidade teórica e técnica em Home Care. Avaliação: prova final (mínimo 70%).
            Validação pública do código {certificate.code}. Aluno: {certificate.user.name} •
            Emitido em {formatDate(certificate.issuedAt)}.
          </p>
          <div className="mt-3 border-t border-gray-200 pt-2 text-[9px] text-gray-700 leading-snug uppercase">
            Embasamento legal: os cursos oferecidos pela Bene Curati Cuidados têm base legal
            constituída pelo Decreto Presidencial nº 5.154 e a metodologia segue as normas do MEC
            através da Resolução CNE nº 04/99.
          </div>
          <div className="mt-auto flex items-center justify-between text-[10px] text-gray-600 px-1 py-1">
            <span>bene-curati-curso.vercel.app</span>
            <span>CNPJ 60.725.201/0001-88</span>
          </div>
          <div className="h-3 bg-[#5b1320] -mx-8 text-center text-[9px] text-white leading-[12px] tracking-widest uppercase">
            Bene Curati Cuidados • Nossa Paixão é Cuidar de Quem Você Ama!
          </div>
        </div>
      </div>
    </div>
  )
}
