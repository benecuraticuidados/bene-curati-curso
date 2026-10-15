import { PDFDocument, rgb, StandardFonts } from "pdf-lib"
import fs from "fs/promises"
import path from "path"
import QRCode from "qrcode"

export const CERTIFICATE_TEMPLATE_VERSION = "v1"

const CREAM = rgb(0.992, 0.976, 0.965)
const INK = rgb(0.12, 0.12, 0.12)

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

function fit(text: string, font: any, max: number, start: number, min: number) {
  let size = start
  while (font.widthOfTextAtSize(text, size) > max && size > min) size -= 0.5
  return size
}

export async function fillMasterCertificate(params: {
  name: string
  startedAt: Date | string
  issuedAt: Date | string
  code: string
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

  cover(front, 110, 210, 622, 42, pageH)
  const nameSize = fit(name, font, 610, 32, 16)
  const nameW = font.widthOfTextAtSize(name, nameSize)
  front.drawText(name, {
    x: 421 - nameW / 2,
    y: pageH - 246,
    size: nameSize,
    font,
    color: INK,
  })

  cover(front, 350, 318, 88, 18, pageH)
  cover(front, 496, 318, 88, 18, pageH)
  front.drawText(start, { x: 352.9, y: pageH - 334, size: 13, font: fontBold, color: INK })
  front.drawText(end, { x: 498.9, y: pageH - 334, size: 13, font: fontBold, color: INK })

  cover(front, 696, 562, 92, 14, pageH)
  front.drawText(code, { x: 698, y: pageH - 574, size: 9, font: fontReg, color: INK })

  const qrUrl = `https://app.benecurati.com.br/validar?codigo=${encodeURIComponent(code)}`
  const qrPng = await QRCode.toBuffer(qrUrl, {
    type: "png",
    margin: 1,
    width: 280,
    errorCorrectionLevel: "M",
    color: { dark: "#1a1a1a", light: "#FFFFFF" },
  })
  const qrImg = await pdf.embedPng(qrPng)
  const qrX = 557
  const qrSize = 74
  const qrY = pageH - 428 - qrSize
  front.drawRectangle({ x: qrX - 2, y: qrY - 2, width: qrSize + 4, height: qrSize + 4, color: rgb(1, 1, 1) })
  front.drawImage(qrImg, { x: qrX, y: qrY, width: qrSize, height: qrSize })

  cover(back, 628, 42, 176, 22, pageH)
  const codeW = fontBold.widthOfTextAtSize(code, 14)
  back.drawText(code, { x: 802 - codeW, y: pageH - 60, size: 14, font: fontBold, color: rgb(0.36, 0.07, 0.13) })

  cover(back, 632, 64, 172, 13, pageH)
  const backNameSize = fit(name, fontReg, 168, 8, 6)
  const backNameW = fontReg.widthOfTextAtSize(name, backNameSize)
  back.drawText(name, { x: 802 - backNameW, y: pageH - 74, size: backNameSize, font: fontReg, color: rgb(0.35, 0.35, 0.35) })

  cover(back, 90, 482, 90, 13, pageH)
  back.drawText(code, { x: 91, y: pageH - 493, size: 8, font: fontReg, color: rgb(0.2, 0.2, 0.2) })

  if (params.courseTitle) {
    cover(front, 150, 132, 540, 22, pageH)
    const titleSize = fit(params.courseTitle, fontBold, 520, 13, 9)
    const titleW = fontBold.widthOfTextAtSize(params.courseTitle, titleSize)
    front.drawText(params.courseTitle, {
      x: 421 - titleW / 2,
      y: pageH - 148,
      size: titleSize,
      font: fontBold,
      color: rgb(0.36, 0.07, 0.13),
    })
  }

  if (params.courseSubtitle) {
    cover(front, 140, 154, 560, 16, pageH)
    const subSize = fit(params.courseSubtitle, fontReg, 540, 9, 7)
    const subW = fontReg.widthOfTextAtSize(params.courseSubtitle, subSize)
    front.drawText(params.courseSubtitle, {
      x: 421 - subW / 2,
      y: pageH - 166,
      size: subSize,
      font: fontReg,
      color: INK,
    })
  }

  if (params.courseLine) {
    cover(front, 90, 252, 660, 28, pageH)
    const lineSize = fit(params.courseLine, fontReg, 640, 9, 7)
    const lineW = fontReg.widthOfTextAtSize(params.courseLine, lineSize)
    front.drawText(params.courseLine, {
      x: 421 - lineW / 2,
      y: pageH - 270,
      size: lineSize,
      font: fontReg,
      color: INK,
    })
  }

  if (params.hoursMain) {
    cover(front, 48, 300, 90, 28, pageH)
    front.drawText(params.hoursMain, { x: 52, y: pageH - 312, size: 9, font: fontBold, color: INK })
    if (params.hoursSub) front.drawText(params.hoursSub, { x: 52, y: pageH - 324, size: 8, font: fontReg, color: INK })
  }

  if (params.eixos?.length) {
    cover(front, 70, 355, 470, 95, pageH)
    params.eixos.forEach((item, i) => {
      const col = i < 5 ? 0 : 1
      const row = i % 5
      front.drawText(item, {
        x: 90 + col * 220,
        y: pageH - 372 - row * 16,
        size: 8,
        font: fontReg,
        color: INK,
      })
    })
  }

  if (params.aulas?.length) {
    cover(back, 36, 92, 770, 360, pageH)
    params.aulas.forEach((item, i) => {
      const col = Math.floor(i / 9)
      const row = i % 9
      back.drawText(item, {
        x: 48 + col * 250,
        y: pageH - 112 - row * 16,
        size: 8,
        font: fontReg,
        color: INK,
      })
    })
  }

  if (params.carga) {
    cover(back, 300, 455, 230, 48, pageH)
    const lines = params.carga.match(/.{1,42}(\s|$)/g) || [params.carga]
    lines.slice(0, 3).forEach((line, i) => {
      back.drawText(line.trim(), { x: 308, y: pageH - 468 - i * 11, size: 7, font: fontReg, color: INK })
    })
  }

  if (params.total) {
    cover(back, 520, 548, 280, 14, pageH)
    back.drawText(params.total, { x: 528, y: pageH - 558, size: 8, font: fontBold, color: INK })
  }

  return pdf.save()
}
