"use client"

import { useState } from "react"
import { signIn } from "next-auth/react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { Loader2 } from "lucide-react"
import PasswordField from "@/components/PasswordField"

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      // Login sem CSRF do NextAuth (evita erro no Vercel/celular)
      const apiRes = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.toLowerCase().trim(),
          password,
        }),
      })
      const data = await apiRes.json()

      if (!apiRes.ok) {
        setError(data.error || "E-mail ou senha incorretos.")
        setLoading(false)
        return
      }

      const dest = data.role === "ADMIN" ? "/admin" : "/dashboard"
      window.location.assign(dest)
      return
    } catch {
      // Fallback NextAuth (pode falhar com CSRF em domínio diferente)
      const res = await signIn("credentials", {
        email: email.toLowerCase().trim(),
        password,
        redirect: false,
      })
      if (res?.error) {
        setError(
          res.error === "CredentialsSignin"
            ? "E-mail ou senha incorretos."
            : `Falha no login (${res.error}). Abra https://bene-curati-curso.vercel.app/login`
        )
        setLoading(false)
        return
      }
      router.push("/dashboard")
      router.refresh()
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Image
            src="/logo-bene-curati-v2.png"
            alt="Bene Curati Cuidados"
            width={72}
            height={72}
            className="mx-auto object-contain mb-4"
            priority
          />
          <h1 className="text-2xl font-bold text-gray-900">Entrar</h1>
          <p className="text-gray-500 mt-1">Acesse sua conta Bene Curati</p>
        </div>

        <form onSubmit={handleSubmit} className="card space-y-5">
          {error && (
            <div className="bg-red-50 text-red-700 text-sm p-3 rounded-lg border border-red-100">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">E-mail</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input-field"
              placeholder="seu@email.com"
            />
          </div>

          <PasswordField
            label="Senha"
            value={password}
            onChange={setPassword}
            autoComplete="current-password"
          />

          <div className="flex justify-end">
            <Link href="/recuperar-senha" className="text-sm text-wine hover:underline">
              Esqueci minha senha
            </Link>
          </div>

          <button type="submit" disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2">
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            Entrar
          </button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-6">
          Ainda não tem conta?{" "}
          <Link href="/cadastro" className="text-wine font-medium hover:underline">
            Criar minha conta
          </Link>
        </p>

        <div className="mt-6 space-y-2">
          <p className="text-center text-xs text-gray-400">Preencher conta de teste:</p>
          <div className="flex gap-2">
            <button
              type="button"
              className="flex-1 text-xs border border-wine/30 text-wine rounded-lg py-2"
              onClick={() => {
                setEmail("aluno@teste.com")
                setPassword("aluno123")
                setError("")
              }}
            >
              Aluno demo
            </button>
            <button
              type="button"
              className="flex-1 text-xs border border-wine/30 text-wine rounded-lg py-2"
              onClick={() => {
                setEmail("admin@benecurati.com.br")
                setPassword("admin123")
                setError("")
              }}
            >
              Admin demo
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
