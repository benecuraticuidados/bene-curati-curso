"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import PasswordField from "@/components/PasswordField"

type Props = {
  userId: string
  name: string
  email: string
  whatsapp: string
  cpf: string
}

export default function EditStudentButton({ userId, name, email, whatsapp, cpf }: Props) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [ok, setOk] = useState("")
  const [form, setForm] = useState({ name, email, whatsapp, cpf, password: "" })

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError("")
    setOk("")
    const res = await fetch("/api/admin/alunos", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId,
        name: form.name,
        email: form.email,
        whatsapp: form.whatsapp,
        cpf: form.cpf,
        password: form.password,
      }),
    })
    const data = await res.json()
    setLoading(false)
    if (!res.ok) {
      setError(data.error || "Não foi possível salvar.")
      return
    }
    setOk(form.password ? "Dados e senha atualizados." : "Dados atualizados.")
    setForm((f) => ({ ...f, password: "" }))
    router.refresh()
  }

  return (
    <>
      <button type="button" className="text-xs text-wine hover:underline" onClick={() => setOpen(true)}>
        Editar
      </button>
      {open && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-end sm:items-center justify-center p-3">
          <form onSubmit={onSubmit} className="bg-white rounded-xl w-full max-w-md p-5 space-y-3 shadow-xl">
            <h3 className="font-bold text-gray-900">Editar aluno</h3>
            {error && <p className="text-sm text-red-700">{error}</p>}
            {ok && <p className="text-sm text-green-700">{ok}</p>}
            <input
              className="input-field"
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Nome"
            />
            <input
              className="input-field"
              type="email"
              required
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder="E-mail"
            />
            <input
              className="input-field"
              value={form.whatsapp}
              onChange={(e) => setForm({ ...form, whatsapp: e.target.value })}
              placeholder="WhatsApp"
            />
            <input
              className="input-field"
              value={form.cpf}
              onChange={(e) => setForm({ ...form, cpf: e.target.value })}
              placeholder="CPF"
            />
            <PasswordField
              label="Nova senha (deixe vazio para não mudar)"
              value={form.password}
              onChange={(v) => setForm({ ...form, password: v })}
              autoComplete="new-password"
              required={false}
            />
            <div className="flex gap-2 justify-end pt-1">
              <button type="button" className="btn-outline text-sm" onClick={() => setOpen(false)}>
                Fechar
              </button>
              <button type="submit" className="btn-primary text-sm" disabled={loading}>
                {loading ? "Salvando..." : "Salvar"}
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  )
}
