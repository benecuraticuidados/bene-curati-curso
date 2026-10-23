import { PDFDocument, rgb, StandardFonts } from "pdf-lib"
import fs from "fs/promises"
import path from "path"
import QRCode from "qrcode"

export const CERTIFICATE_TEMPLATE_VERSION = "v11"

const INK = rgb(38 / 255, 42 / 255, 53 / 255)
const BURG = rgb(91 / 255, 19 / 255, 32 / 255)
const GREY = rgb(87 / 255, 93 / 255, 107 / 255)

const SOCORROS_ID = "curso-socorros-01"

function fmt(d: Date | string) {
  const dt = typeof d === "string" ? new Date(d) : d
  return dt.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" })
}

async function loadTemplate(name: string) {
  const candidates = [
    path.join(process.cwd(), "public", "templates", name),
    path.join(process.cwd(), "templates", name),
    path.join("/var/task", "public", "templates", name),
  ]
  for (const p of candidates) {
    try {
      const bytes = await fs.readFile(p)
      if (bytes.length > 100000) return bytes
    } catch {}
  }
  throw new Error("Matriz não encontrada: " + name)
}

export async function fillMasterCertificate(params: {
  name: string
  startedAt: Date | string
  issuedAt: Date | string
  code: string
  courseId?: string
  courseTitle?: string
}) {
  const isSocorros = params.courseId === SOCORROS_ID
  const template = isSocorros ? "certificado-matriz-socorros.pdf" : "certificado-matriz-cuidador.pdf"
  const bytes = await loadTemplate(template)
  const pdf = await PDFDocument.load(bytes)
  const nameFont = await pdf.embedFont(StandardFonts.TimesRomanItalic)
  const bold = await pdf.embedFont(StandardFonts.HelveticaBold)
  const front = pdf.getPage(0)
  const back = pdf.getPage(1)
  const name = params.name.trim().toUpperCase()
  const start = fmt(params.startedAt)
  const end = fmt(params.issuedAt)
  const code = params.code

  // nome — área já vazia na matriz
  let size = 32
  while (nameFont.widthOfTextAtSize(name, size) > 620 && size > 14) size -= 1
  const nameW = nameFont.widthOfTextAtSize(name, size)
  front.drawText(name, { x: 421 - nameW / 2, y: 348, size, font: nameFont, color: INK })

  // datas — área já vazia na matriz
  front.drawText(start, { x: 372, y: 258, size: 12, font: bold, color: INK })
  front.drawText(end, { x: 518, y: 258, size: 12, font: bold, color: INK })

  // código na frente — área já vazia
  const codeLabel = "Código: " + code
  front.drawText(codeLabel, {
    x: 786 - bold.widthOfTextAtSize(codeLabel, 10),
    y: 20,
    size: 10,
    font: bold,
    color: INK,
  })

  // QR no espaço branco já reservado
  const qrPng = await QRCode.toBuffer(
    "https://app.benecurati.com.br/validar?codigo=" + encodeURIComponent(code),
    { type: "png", margin: 1, width: 280, errorCorrectionLevel: "M", color: { dark: "#1a1a1a", light: "#FFFFFF" } }
  )
  front.drawImage(await pdf.embedPng(qrPng), { x: 565, y: 53, width: 58, height: 58 })

  // verso — áreas já vazias
  const codeW = bold.widthOfTextAtSize(code, 16)
  back.drawText(code, { x: 802 - codeW, y: 539, size: 16, font: bold, color: BURG })
  const backNameW = bold.widthOfTextAtSize(name, 9)
  back.drawText(name, { x: 802 - backNameW, y: 523, size: 9, font: bold, color: GREY })

  return pdf.save()
}
