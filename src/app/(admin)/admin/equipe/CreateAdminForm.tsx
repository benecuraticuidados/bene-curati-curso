"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Loader2 } from "lucide-react"

export default function CreateAdminForm() {
  const router = useRouter()
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [ok, setOk] = useState("")

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError("")
    setOk("")
    setLoading(true)
    try {
      const res = await fetch("/api/admin/usuarios", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password, role: "ADMIN" }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || "Erro ao criar administrador")
      } else {
        setOk(`Administrador ${data.user.email} criado.`)
        setName("")
        setEmail("")
        setPassword("")
        router.refresh()
      }
    } catch {
      setError("Erro de conexão")
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-4 sm:grid-cols-2">
      {error && <p className="sm:col-span-2 text-sm text-red-700 bg-red-50 border border-red-100 rounded-lg p-3">{error}</p>}
      {ok && <p className="sm:col-span-2 text-sm text-green-700 bg-green-50 border border-green-100 rounded-lg p-3">{ok}</p>}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Nome</label>
        <input className="input-field" required value={name} onChange={(e) => setName(e.target.value)} />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">E-mail</label>
        <input type="email" className="input-field" required value={email} onChange={(e) => setEmail(e.target.value)} />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Senha inicial</label>
        <input type="password" minLength={6} className="input-field" required value={password} onChange={(e) => setPassword(e.target.value)} />
      </div>
      <div className="flex items-end">
        <button type="submit" disabled={loading} className="btn-primary flex items-center gap-2">
          {loading && <Loader2 className="w-4 h-4 animate-spin" />}
          Cadastrar admin
        </button>
      </div>
    </form>
  )
}
