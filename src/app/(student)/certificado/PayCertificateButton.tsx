"use client"

import { useState } from "react"
import { Loader2, CreditCard } from "lucide-react"
import { useRouter } from "next/navigation"

export default function PayCertificateButton({
  certificateId,
}: {
  certificateId: string
}) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handlePay() {
    setLoading(true)
    try {
      const res = await fetch("/api/certificado/pagar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ certificateId }),
      })

      if (res.ok) {
        router.refresh()
      } else {
        const data = await res.json()
        alert(data.error || "Erro ao processar pagamento")
      }
    } catch (e) {
      alert("Erro de conexão. Tente novamente.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handlePay}
      disabled={loading}
      className="btn-primary w-full flex items-center justify-center gap-2 py-3 text-base"
    >
      {loading ? (
        <Loader2 className="w-5 h-5 animate-spin" />
      ) : (
        <CreditCard className="w-5 h-5" />
      )}
      {loading ? "Processando..." : "Pagar R$ 75,00 e emitir certificado"}
    </button>
  )
}
