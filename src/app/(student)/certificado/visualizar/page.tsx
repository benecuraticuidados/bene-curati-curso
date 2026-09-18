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
    CONTEUDO_PROGRAMATICO.filter((m) => !m.titulo.startsWith("22.")).reduce((acc, m) => acc + m.horas, 0) ||
    HORAS_TEORICAS
  const horasPraticas = HORAS_PRATICAS
  const validateUrl = `https://app.benecurati.com.br/validar?codigo=${encodeURIComponent(certificate.code)}`
  const qrSrc = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(validateUrl)}`
  const started = certificate.user.createdAt
  const colA = CONTEUDO_PROGRAMATICO.slice(0, 8)
  const colB = CONTEUDO_PROGRAMATICO.slice(8, 16)
  const colC = CONTEUDO_PROGRAMATICO.slice(16)

  return (
    <div className="min-h-screen bg-[#3a0f16] py-6 px-3 print:bg-white print:p-0">
      <style>{`
        .stage { width: 297mm; height: 210mm; }
        .ribbon {
          background: #5b1320;
          color: white;
          clip-path: polygon(8px 0, calc(100% - 8px) 0, 100% 50%, calc(100% - 8px) 100%, 8px 100%, 0 50%);
        }
        .corner-tr {
          position: absolute; top: 0; right: 0; width: 110mm; height: 78mm;
          background: radial-gradient(circle at 100% 0, #5b1320 0 58mm, transparent 58mm);
        }
        .corner-tr:after {
          content: ""; position: absolute; inset: 0;
          background: radial-gradient(circle at 100% 0, transparent 48mm, #c9a227 48.2mm 54mm, transparent 54.2mm);
        }
        .corner-bl {
          position: absolute; bottom: 0; left: 0; width: 130mm; height: 52mm;
          background: radial-gradient(circle at 0 100%, #5b1320 0 48mm, transparent 48.2mm);
        }
        .corner-bl:after {
          content: ""; position: absolute; inset: 0;
          background: radial-gradient(circle at 0 100%, transparent 38mm, #c9a227 38.2mm 44mm, transparent 44.2mm);
        }
        @media print {
          @page { size: A4 landscape; margin: 0; }
          html, body { margin: 0 !important; background: white !important; }
          .no-print { display: none !important; }
          .stage {
            width: 297mm !important; height: 210mm !important;
            margin: 0 !important; box-shadow: none !important;
            page-break-after: always; break-after: page;
          }
          .stage-back { page-break-after: auto; }
        }
      `}</style>

      <div className="no-print max-w-[297mm] mx-auto mb-4 flex flex-wrap gap-3">
        <Link href="/certificado" className="btn-outline text-sm bg-white">Voltar</Link>
        <PrintButton />
        <p className="text-xs text-white/80 self-center">A4 paisagem • 2 páginas • Salvar PDF na impressão</p>
      </div>

      <div className="stage mx-auto relative overflow-hidden bg-white shadow-2xl">
        <div className="corner-tr" />
        <div className="corner-bl" />
        <div className="absolute right-[22mm] top-[58mm] w-[70mm] h-[70mm] opacity-[0.06]">
          <Image src="/logo-bene-curati-v2.png" alt="" width={260} height={260} className="object-contain" />
        </div>

        <div className="relative h-full px-8 pt-5 pb-4 flex flex-col">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="w-[17mm] h-[17mm] rounded-full border-[3px] border-[#5b1320] overflow-hidden bg-white flex items-center justify-center">
                <Image src="/logo-bene-curati-v2.png" alt="" width={60} height={60} className="object-contain" />
              </div>
              <div className="border-l-[3px] border-[#c9a227] pl-3">
                <p className="text-[20px] leading-[0.95] font-black text-[#1a1a1a]">BENE CURATI</p>
                <p className="text-[20px] leading-[0.95] font-black text-[#1a1a1a]">CUIDADOS</p>
                <p className="text-[8px] tracking-[0.18em] uppercase text-[#5b1320] font-semibold mt-1">
                  Nossa paixão é cuidar de quem você ama!
                </p>
              </div>
            </div>
            <div className="text-right pr-10 pt-1">
              <p className="text-[13px] italic text-[#5b1320] leading-tight">Cuidar</p>
              <p className="text-[13px] italic text-[#5b1320] leading-tight">e transformar</p>
              <p className="text-[13px] italic text-[#5b1320] leading-tight">vidas!</p>
              <div className="ml-auto mt-1 w-9 h-[2px] bg-[#5b1320]" />
            </div>
          </div>

          <div className="text-center mt-2">
            <h1 className="text-[34px] leading-none font-black text-[#5b1320] tracking-wide uppercase">
              Certificado de conclusão
            </h1>
            <div className="mx-auto mt-2 w-[175mm] ribbon py-[6px] text-center">
              <p className="text-[16px] font-black tracking-[0.14em] uppercase">
                Curso de Cuidador Profissional
              </p>
            </div>
            <p className="text-[12px] text-gray-600 mt-2">
              Formação em Home Care, Cuidados Domiciliares e Assistência ao Paciente
            </p>
          </div>

          <p className="text-center text-[13px] text-gray-600 mt-3">Certificamos que</p>
          <p
            className="text-center text-[34px] leading-tight text-[#1a1a1a]"
            style={{ fontFamily: "Georgia, 'Times New Roman', serif", fontStyle: "italic" }}
          >
            {certificate.user.name}
          </p>
          <div className="mx-auto mt-1 h-[1.5px] w-[72%] bg-[#c9a227]" />
          {certificate.user.cpf ? (
            <p className="text-center text-[11px] text-gray-500 mt-1">CPF: {certificate.user.cpf}</p>
          ) : null}
          <p className="text-center text-[13px] text-gray-700 mt-2 max-w-[230mm] mx-auto leading-snug">
            concluiu com aproveitamento o Curso de Cuidador Profissional — Formação em Home Care,
            Cuidados Domiciliares e Assistência ao Paciente, promovido pela Bene Curati Cuidados.
          </p>

          <div className="mt-3 grid grid-cols-5 gap-2 px-1">
            {[
              ["Carga horária", `${totalHoras} horas`, `${horasTeoricas}h + ${horasPraticas}h`],
              ["Modalidade", "EAD", "Teórica e prática"],
              ["Início", formatDate(started), ""],
              ["Conclusão", formatDate(certificate.issuedAt), ""],
              ["CNPJ", "60.725.201/0001-88", ""],
            ].map(([label, value, hint]) => (
              <div key={label} className="flex items-center gap-2 border-r last:border-0 border-[#5b1320]/15 pr-2">
                <span className="w-8 h-8 rounded-full bg-[#5b1320] shrink-0" />
                <div>
                  <p className="text-[8px] uppercase tracking-wider text-[#5b1320] font-bold">{label}</p>
                  <p className="text-[12px] font-extrabold text-[#1a1a1a] leading-tight">{value}</p>
                  {hint ? <p className="text-[8px] text-gray-500">{hint}</p> : null}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-3 grid grid-cols-[1.2fr_0.75fr_0.55fr_0.9fr] gap-3 items-end flex-1">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-[#5b1320] mb-1">Eixos da formação</p>
              <div className="grid grid-cols-2 text-[11px] text-gray-700 leading-5">
                <ul>
                  <li>Home Care e domicílio</li>
                  <li>Ética e humanização</li>
                  <li>Sinais vitais e biossegurança</li>
                  <li>Higiene e mobilização</li>
                  <li>Enfermagem aplicada</li>
                </ul>
                <ul>
                  <li>Primeiros socorros</li>
                  <li>Doenças crônicas</li>
                  <li>Cuidados paliativos</li>
                  <li>Legislação e excelência</li>
                  <li>Manejo prático obrigatório</li>
                </ul>
              </div>
            </div>
            <div className="text-center">
              <Image src="/assinatura-digital-diretor.jpg" alt="" width={190} height={50} className="object-contain mx-auto" />
              <div className="border-t border-gray-500 w-36 mx-auto pt-1">
                <p className="font-bold text-[13px]">Marcelo Rios</p>
                <p className="text-[10px] text-gray-600">Diretor</p>
                <p className="text-[9px] text-gray-500">Bene Curati Cuidados</p>
              </div>
            </div>
            <div className="flex justify-center">
              <div className="w-[26mm] h-[26mm] rounded-full border-[5px] border-[#c9a227] bg-[#5b1320] text-white flex flex-col items-center justify-center text-center px-1">
                <Image src="/logo-bene-curati-v2.png" alt="" width={26} height={26} className="object-contain rounded-full bg-white" />
                <p className="text-[6px] font-bold uppercase leading-tight mt-1">Certificado de conclusão</p>
              </div>
            </div>
            <div className="flex justify-end">
              <div className="flex overflow-hidden rounded-md">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={qrSrc} alt="QR" width={80} height={80} className="bg-white border border-gray-200" />
                <div className="bg-[#5b1320] text-white w-[36mm] px-2 flex flex-col justify-center">
                  <p className="text-[8px] uppercase font-semibold">Acesse a plataforma</p>
                  <p className="text-[11px] font-bold leading-tight">app.benecurati.com.br</p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-2 flex items-end justify-between text-[10px]">
            <div>
              <p className="font-bold uppercase tracking-wide text-[#5b1320]">Certificado verificável digitalmente</p>
              <p className="text-gray-800">
                Código: <span className="font-mono font-semibold">{certificate.code}</span>
              </p>
            </div>
            <div className="text-right text-[#5b1320]">
              <p className="font-black">BENE CURATI CUIDADOS</p>
              <p className="text-[8px] uppercase tracking-wide">Nossa paixão é cuidar de quem você ama!</p>
            </div>
          </div>
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
              <p className="text-[10px] uppercase text-gray-400">Verso • Certificado n</p>
              <p className="font-mono font-semibold text-[#5b1320]">{certificate.code}</p>
              <p className="text-[10px] text-gray-500">{certificate.user.name}</p>
            </div>
          </div>

          <h2 className="text-center text-xl font-bold mt-2">CONTEÚDO PROGRAMÁTICO</h2>
          <p className="text-center text-xs text-gray-500 mb-2">
            Curso de Cuidador Profissional — {cargaHorariaTexto()}
          </p>

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
              <p className="font-bold text-[#5b1320] uppercase">Como validar</p>
              <p className="text-gray-700 mt-1">
                QR da frente ou app.benecurati.com.br/validar com o codigo{" "}
                <span className="font-mono font-semibold">{certificate.code}</span>.
              </p>
            </div>
            <div className="border border-[#5b1320]/15 rounded-md p-2">
              <p className="font-bold text-[#5b1320] uppercase">Carga e avaliação</p>
              <p className="text-gray-700 mt-1">
                {totalHoras}h ({horasTeoricas}h teóricas + {horasPraticas}h práticas). Modalidade EAD. Prova 70%.
                Práticas: {AULAS_PRATICAS.join("; ")}.
              </p>
            </div>
            <div className="border border-[#5b1320]/15 rounded-md p-2">
              <p className="font-bold text-[#5b1320] uppercase">Natureza da formação</p>
              <p className="text-gray-700 mt-1">
                Comprova a formação. Não estabelece vínculo de emprego com a Bene Curati Cuidados.
              </p>
            </div>
          </div>

          <p className="text-right font-bold text-[#5b1320] mt-2 text-sm">
            TOTAL: {totalHoras}h ({horasTeoricas}h teóricas + {horasPraticas}h práticas)
          </p>
          <div className="mt-2 border-t border-gray-200 pt-2 text-[9px] text-gray-700 leading-snug uppercase">
            Embasamento legal: Decreto Presidencial nº 5.154 e Resolução CNE nº 04/99 do MEC.
            CNPJ 60.725.201/0001-88.
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
