"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

export default function IssueCertificateButton({
  certificateId,
  studentName,
}: {
  certificateId: string
  studentName: string
}) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  async function handleIssue() {
    if (
      !confirm(
        `Confirmar emissão do certificado de ${studentName}?\n(Isso marca o pagamento como recebido e gera o código.)`
      )
    )
      return

    setLoading(true)
    try {
      const res = await fetch("/api/admin/certificados", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ certificateId, action: "ISSUE" }),
      })
      const data = await res.json()
      if (!res.ok) {
        alert(data.error || "Erro ao emitir")
      } else {
        alert(`Certificado emitido!\nCódigo: ${data.code}`)
        router.refresh()
      }
    } catch {
      alert("Erro de conexão")
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handleIssue}
      disabled={loading}
      className="text-xs font-medium px-3 py-1.5 rounded-lg bg-wine text-white hover:bg-wine/90 transition disabled:opacity-50"
    >
      {loading ? "..." : "Confirmar pagamento e emitir"}
    </button>
  )
}
