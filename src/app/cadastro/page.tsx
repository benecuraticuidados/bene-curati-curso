"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { Loader2 } from "lucide-react"
import PasswordField from "@/components/PasswordField"

export default function CadastroPage() {
  const router = useRouter()
  const [form, setForm] = useState({
    name: "",
    email: "",
    whatsapp: "",
    city: "",
    state: "",
    password: "",
    confirmPassword: "",
  })
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError("")

    if (form.password !== form.confirmPassword) {
      setError("As senhas não coincidem.")
      return
    }
    if (form.password.length < 6) {
      setError("A senha deve ter pelo menos 6 caracteres.")
      return
    }

    setLoading(true)
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          whatsapp: form.whatsapp,
          city: form.city,
          state: form.state,
          password: form.password,
        }),
      })

      const data = await res.json()
      if (!res.ok) {
        setError(data.error || "Erro ao criar conta")
        setLoading(false)
        return
      }

      // Redireciona para login
      router.push("/login?registered=1")
    } catch {
      setError("Erro de conexão. Tente novamente.")
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4 py-10">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Image
            src="/logo-bene-curati-v2.png"
            alt="Bene Curati"
            width={64}
            height={64}
            className="mx-auto rounded-full mb-3"
          />
          <h1 className="text-2xl font-bold text-gray-900">Criar minha conta</h1>
          <p className="text-gray-500 mt-1 text-sm">
            Comece sua formação profissional de cuidador
          </p>
        </div>

        <form onSubmit={handleSubmit} className="card space-y-4">
          {error && (
            <div className="bg-red-50 text-red-700 text-sm p-3 rounded-lg border border-red-100">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nome completo</label>
            <input name="name" required value={form.name} onChange={handleChange} className="input-field" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">E-mail</label>
            <input name="email" type="email" required value={form.email} onChange={handleChange} className="input-field" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">WhatsApp</label>
            <input name="whatsapp" value={form.whatsapp} onChange={handleChange} className="input-field" placeholder="(11) 99999-9999" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Cidade</label>
              <input name="city" value={form.city} onChange={handleChange} className="input-field" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Estado</label>
              <input name="state" value={form.state} onChange={handleChange} className="input-field" placeholder="SP" maxLength={2} />
            </div>
          </div>

          <PasswordField
            name="password"
            label="Senha"
            value={form.password}
            onChange={(v) => setForm({ ...form, password: v })}
            autoComplete="new-password"
          />
          <PasswordField
            name="confirmPassword"
            label="Confirmar senha"
            value={form.confirmPassword}
            onChange={(v) => setForm({ ...form, confirmPassword: v })}
            autoComplete="new-password"
          />

          <button type="submit" disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2">
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            Criar conta
          </button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-6">
          Já tem conta?{" "}
          <Link href="/login" className="text-wine font-medium hover:underline">
            Entrar
          </Link>
        </p>
      </div>
    </div>
  )
}
