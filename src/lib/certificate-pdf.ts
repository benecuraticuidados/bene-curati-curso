import { PDFDocument, rgb, StandardFonts } from "pdf-lib"
import fs from "fs/promises"
import path from "path"

export const CERTIFICATE_TEMPLATE_VERSION = "v1"

const CREAM = rgb(0.992, 0.976, 0.965)

function cover(page: any, x: number, yTop: number, w: number, h: number, pageH: number) {
  page.drawRectangle({
    x,
    y: pageH - yTop - h,
    width: w,
    height: h,
    color: CREAM,
  })
}

function fmt(d: Date | string) {
  const dt = typeof d === "string" ? new Date(d) : d
  return dt.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" })
}

export async function fillMasterCertificate(params: {
  name: string
  startedAt: Date | string
  issuedAt: Date | string
  code: string
}) {
  const templatePath = path.join(process.cwd(), "public", "templates", "certificado-mestre-v1.pdf")
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

  // Frente: nome (modelo 114–728, top 212)
  cover(front, 110, 210, 622, 42, pageH)
  let nameSize = 32
  let nameW = font.widthOfTextAtSize(name, nameSize)
  while (nameW > 610 && nameSize > 16) {
    nameSize -= 1
    nameW = font.widthOfTextAtSize(name, nameSize)
  }
  front.drawText(name, {
    x: 421 - nameW / 2,
    y: pageH - 246,
    size: nameSize,
    font,
    color: rgb(0.12, 0.12, 0.12),
  })

  // Datas
  cover(front, 350, 318, 88, 18, pageH)
  cover(front, 496, 318, 88, 18, pageH)
  front.drawText(start, { x: 352.9, y: pageH - 334, size: 13, font: fontBold, color: rgb(0.12, 0.12, 0.12) })
  front.drawText(end, { x: 498.9, y: pageH - 334, size: 13, font: fontBold, color: rgb(0.12, 0.12, 0.12) })

  // Código frente
  cover(front, 696, 562, 92, 14, pageH)
  front.drawText(code, { x: 698, y: pageH - 574, size: 9, font: fontReg, color: rgb(0.12, 0.12, 0.12) })

  // Verso: código cabeçalho
  cover(back, 628, 42, 176, 22, pageH)
  const codeW = fontBold.widthOfTextAtSize(code, 14)
  back.drawText(code, {
    x: 802 - codeW,
    y: pageH - 60,
    size: 14,
    font: fontBold,
    color: rgb(0.36, 0.07, 0.13),
  })

  // Verso: nome
  cover(back, 632, 64, 172, 13, pageH)
  let backNameSize = 8
  let backNameW = fontReg.widthOfTextAtSize(name, backNameSize)
  while (backNameW > 168 && backNameSize > 6) {
    backNameSize -= 0.5
    backNameW = fontReg.widthOfTextAtSize(name, backNameSize)
  }
  back.drawText(name, {
    x: 802 - backNameW,
    y: pageH - 74,
    size: backNameSize,
    font: fontReg,
    color: rgb(0.35, 0.35, 0.35),
  })

  // Verso: código no bloco "como validar"
  cover(back, 90, 482, 90, 13, pageH)
  back.drawText(code, { x: 91, y: pageH - 493, size: 8, font: fontReg, color: rgb(0.2, 0.2, 0.2) })

  return pdf.save()
}
