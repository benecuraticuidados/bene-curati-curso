"use client"

import { useState } from "react"
import { Loader2, CreditCard } from "lucide-react"

export default function PayCertificateButton({
  amountLabel,
}: {
  amountLabel: string
}) {
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState("")

  async function handlePay() {
    setLoading(true)
    setMessage("")
    try {
      const res = await fetch("/api/payments/checkout", { method: "POST" })
      const data = await res.json()
      if (data.alreadyIssued) {
        window.location.assign("/certificado")
        return
      }
      if (data.checkoutUrl) {
        window.location.assign(data.checkoutUrl)
        return
      }
      if (data.configured === false) {
        setMessage(
          data.message ||
            "Checkout ainda não configurado. O administrador precisa adicionar as credenciais do Mercado Pago."
        )
        return
      }
      setMessage(data.error || "Não foi possível iniciar o pagamento.")
    } catch {
      setMessage("Erro de conexão. Tente novamente.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <button
        onClick={handlePay}
        disabled={loading}
        className="btn-primary w-full flex items-center justify-center gap-2 py-3 text-base"
      >
        {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <CreditCard className="w-5 h-5" />}
        {loading ? "Abrindo pagamento..." : `Prosseguir para pagamento ${amountLabel}`}
      </button>
      {message && (
        <p className="text-sm text-amber-800 bg-amber-50 border border-amber-200 rounded-lg p-3 mt-4">
          {message}
        </p>
      )}
    </div>
  )
}
