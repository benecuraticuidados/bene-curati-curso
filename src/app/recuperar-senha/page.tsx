"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"

export default function RecuperarSenhaPage() {
  const [email, setEmail] = useState("")
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    await fetch("/api/conta/recuperar", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    })
    setSent(true)
    setLoading(false)
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Image src="/logo-bene-curati-v2.png" alt="" width={64} height={64} className="mx-auto mb-3" />
          <h1 className="text-2xl font-bold">Esqueci minha senha</h1>
        </div>
        <form onSubmit={handleSubmit} className="card space-y-4">
          {sent ? (
            <p className="text-sm text-gray-700">
              Se existir uma conta associada a este e-mail, enviaremos instruções para redefinição da senha.
            </p>
          ) : (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">E-mail</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input-field"
                />
              </div>
              <button type="submit" disabled={loading} className="btn-primary w-full">
                Enviar instruções
              </button>
            </>
          )}
        </form>
        <p className="text-center text-sm text-gray-500 mt-6">
          <Link href="/login" className="text-wine hover:underline">
            Voltar ao login
          </Link>
        </p>
      </div>
    </div>
  )
}
