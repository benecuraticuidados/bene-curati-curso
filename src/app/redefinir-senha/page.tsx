"use client"

import { useState } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { Suspense } from "react"
import PasswordField from "@/components/PasswordField"

function ResetForm() {
  const search = useSearchParams()
  const token = search.get("token") || ""
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [error, setError] = useState("")
  const [ok, setOk] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError("")
    setLoading(true)
    const res = await fetch("/api/conta/redefinir", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, newPassword, confirmPassword }),
    })
    const data = await res.json()
    setLoading(false)
    if (!res.ok) {
      setError(data.error || "Não foi possível redefinir.")
      return
    }
    setOk(true)
  }

  if (!token) {
    return <p className="text-sm text-red-700">Link inválido. Solicite uma nova recuperação.</p>
  }
  if (ok) {
    return (
      <p className="text-sm text-gray-700">
        Senha atualizada.{" "}
        <Link href="/login" className="text-wine font-medium hover:underline">
          Entrar
        </Link>
      </p>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && <div className="bg-red-50 text-red-700 text-sm p-3 rounded-lg">{error}</div>}
      <PasswordField label="Nova senha" value={newPassword} onChange={setNewPassword} autoComplete="new-password" />
      <PasswordField
        label="Confirmar nova senha"
        value={confirmPassword}
        onChange={setConfirmPassword}
        autoComplete="new-password"
      />
      <button type="submit" disabled={loading} className="btn-primary w-full">
        Redefinir senha
      </button>
    </form>
  )
}

export default function RedefinirSenhaPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Image src="/logo-bene-curati-v2.png" alt="" width={64} height={64} className="mx-auto mb-3" />
          <h1 className="text-2xl font-bold">Redefinir senha</h1>
        </div>
        <div className="card">
          <Suspense fallback={<p className="text-sm text-gray-500">Carregando…</p>}>
            <ResetForm />
          </Suspense>
        </div>
      </div>
    </div>
  )
}
