import { PDFDocument, rgb, StandardFonts } from "pdf-lib"
import fs from "fs/promises"
import path from "path"
import QRCode from "qrcode"

export const CERTIFICATE_TEMPLATE_VERSION = "v10"

const INK = rgb(38 / 255, 42 / 255, 53 / 255)
const WHITE = rgb(1, 1, 1)

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
  const font = await pdf.embedFont(StandardFonts.TimesRomanBold)
  const fontBold = await pdf.embedFont(StandardFonts.HelveticaBold)
  const front = pdf.getPage(0)
  const back = pdf.getPage(1)
  const pageH = front.getHeight()
  const name = params.name.trim().toUpperCase()
  const start = fmt(params.startedAt)
  const end = fmt(params.issuedAt)
  const code = params.code

  // nome
  front.drawRectangle({ x: 80, y: pageH - 250, width: 680, height: 40, color: WHITE })
  let size = 26
  while (font.widthOfTextAtSize(name, size) > 640 && size > 12) size -= 1
  const w = font.widthOfTextAtSize(name, size)
  front.drawText(name, { x: 421 - w / 2, y: pageH - 240, size, font, color: INK })

  // datas
  front.drawRectangle({ x: 300, y: pageH - 340, width: 90, height: 16, color: WHITE })
  front.drawRectangle({ x: 450, y: pageH - 340, width: 90, height: 16, color: WHITE })
  front.drawText(start, { x: 305, y: pageH - 336, size: 11, font: fontBold, color: INK })
  front.drawText(end, { x: 455, y: pageH - 336, size: 11, font: fontBold, color: INK })

  // código na frente
  front.drawRectangle({ x: 560, y: 18, width: 220, height: 14, color: WHITE })
  front.drawText("Código: " + code, { x: 780 - fontBold.widthOfTextAtSize("Código: " + code, 9), y: 22, size: 9, font: fontBold, color: INK })

  // QR
  const qrPng = await QRCode.toBuffer("https://app.benecurati.com.br/validar?codigo=" + encodeURIComponent(code), {
    type: "png", margin: 1, width: 280, errorCorrectionLevel: "M",
    color: { dark: "#1a1a1a", light: "#FFFFFF" },
  })
  front.drawImage(await pdf.embedPng(qrPng), { x: 565, y: 53, width: 52, height: 52 })

  // verso: código e nome
  back.drawRectangle({ x: 500, y: pageH - 70, width: 300, height: 36, color: WHITE })
  back.drawText(code, { x: 800 - fontBold.widthOfTextAtSize(code, 14), y: pageH - 56, size: 14, font: fontBold, color: INK })
  back.drawText(name, { x: 800 - fontBold.widthOfTextAtSize(name, 8), y: pageH - 70, size: 8, font: fontBold, color: INK })

  return pdf.save()
      }
    
