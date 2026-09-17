"use client"

export default function PrintButton() {
  return (
    <button
      onClick={() => window.print()}
      className="btn-primary text-sm"
    >
      Imprimir / Salvar PDF (A4 paisagem)
    </button>
  )
}
