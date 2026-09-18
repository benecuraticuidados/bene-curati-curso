import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import Image from "next/image"
import Link from "next/link"
import { formatDate } from "@/lib/utils"
import PrintButton from "@/components/PrintButton"
import { canReleaseCertificate } from "@/lib/certificate-guard"
import { HORAS_PRATICAS, HORAS_TEORICAS, HORAS_TOTAL, cargaHorariaTexto } from "@/lib/workload"

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
  { titulo: "22. Manejo prático obrigatório", horas: 6 },
]

const AULAS_PRATICAS = [
  "Transferência para a cadeira",
  "Trocar lençol com acamados",
  "Vestir roupas em acamados",
  "Mudança de decúbito",
  "Higiene íntima e troca de fralda",
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
    HORAS_TOTAL
  const horasTeoricas =
    CONTEUDO_PROGRAMATICO.filter((m) => !m.titulo.startsWith("22.")).reduce(
      (acc, m) => acc + m.horas,
      0
    ) || HORAS_TEORICAS
  const horasPraticas = HORAS_PRATICAS
  const validateUrl = `https://app.benecurati.com.br/validar?codigo=${encodeURIComponent(certificate.code)}`
  const qrSrc = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(validateUrl)}`
  const started = certificate.user.createdAt

  const colA = CONTEUDO_PROGRAMATICO.slice(0, 8)
  const colB = CONTEUDO_PROGRAMATICO.slice(8, 16)
  const colC = CONTEUDO_PROGRAMATICO.slice(16)

  const boxes = [
    { label: "Carga horária", value: `${totalHoras} horas`, hint: `${horasTeoricas}h + ${horasPraticas}h prática` },
    { label: "Modalidade", value: "Online", hint: "Teórica e prática" },
    { label: "Início", value: formatDate(started), hint: "" },
    { label: "Conclusão", value: formatDate(certificate.issuedAt), hint: "" },
    { label: "CNPJ", value: "60.725.201/0001-88", hint: "" },
  ]

  return (
    <div className="min-h-screen bg-[#3a0f16] py-6 px-3 print:bg-white print:p-0">
      <style>{`
        .stage { width: 297mm; height: 210mm; }
        .gold { color: #c9a227; }
        .wine { color: #5b1320; }
        .frame {
          position: absolute; inset: 4mm;
          border: 1.5px solid #c9a227;
          pointer-events: none;
        }
        .frame-inner {
          position: absolute; inset: 6mm;
          border: 0.6px solid #5b1320;
          opacity: 0.35;
          pointer-events: none;
        }
        .ornament-tr {
          position: absolute; top: -4mm; right: -6mm;
          width: 118mm; height: 118mm;
          background:
            radial-gradient(circle at 100% 0%, #5b1320 0 72mm, transparent 72.2mm),
            radial-gradient(circle at 100% 0%, transparent 62mm, #c9a227 62.2mm 68mm, transparent 68.2mm);
        }
        .ornament-bl {
          position: absolute; bottom: -18mm; left: -22mm;
          width: 150mm; height: 88mm;
          background:
            radial-gradient(circle at 0% 100%, #5b1320 0 68mm, transparent 68.2mm),
            radial-gradient(circle at 0% 100%, transparent 58mm, #c9a227 58.2mm 64mm, transparent 64.2mm);
        }
        .watermark {
          position: absolute; right: 22mm; top: 42mm;
          width: 95mm; height: 95mm; opacity: 0.07;
        }
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
          Imprimir: A4 • Paisagem • margens nenhuma • frente e verso
        </p>
      </div>

      <div className="stage mx-auto relative overflow-hidden bg-white shadow-2xl">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/certificado-frente-modelo.png" alt="" className="absolute inset-0 w-full h-full object-cover" />

        <div className="absolute left-[16%] right-[16%] top-[31.6%] h-[6.2%] bg-[#5b1320] flex items-center justify-center">
          <p className="text-white text-[13px] font-bold tracking-[0.18em] uppercase">
            Curso de Cuidador Profissional
          </p>
        </div>

        <div className="absolute left-[12%] right-[12%] top-[43.2%] h-[8.5%] flex items-center justify-center bg-white/92">
          <p className="text-[32px] leading-none text-[#1a1a1a] text-center px-2" style={{ fontFamily: "Georgia, 'Times New Roman', serif", fontStyle: "italic" }}>
            {certificate.user.name}
          </p>
        </div>

        <div className="absolute left-[8.5%] top-[57.8%] w-[14%] h-[6.5%] flex flex-col justify-center bg-white">
          <p className="text-[11px] font-extrabold text-[#1a1a1a] leading-tight">{totalHoras} horas</p>
          <p className="text-[7px] text-gray-500">{horasTeoricas}h + {horasPraticas}h prática</p>
        </div>
        <div className="absolute left-[40.2%] top-[57.8%] w-[11%] h-[6.5%] flex items-center bg-white">
          <p className="text-[12px] font-extrabold text-[#1a1a1a]">{formatDate(started)}</p>
        </div>
        <div className="absolute left-[56.5%] top-[57.8%] w-[11%] h-[6.5%] flex items-center bg-white">
          <p className="text-[12px] font-extrabold text-[#1a1a1a]">{formatDate(certificate.issuedAt)}</p>
        </div>
        <div className="absolute left-[73%] top-[56.6%] w-[19%] h-[8%] flex flex-col justify-center bg-[#f6efe8] rounded-sm px-2">
          <p className="text-[8px] uppercase tracking-wider text-[#5b1320] font-bold">CNPJ</p>
          <p className="text-[11px] font-extrabold text-[#1a1a1a] leading-tight">60.725.201/0001-88</p>
        </div>

        <div className="absolute left-[8.5%] bottom-[6.2%] bg-[#5b1320] text-white px-2 py-1 rounded-sm">
          <p className="text-[8px] uppercase tracking-wide font-semibold">Certificado verificável digitalmente</p>
          <p className="text-[11px] font-mono font-bold">Código: {certificate.code}</p>
        </div>

        <div className="absolute left-[18%] right-[18%] bottom-[11.5%] text-center bg-white/85 py-0.5">
          <p className="text-[8px] uppercase tracking-wide text-gray-700">
            Embasamento legal: Decreto Presidencial nº 5.154 e Resolução CNE nº 04/99 do MEC.
          </p>
        </div>
      </div>

      <div className="h-6 no-print" />

      <div className="stage stage-back mx-auto relative overflow-hidden bg-white shadow-2xl">
        <div className="h-3 bg-[#5b1320]" />
        <div className="px-8 py-4 h-[calc(210mm-12px)] flex flex-col">
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
              <p className="text-[10px] text-gray-500">{certificate.user.name}</p>
            </div>
          </div>

          <h2 className="text-center text-xl font-bold mt-2">CONTEÚDO PROGRAMÁTICO</h2>
          <p className="text-center text-xs text-gray-500 mb-2">{cargaHorariaTexto()}</p>

          <div className="grid grid-cols-3 gap-3 flex-1">
            {[colA, colB, colC].map((col, i) => (
              <table key={i} className="w-full text-[10.5px]">
                <thead>
                  <tr className="bg-[#5b1320] text-white">
                    <th className="text-left py-1 px-2 font-semibold">Módulo</th>
                    <th className="text-right py-1 px-2 w-10">H</th>
                  </tr>
                </thead>
                <tbody>
                  {col.map((m, idx) => (
                    <tr key={m.titulo} className={idx % 2 ? "bg-[#f8f1f3]" : "bg-white"}>
                      <td className="py-1 px-2">{m.titulo}</td>
                      <td className="py-1 px-2 text-right font-medium">{m.horas}h</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ))}
          </div>

          <div className="mt-2 grid grid-cols-3 gap-3 text-[10px]">
            <div className="border border-[#5b1320]/15 rounded-md p-2">
              <p className="font-bold text-[#5b1320] uppercase tracking-wide">Como validar</p>
              <p className="text-gray-700 mt-1">
                Leia o QR da frente ou acesse app.benecurati.com.br/validar com o código{" "}
                <span className="font-mono font-semibold">{certificate.code}</span>.
              </p>
            </div>
            <div className="border border-[#5b1320]/15 rounded-md p-2">
              <p className="font-bold text-[#5b1320] uppercase tracking-wide">Carga e avaliação</p>
              <p className="text-gray-700 mt-1">
                {totalHoras}h ({horasTeoricas}h teóricas + {horasPraticas}h práticas). Prova 70%.
                Práticas: {AULAS_PRATICAS.join("; ")}.
              </p>
            </div>
            <div className="border border-[#5b1320]/15 rounded-md p-2">
              <p className="font-bold text-[#5b1320] uppercase tracking-wide">Natureza da formação</p>
              <p className="text-gray-700 mt-1">
                Comprova a formação. Não estabelece vínculo de emprego com a Bene Curati Cuidados.
              </p>
            </div>
          </div>

          <p className="text-right font-bold text-[#5b1320] mt-2 text-sm">
            TOTAL: {totalHoras}h ({horasTeoricas}h teóricas + {horasPraticas}h práticas)
          </p>
          <div className="mt-2 border-t border-gray-200 pt-2 text-[9px] text-gray-700 leading-snug uppercase">
            Embasamento legal: os cursos oferecidos pela Bene Curati Cuidados têm base legal
            constituída pelo Decreto Presidencial nº 5.154 e a metodologia segue as normas do MEC
            através da Resolução CNE nº 04/99. CNPJ 60.725.201/0001-88.
          </div>
          <div className="mt-auto flex items-center justify-between text-[10px] text-gray-600 px-1 py-1">
            <span>app.benecurati.com.br/validar</span>
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
