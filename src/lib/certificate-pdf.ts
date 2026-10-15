import { PDFDocument, rgb, StandardFonts } from "pdf-lib"
import fs from "fs/promises"
import path from "path"
import QRCode from "qrcode"

export const CERTIFICATE_TEMPLATE_VERSION = "v2"

const CREAM = rgb(0.992, 0.976, 0.965)
const INK = rgb(0.12, 0.12, 0.12)
const WINE = rgb(0.36, 0.07, 0.13)
const MUTED = rgb(0.35, 0.35, 0.35)

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

async function fillCuidador(params: {
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

  cover(front, 110, 210, 622, 42, pageH)
  const nameSize = fit(name, font, 610, 32, 16)
  const nameW = font.widthOfTextAtSize(name, nameSize)
  front.drawText(name, { x: 421 - nameW / 2, y: pageH - 246, size: nameSize, font, color: INK })

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
  back.drawText(code, { x: 802 - codeW, y: pageH - 60, size: 14, font: fontBold, color: WINE })

  cover(back, 632, 64, 172, 13, pageH)
  const backNameSize = fit(name, fontReg, 168, 8, 6)
  const backNameW = fontReg.widthOfTextAtSize(name, backNameSize)
  back.drawText(name, { x: 802 - backNameW, y: pageH - 74, size: backNameSize, font: fontReg, color: MUTED })

  cover(back, 90, 482, 90, 13, pageH)
  back.drawText(code, { x: 91, y: pageH - 493, size: 8, font: fontReg, color: rgb(0.2, 0.2, 0.2) })

  return pdf.save()
}

async function fillSocorros(params: {
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
  const title = params.courseTitle || "PRIMEIROS SOCORROS E PREVENÇÃO DE ACIDENTES"
  const subtitle = params.courseSubtitle || "Formação para o público geral: casa, rua, escola e trabalho"
  const line = params.courseLine || "concluiu com aproveitamento o Curso de Primeiros Socorros e Prevenção de Acidentes, promovido pela Bene Curati Cuidados."
  const hours = params.hoursMain || "40 horas"
  const hoursSub = params.hoursSub || "34h + 6h"
  const eixos = params.eixos || []
  const aulas = params.aulas || []

  cover(front, 110, 210, 622, 42, pageH)
  const nameSize = fit(name, font, 610, 32, 16)
  const nameW = font.widthOfTextAtSize(name, nameSize)
  front.drawText(name, { x: 421 - nameW / 2, y: pageH - 246, size: nameSize, font, color: INK })

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
  back.drawText(code, { x: 802 - codeW, y: pageH - 60, size: 14, font: fontBold, color: WINE })

  cover(back, 632, 64, 172, 13, pageH)
  const backNameSize = fit(name, fontReg, 168, 8, 6)
  const backNameW = fontReg.widthOfTextAtSize(name, backNameSize)
  back.drawText(name, { x: 802 - backNameW, y: pageH - 74, size: backNameSize, font: fontReg, color: MUTED })

  cover(back, 90, 482, 120, 13, pageH)
  back.drawText(code, { x: 91, y: pageH - 493, size: 8, font: fontReg, color: rgb(0.2, 0.2, 0.2) })

  cover(front, 230, 124, 380, 28, pageH)
  const titleSize = fit(title, fontBold, 360, 11, 8)
  const titleW = fontBold.widthOfTextAtSize(title, titleSize)
  front.drawText(title, { x: 421 - titleW / 2, y: pageH - 144, size: titleSize, font: fontBold, color: WINE })

  cover(front, 160, 156, 520, 22, pageH)
  const subSize = fit(subtitle, fontReg, 500, 9, 7)
  const subW = fontReg.widthOfTextAtSize(subtitle, subSize)
  front.drawText(subtitle, { x: 421 - subW / 2, y: pageH - 172, size: subSize, font: fontReg, color: INK })

  cover(front, 100, 255, 640, 36, pageH)
  const lineSize = fit(line, fontReg, 620, 9, 7)
  const lineW = fontReg.widthOfTextAtSize(line, lineSize)
  front.drawText(line, { x: 421 - lineW / 2, y: pageH - 276, size: lineSize, font: fontReg, color: INK })

  cover(front, 70, 308, 100, 40, pageH)
  front.drawText(hours, { x: 75, y: pageH - 324, size: 9, font: fontBold, color: INK })
  front.drawText(hoursSub, { x: 75, y: pageH - 338, size: 8, font: fontReg, color: INK })

  cover(front, 160, 385, 450, 78, pageH)
  eixos.forEach((item, i) => {
    const col = i < 5 ? 0 : 1
    const row = i % 5
    front.drawText(item, { x: 172 + col * 220, y: pageH - 402 - row * 14, size: 8, font: fontReg, color: INK })
  })

  cover(back, 200, 112, 440, 24, pageH)
  const backTitle = "Primeiros Socorros e Prevenção de Acidentes — 40 horas"
  const btSize = fit(backTitle, fontReg, 420, 9, 7)
  const btW = fontReg.widthOfTextAtSize(backTitle, btSize)
  back.drawText(backTitle, { x: 421 - btW / 2, y: pageH - 128, size: btSize, font: fontReg, color: INK })

  cover(back, 40, 145, 760, 250, pageH)
  aulas.forEach((item, i) => {
    const col = Math.floor(i / 9)
    const row = i % 9
    back.drawText(item, { x: 50 + col * 250, y: pageH - 168 - row * 18, size: 8, font: fontReg, color: INK })
  })

  cover(back, 300, 448, 240, 62, pageH)
  const carga = params.carga || "40h (34h teóricas + 6h práticas). Modalidade EAD. Prova 70%. Público geral."
  const cargaLines = carga.match(/.{1,38}(\s|$)/g) || [carga]
  cargaLines.slice(0, 4).forEach((text, i) => {
    back.drawText(text.trim(), { x: 308, y: pageH - 462 - i * 11, size: 7, font: fontReg, color: INK })
  })

  cover(back, 530, 534, 280, 16, pageH)
  back.drawText(params.total || "TOTAL: 40h (34h teóricas + 6h práticas)", { x: 539, y: pageH - 546, size: 8, font: fontBold, color: INK })

  return pdf.save()
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
  if (params.courseTitle) return fillSocorros(params)
  return fillCuidador(params)
}
