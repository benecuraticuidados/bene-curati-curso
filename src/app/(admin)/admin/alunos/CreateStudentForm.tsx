"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import PasswordField from "@/components/PasswordField"

export default function CreateStudentForm() {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [cpf, setCpf] = useState("")
  const [whatsapp, setWhatsapp] = useState("")

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError("")
    const res = await fetch("/api/admin/alunos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password, cpf, whatsapp }),
    })
    const data = await res.json()
    setLoading(false)
    if (!res.ok) {
      setError(data.error || "Não foi possível incluir o aluno.")
      return
    }
    setName("")
    setEmail("")
    setPassword("")
    setCpf("")
    setWhatsapp("")
    setOpen(false)
    router.refresh()
  }

  return (
    <div className="mb-6">
      <button type="button" className="btn-primary text-sm" onClick={() => setOpen((v) => !v)}>
        {open ? "Cancelar" : "Incluir aluno manualmente"}
      </button>
      {open && (
        <form onSubmit={onSubmit} className="card mt-3 grid sm:grid-cols-2 gap-3">
          <input className="input-field" placeholder="Nome completo" value={name} onChange={(e) => setName(e.target.value)} required />
          <input className="input-field" type="email" placeholder="E-mail" value={email} onChange={(e) => setEmail(e.target.value)} required />
          <PasswordField label="Senha inicial" value={password} onChange={setPassword} autoComplete="new-password" />
          <input className="input-field" placeholder="CPF (opcional)" value={cpf} onChange={(e) => setCpf(e.target.value)} />
          <input className="input-field" placeholder="WhatsApp (opcional)" value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)} />
          <div className="sm:col-span-2 flex items-center gap-3">
            <button type="submit" className="btn-primary text-sm" disabled={loading}>
              {loading ? "Salvando..." : "Salvar aluno"}
            </button>
            {error && <p className="text-sm text-red-600">{error}</p>}
          </div>
        </form>
      )}
    </div>
  )
}
