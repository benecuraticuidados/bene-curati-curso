import { PDFDocument, rgb, StandardFonts } from "pdf-lib"
import fs from "fs/promises"
import path from "path"
import QRCode from "qrcode"

export const CERTIFICATE_TEMPLATE_VERSION = "v9"

const BURG = rgb(91 / 255, 19 / 255, 32 / 255)
const INK = rgb(38 / 255, 42 / 255, 53 / 255)
const GREY = rgb(87 / 255, 93 / 255, 107 / 255)
const WHITE = rgb(1, 1, 1)
const CREAM = rgb(0.996, 0.984, 0.973)

const SOCORROS_ID = "curso-socorros-01"

function fmt(d: Date | string) {
  const dt = typeof d === "string" ? new Date(d) : d
  return dt.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" })
}

async function fillTemplate(templateName: string, params: { name: string; startedAt: Date | string; issuedAt: Date | string; code: string }) {
  const templatePath = path.join(process.cwd(), "public", "templates", templateName)
  const bytes = await fs.readFile(templatePath)
  const pdf = await PDFDocument.load(bytes)
  const font = await pdf.embedFont(StandardFonts.TimesRomanBold)
  const fontReg = await pdf.embedFont(StandardFonts.Helvetica)
  const fontBold = await pdf.embedFont(StandardFonts.HelveticaBold)
  const front = pdf.getPage(0)
  const back = pdf.getPage(1)
  const pageH = front.getHeight()
  const name = params.name.trim().toUpperCase()
  const start = fmt(params.startedAt)
  const end = fmt(params.issuedAt)
  const code = params.code

  front.drawRectangle({ x: 110, y: pageH - 252, width: 622, height: 42, color: CREAM })
  let nameSize = 28
  while (font.widthOfTextAtSize(name, nameSize) > 600 && nameSize > 14) nameSize -= 1
  const nameW = font.widthOfTextAtSize(name, nameSize)
  front.drawText(name, { x: 421 - nameW / 2, y: pageH - 246, size: nameSize, font, color: INK })

  front.drawRectangle({ x: 350, y: pageH - 336, width: 88, height: 18, color: CREAM })
  front.drawRectangle({ x: 496, y: pageH - 336, width: 88, height: 18, color: CREAM })
  front.drawText(start, { x: 352.9, y: pageH - 334, size: 13, font: fontBold, color: INK })
  front.drawText(end, { x: 498.9, y: pageH - 334, size: 13, font: fontBold, color: INK })

  front.drawRectangle({ x: 620, y: pageH - 576, width: 170, height: 16, color: CREAM })
  front.drawText(code, { x: 698, y: pageH - 574, size: 9, font: fontReg, color: INK })

  const qrPng = await QRCode.toBuffer("https://app.benecurati.com.br/validar?codigo=" + encodeURIComponent(code), {
    type: "png", margin: 1, width: 280, errorCorrectionLevel: "M",
    color: { dark: "#1a1a1a", light: "#FFFFFF" },
  })
  const qrImg = await pdf.embedPng(qrPng)
  front.drawRectangle({ x: 555, y: pageH - 504, width: 78, height: 78, color: WHITE })
  front.drawImage(qrImg, { x: 557, y: pageH - 502, width: 74, height: 74 })

  back.drawRectangle({ x: 628, y: pageH - 64, width: 176, height: 22, color: WHITE })
  back.drawText(code, { x: 802 - fontBold.widthOfTextAtSize(code, 14), y: pageH - 60, size: 14, font: fontBold, color: BURG })
  back.drawRectangle({ x: 632, y: pageH - 77, width: 172, height: 13, color: WHITE })
  back.drawText(name, { x: 802 - fontReg.widthOfTextAtSize(name, 8), y: pageH - 74, size: 8, font: fontReg, color: GREY })

  return pdf.save()
}

export async function fillMasterCertificate(params: {
  name: string
  startedAt: Date | string
  issuedAt: Date | string
  code: string
  courseId?: string
  courseTitle?: string
  courseSubtitle?: string
  courseLine?: string
  hoursMain?: string
  hoursSub?: string
  eixos?: string[]
  aulas?: string[]
  carga?: string
  total?: string
}) {
  const isSocorros = params.courseId === SOCORROS_ID || Boolean(params.courseTitle)
  const template = isSocorros ? "certificado-matriz-socorros.pdf" : "certificado-matriz-cuidador.pdf"
  return fillTemplate(template, params)
}
