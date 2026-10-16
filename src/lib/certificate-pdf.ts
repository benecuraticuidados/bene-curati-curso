import { PDFDocument, rgb, StandardFonts } from "pdf-lib"
import fs from "fs/promises"
import path from "path"
import QRCode from "qrcode"

export const CERTIFICATE_TEMPLATE_VERSION = "v4"

const BURG = rgb(91 / 255, 19 / 255, 32 / 255)
const GOLD = rgb(196 / 255, 160 / 255, 36 / 255)
const TINT = rgb(246 / 255, 238 / 255, 240 / 255)
const INK = rgb(38 / 255, 42 / 255, 53 / 255)
const GREY = rgb(87 / 255, 93 / 255, 107 / 255)
const WHITE = rgb(1, 1, 1)
const CREAM = rgb(0.996, 0.984, 0.973)

function fmt(d: Date | string) {
  const dt = typeof d === "string" ? new Date(d) : d
  return dt.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" })
}

function center(page: any, text: string, font: any, size: number, y: number, color: any, W: number) {
  page.drawText(text, { x: (W - font.widthOfTextAtSize(text, size)) / 2, y, size, font, color })
}

const SOCORROS_EIXOS_L = [
  "Segurança da cena e avaliação inicial",
  "Desmaios e convulsões",
  "Hemorragias e queimaduras",
  "Reconhecimento de AVC",
  "Engasgo e parada cardiorrespiratória",
]
const SOCORROS_EIXOS_R = [
  "Quedas, fraturas e acidentes",
  "Intoxicações e animais peçonhentos",
  "Afogamento e alterações de temperatura",
  "Emergências e acionamento do socorro",
]
const SOCORROS_MODULOS = [
  [["1. Segurança da cena", "2h"], ["2. Avaliação inicial", "3h"], ["3. Desmaio e posição segura", "2h"],
   ["4. Convulsões", "2h"], ["5. Hemorragias e sangramentos", "3h"], ["6. Queimaduras", "2h"]],
  [["7. Reconhecimento de AVC", "2h"], ["8. Engasgo", "3h"], ["9. Parada cardiorrespiratória", "5h"],
   ["10. Quedas e prevenção", "2h"], ["11. Fraturas, entorses e contusões", "2h"], ["12. Intoxicações", "2h"]],
  [["13. Animais peçonhentos", "2h"], ["14. Afogamento", "2h"], ["15. Hipotermia e insolação", "2h"],
   ["16. Emergências na gestação", "1h"], ["17. Crises emocionais e proteção", "1h"],
   ["18. Acionamento do socorro", "2h"]],
]

async function fillCuidador(params: { name: string; startedAt: Date | string; issuedAt: Date | string; code: string }) {
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

  front.drawRectangle({ x: 110, y: pageH - 252, width: 622, height: 42, color: CREAM })
  const nameW = font.widthOfTextAtSize(name, 28)
  front.drawText(name, { x: 421 - nameW / 2, y: pageH - 246, size: 28, font, color: INK })
  front.drawRectangle({ x: 350, y: pageH - 336, width: 88, height: 18, color: CREAM })
  front.drawRectangle({ x: 496, y: pageH - 336, width: 88, height: 18, color: CREAM })
  front.drawText(start, { x: 352.9, y: pageH - 334, size: 13, font: fontBold, color: INK })
  front.drawText(end, { x: 498.9, y: pageH - 334, size: 13, font: fontBold, color: INK })
  front.drawRectangle({ x: 696, y: pageH - 576, width: 92, height: 14, color: CREAM })
  front.drawText(code, { x: 698, y: pageH - 574, size: 9, font: fontReg, color: INK })

  const qrPng = await QRCode.toBuffer("https://app.benecurati.com.br/validar?codigo=" + encodeURIComponent(code), {
    type: "png", margin: 1, width: 280, errorCorrectionLevel: "M",
    color: { dark: "#1a1a1a", light: "#FFFFFF" },
  })
  const qrImg = await pdf.embedPng(qrPng)
  front.drawRectangle({ x: 555, y: pageH - 504, width: 78, height: 78, color: WHITE })
  front.drawImage(qrImg, { x: 557, y: pageH - 502, width: 74, height: 74 })

  back.drawRectangle({ x: 628, y: pageH - 64, width: 176, height: 22, color: WHITE })
  const codeW = fontBold.widthOfTextAtSize(code, 14)
  back.drawText(code, { x: 802 - codeW, y: pageH - 60, size: 14, font: fontBold, color: BURG })
  back.drawRectangle({ x: 632, y: pageH - 77, width: 172, height: 13, color: WHITE })
  back.drawText(name, { x: 802 - fontReg.widthOfTextAtSize(name, 8), y: pageH - 74, size: 8, font: fontReg, color: GREY })
  back.drawRectangle({ x: 90, y: pageH - 495, width: 90, height: 13, color: WHITE })
  back.drawText(code, { x: 91, y: pageH - 493, size: 8, font: fontReg, color: INK })

  return pdf.save()
}

async function fillSocorros(params: { name: string; startedAt: Date | string; issuedAt: Date | string; code: string }) {
  const pdf = await PDFDocument.create()
  const font = await pdf.embedFont(StandardFonts.TimesRomanBold)
  const fontReg = await pdf.embedFont(StandardFonts.Helvetica)
  const fontBold = await pdf.embedFont(StandardFonts.HelveticaBold)
  const W = 841.89
  const H = 595.28
  const front = pdf.addPage([W, H])
  const back = pdf.addPage([W, H])
  const name = params.name.trim().toUpperCase()
  const start = fmt(params.startedAt)
  const end = fmt(params.issuedAt)
  const code = params.code
  const cx = W / 2

  for (const page of [front, back]) {
    page.drawRectangle({ x: 0, y: 0, width: W, height: H, color: CREAM })
  }
  front.drawCircle({ x: W, y: H, size: 118, color: BURG })
  front.drawCircle({ x: W, y: H, size: 102, color: GOLD })
  front.drawCircle({ x: W, y: H, size: 93, color: BURG })
  front.drawCircle({ x: 0, y: 0, size: 108, color: BURG })
  front.drawCircle({ x: 0, y: 0, size: 94, color: GOLD })
  front.drawCircle({ x: 0, y: 0, size: 86, color: BURG })

  front.drawText("BENE CURATI", { x: 48, y: H - 42, size: 14, font: fontBold, color: INK })
  front.drawText("CUIDADOS", { x: 48, y: H - 58, size: 14, font: fontBold, color: INK })
  front.drawText("NOSSA PAIXÃO É CUIDAR DE QUEM VOCÊ AMA!", { x: 48, y: H - 72, size: 6, font: fontReg, color: BURG })

  center(front, "CERTIFICADO DE CONCLUSÃO", fontBold, 22, H - 108, BURG, W)
  front.drawRectangle({ x: 160, y: H - 148, width: 522, height: 26, color: BURG })
  center(front, "PRIMEIROS SOCORROS E PREVENÇÃO DE ACIDENTES", fontBold, 10, H - 140, WHITE, W)
  center(front, "Formação para o público geral: casa, rua, escola e trabalho", fontReg, 10, H - 168, GREY, W)
  center(front, "Certificamos que", fontReg, 11, H - 190, GREY, W)

  let nameSize = 28
  while (font.widthOfTextAtSize(name, nameSize) > 760 && nameSize > 16) nameSize -= 1
  center(front, name, font, nameSize, H - 228, INK, W)
  front.drawLine({ start: { x: cx - 290, y: H - 242 }, end: { x: cx + 290, y: H - 242 }, thickness: 1.5, color: GOLD })
  center(front, "concluiu com aproveitamento o Curso de Primeiros Socorros e Prevenção de Acidentes,", fontReg, 10, H - 262, INK, W)
  center(front, "capacitação para agir em situações de emergência, promovido pela Bene Curati Cuidados.", fontReg, 10, H - 276, INK, W)

  const metas = [
    ["CARGA HORÁRIA", "40 horas"],
    ["MODALIDADE", "EAD"],
    ["INÍCIO", start],
    ["CONCLUSÃO", end],
    ["CNPJ", "60.725.201/0001-88"],
  ]
  metas.forEach((item, i) => {
    const x = 48 + i * 156
    front.drawCircle({ x: x + 8, y: H - 310, size: 8, color: BURG })
    front.drawText(item[0], { x: x + 20, y: H - 306, size: 6.5, font: fontBold, color: BURG })
    front.drawText(item[1], { x: x + 20, y: H - 322, size: 11, font: fontBold, color: INK })
  })

  center(front, "EIXOS DA FORMAÇÃO", fontBold, 9, H - 350, BURG, W)
  front.drawRectangle({ x: 70, y: H - 450, width: 500, height: 90, color: TINT })
  front.drawRectangle({ x: 70, y: H - 450, width: 5, height: 90, color: GOLD })
  SOCORROS_EIXOS_L.forEach((item, i) => {
    front.drawText("• " + item, { x: 86, y: H - 372 - i * 14, size: 8, font: fontReg, color: INK })
  })
  SOCORROS_EIXOS_R.forEach((item, i) => {
    front.drawText("• " + item, { x: 340, y: H - 372 - i * 14, size: 8, font: fontReg, color: INK })
  })

  front.drawText("Marcelo Rios", { x: 70, y: H - 490, size: 12, font: fontBold, color: INK })
  front.drawText("Diretor", { x: 70, y: H - 504, size: 9, font: fontReg, color: GREY })
  front.drawText("Bene Curati Cuidados", { x: 70, y: H - 516, size: 9, font: fontReg, color: GREY })

  const qrPng = await QRCode.toBuffer("https://app.benecurati.com.br/validar?codigo=" + encodeURIComponent(code), {
    type: "png", margin: 1, width: 220, errorCorrectionLevel: "M",
    color: { dark: "#1a1a1a", light: "#FFFFFF" },
  })
  const qrImg = await pdf.embedPng(qrPng)
  front.drawRectangle({ x: 560, y: 48, width: 230, height: 68, color: BURG })
  front.drawRectangle({ x: 560, y: 48, width: 68, height: 68, color: WHITE })
  front.drawImage(qrImg, { x: 565, y: 53, width: 58, height: 58 })
  front.drawText("ACESSE A PLATAFORMA", { x: 640, y: 90, size: 7, font: fontBold, color: GOLD })
  front.drawText("app.benecurati.com.br", { x: 640, y: 74, size: 9, font: fontBold, color: WHITE })
  front.drawText("CERTIFICADO VERIFICÁVEL DIGITALMENTE", { x: 560, y: 36, size: 6, font: fontBold, color: BURG })
  front.drawText("Código: " + code, { x: 560, y: 24, size: 8, font: fontReg, color: INK })
  center(front, "NOSSA PAIXÃO É CUIDAR DE QUEM VOCÊ AMA!", fontReg, 7, 12, BURG, W)

  back.drawRectangle({ x: 0, y: H - 9, width: W, height: 9, color: BURG })
  back.drawRectangle({ x: 0, y: 0, width: W, height: 20, color: BURG })
  center(back, "BENE CURATI CUIDADOS • NOSSA PAIXÃO É CUIDAR DE QUEM VOCÊ AMA!", fontReg, 7, 7, WHITE, W)
  back.drawText("Bene Curati Cuidados", { x: 48, y: H - 42, size: 13, font: fontBold, color: BURG })
  back.drawText("CNPJ 60.725.201/0001-88", { x: 48, y: H - 56, size: 9, font: fontReg, color: GREY })
  back.drawText("VERSO • CERTIFICADO Nº", { x: 560, y: H - 34, size: 8, font: fontBold, color: GREY })
  back.drawText(code, { x: W - 40 - fontBold.widthOfTextAtSize(code, 14), y: H - 52, size: 14, font: fontBold, color: BURG })
  back.drawText(name, { x: W - 40 - fontReg.widthOfTextAtSize(name, 8), y: H - 66, size: 8, font: fontReg, color: GREY })
  center(back, "CONTEÚDO PROGRAMÁTICO", fontBold, 16, H - 100, INK, W)
  center(back, "Curso de Primeiros Socorros e Prevenção de Acidentes — 40 horas", fontBold, 10, H - 118, GREY, W)

  SOCORROS_MODULOS.forEach((rows, ci) => {
    const x = 40 + ci * 265
    back.drawRectangle({ x, y: H - 150, width: 250, height: 18, color: BURG })
    back.drawText("Módulo", { x: x + 8, y: H - 145, size: 8, font: fontBold, color: WHITE })
    back.drawText("H", { x: x + 228, y: H - 145, size: 8, font: fontBold, color: WHITE })
    rows.forEach((item, ri) => {
      const y = H - 178 - ri * 28
      if (ri % 2 === 0) back.drawRectangle({ x, y: y - 6, width: 250, height: 24, color: TINT })
      back.drawText(item[0], { x: x + 8, y, size: 8, font: fontReg, color: INK })
      back.drawText(item[1], { x: x + 228, y, size: 8, font: fontBold, color: BURG })
    })
  })

  const boxes = [
    ["COMO VALIDAR", "QR da frente ou app.benecurati.com.br/validar com o código " + code + "."],
    ["CARGA E AVALIAÇÃO", "40 horas. Modalidade EAD. Prova 70%. Público geral."],
    ["NATUREZA DA FORMAÇÃO", "Comprova a formação. Não estabelece vínculo de emprego com a Bene Curati Cuidados."],
  ]
  boxes.forEach((box, i) => {
    const x = 40 + i * 265
    back.drawRectangle({ x, y: 50, width: 250, height: 78, borderColor: GREY, borderWidth: 0.6, color: WHITE })
    back.drawText(box[0], { x: x + 10, y: 112, size: 8, font: fontBold, color: BURG })
    back.drawText(box[1].slice(0, 42), { x: x + 10, y: 96, size: 7, font: fontReg, color: INK })
    if (box[1].length > 42) back.drawText(box[1].slice(42, 84), { x: x + 10, y: 84, size: 7, font: fontReg, color: INK })
  })
  back.drawText("TOTAL: 40 horas", { x: 620, y: 32, size: 10, font: fontBold, color: BURG })
  back.drawText("EMBASAMENTO LEGAL: DECRETO PRESIDENCIAL Nº 5.154 E RESOLUÇÃO CNE Nº 04/99 DO MEC. CNPJ 60.725.201/0001-88.", { x: 40, y: 32, size: 6, font: fontReg, color: GREY })

  return pdf.save()
}

export async function fillMasterCertificate(params: { name: string; startedAt: Date | string; issuedAt: Date | string; code: string; courseTitle?: string; courseSubtitle?: string; courseLine?: string; hoursMain?: string; hoursSub?: string; eixos?: string[]; aulas?: string[]; carga?: string; total?: string }) {
  if (params.courseTitle) return fillSocorros(params)
  return fillCuidador(params)
}
