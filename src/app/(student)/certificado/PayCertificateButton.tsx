"use client"

import { useState } from "react"
import { Loader2, QrCode, CreditCard, Copy } from "lucide-react"

type PixData = {
  paymentId: string
  qrCode?: string
  qrCodeBase64?: string
  ticketUrl?: string
  amount?: number
}

export default function PayCertificateButton({
  amountLabel,
}: {
  amountLabel: string
}) {
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState("")
  const [pix, setPix] = useState<PixData | null>(null)
  const [checking, setChecking] = useState(false)

  async function start(method: "pix" | "checkout") {
    setLoading(true)
    setMessage("")
    try {
      const res = await fetch("/api/payments/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ method }),
      })
      const data = await res.json()
      if (data.alreadyIssued) {
        window.location.assign("/certificado")
        return
      }
      if (data.method === "pix" && (data.qrCode || data.qrCodeBase64)) {
        setPix({
          paymentId: data.paymentId,
          qrCode: data.qrCode,
          qrCodeBase64: data.qrCodeBase64,
          ticketUrl: data.ticketUrl,
          amount: data.amount,
        })
        return
      }
      if (data.checkoutUrl) {
        window.location.assign(data.checkoutUrl)
        return
      }
      if (data.configured === false) {
        setMessage(data.message || "Checkout ainda não configurado.")
        return
      }
      setMessage(
        [data.error, data.hint, data.details].filter(Boolean).join(" — ") ||
          "Não foi possível iniciar o pagamento."
      )
    } catch {
      setMessage("Erro de conexão. Tente novamente.")
    } finally {
      setLoading(false)
    }
  }

  async function verify() {
    if (!pix?.paymentId) return
    setChecking(true)
    try {
      const res = await fetch(`/api/payments/status?paymentId=${pix.paymentId}`)
      const data = await res.json()
      if (data.status === "PAID" || data.issued) {
        window.location.assign("/certificado")
        return
      }
      setMessage(
        data.status === "pending" || data.status === "PENDING"
          ? "Pagamento ainda pendente. Assim que o Pix for confirmado, o certificado é liberado."
          : `Status: ${data.status || "pendente"}`
      )
    } catch {
      setMessage("Não foi possível verificar agora.")
    } finally {
      setChecking(false)
    }
  }

  if (pix) {
    return (
      <div className="space-y-4">
        <p className="text-sm font-medium text-gray-800 text-center">Pague com Pix</p>
        {pix.qrCodeBase64 && (
          <img
            alt="QR Code Pix"
            className="mx-auto w-56 h-56 bg-white p-2 rounded-lg border"
            src={`data:image/png;base64,${pix.qrCodeBase64}`}
          />
        )}
        {pix.qrCode && (
          <div>
            <p className="text-xs text-gray-500 mb-1">Pix Copia e Cola</p>
            <textarea readOnly className="input-field text-xs font-mono h-24" value={pix.qrCode} />
            <button
              type="button"
              className="btn-secondary w-full mt-2 flex items-center justify-center gap-2"
              onClick={() => navigator.clipboard.writeText(pix.qrCode || "")}
            >
              <Copy className="w-4 h-4" />
              Copiar código Pix
            </button>
          </div>
        )}
        {pix.ticketUrl && (
          <a href={pix.ticketUrl} target="_blank" className="block text-center text-sm text-wine underline">
            Abrir Pix no Mercado Pago
          </a>
        )}
        <button onClick={verify} disabled={checking} className="btn-primary w-full">
          {checking ? "Verificando..." : "Já paguei — verificar"}
        </button>
        <button
          type="button"
          className="text-sm text-gray-600 underline w-full"
          onClick={() => start("checkout")}
        >
          Pagar com cartão ou boleto
        </button>
        {message && (
          <p className="text-sm text-amber-800 bg-amber-50 border border-amber-200 rounded-lg p-3">{message}</p>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <button
        onClick={() => start("pix")}
        disabled={loading}
        className="btn-primary w-full flex items-center justify-center gap-2 py-3 text-base"
      >
        {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <QrCode className="w-5 h-5" />}
        {loading ? "Gerando Pix..." : `Pagar com Pix ${amountLabel}`}
      </button>
      <button
        onClick={() => start("checkout")}
        disabled={loading}
        className="btn-secondary w-full flex items-center justify-center gap-2 py-3"
      >
        <CreditCard className="w-5 h-5" />
        Cartão ou boleto
      </button>
      {message && (
        <p className="text-sm text-amber-800 bg-amber-50 border border-amber-200 rounded-lg p-3">{message}</p>
      )}
    </div>
  )
}
