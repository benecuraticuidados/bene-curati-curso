"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

type Settings = {
  institutionName: string
  phone: string
  whatsapp: string
  email: string
  address: string
  courseName: string
  workloadHours: number
  minScore: number
  certificateFee: number
  institutionalPhrase: string
  cnpj: string
}

export default function SettingsForm({ initial }: { initial: Settings }) {
  const router = useRouter()
  const [form, setForm] = useState(initial)
  const [loading, setLoading] = useState(false)
  const [msg, setMsg] = useState("")

  function update(field: keyof Settings, value: string | number) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setMsg("")
    try {
      const res = await fetch("/api/admin/configuracoes", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      })
      if (!res.ok) {
        const data = await res.json()
        setMsg(data.error || "Erro ao salvar")
      } else {
        setMsg("Configurações salvas com sucesso!")
        router.refresh()
      }
    } catch {
      setMsg("Erro de conexão")
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="card max-w-2xl space-y-5">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Nome da instituição
        </label>
        <input
          className="input-field"
          value={form.institutionName}
          onChange={(e) => update("institutionName", e.target.value)}
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          CNPJ
        </label>
        <input
          className="input-field font-mono"
          value={form.cnpj}
          onChange={(e) => update("cnpj", e.target.value)}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Frase institucional
        </label>
        <input
          className="input-field"
          value={form.institutionalPhrase}
          onChange={(e) => update("institutionalPhrase", e.target.value)}
        />
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            E-mail
          </label>
          <input
            type="email"
            className="input-field"
            value={form.email}
            onChange={(e) => update("email", e.target.value)}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            WhatsApp
          </label>
          <input
            className="input-field"
            value={form.whatsapp}
            onChange={(e) => update("whatsapp", e.target.value)}
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Endereço
        </label>
        <input
          className="input-field"
          value={form.address}
          onChange={(e) => update("address", e.target.value)}
        />
      </div>

      <hr className="border-gray-100" />

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Nome do curso
        </label>
        <input
          className="input-field"
          value={form.courseName}
          onChange={(e) => update("courseName", e.target.value)}
        />
      </div>

      <div className="grid sm:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Carga horária (h)
          </label>
          <input
            type="number"
            className="input-field"
            value={form.workloadHours}
            onChange={(e) => update("workloadHours", Number(e.target.value))}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Nota mínima (0–10)
          </label>
          <input
            type="number"
            step="0.1"
            className="input-field"
            value={form.minScore}
            onChange={(e) => update("minScore", Number(e.target.value))}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Taxa certificado (R$)
          </label>
          <input
            type="number"
            step="0.01"
            className="input-field"
            value={form.certificateFee}
            onChange={(e) => update("certificateFee", Number(e.target.value))}
          />
        </div>
      </div>

      {msg && (
        <p
          className={`text-sm ${
            msg.includes("sucesso") ? "text-green-600" : "text-red-600"
          }`}
        >
          {msg}
        </p>
      )}

      <button type="submit" disabled={loading} className="btn-primary">
        {loading ? "Salvando..." : "Salvar configurações"}
      </button>
    </form>
  )
}
