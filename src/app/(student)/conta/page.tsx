"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { signOut } from "next-auth/react"
import StudentHeader from "@/components/StudentHeader"
import PasswordField from "@/components/PasswordField"

export default function ContaPage() {
  const router = useRouter()
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [msg, setMsg] = useState("")
  const [err, setErr] = useState("")
  const [delPass, setDelPass] = useState("")
  const [delErr, setDelErr] = useState("")
  const [loading, setLoading] = useState(false)

  async function changePassword(e: React.FormEvent) {
    e.preventDefault()
    setErr("")
    setMsg("")
    setLoading(true)
    const res = await fetch("/api/conta/senha", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ currentPassword, newPassword, confirmPassword }),
    })
    const data = await res.json()
    setLoading(false)
    if (!res.ok) {
      setErr(data.error || "Não foi possível alterar.")
      return
    }
    setMsg("Senha alterada com sucesso.")
    setCurrentPassword("")
    setNewPassword("")
    setConfirmPassword("")
  }

  async function deleteAccount(e: React.FormEvent) {
    e.preventDefault()
    if (!window.confirm("Excluir sua conta? Esta ação não pode ser desfeita.")) return
    setDelErr("")
    const res = await fetch("/api/conta/excluir", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password: delPass }),
    })
    const data = await res.json()
    if (!res.ok) {
      setDelErr(data.error || "Não foi possível excluir.")
      return
    }
    await fetch("/api/logout", { method: "POST" })
    await signOut({ redirect: false })
    router.push("/login")
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <StudentHeader />
      <main className="max-w-xl mx-auto px-4 py-8 space-y-8">
        <h1 className="text-2xl font-bold text-gray-900">Minha conta</h1>

        <section className="card space-y-4">
          <h2 className="font-bold text-wine">Segurança e senha</h2>
          <form onSubmit={changePassword} className="space-y-3">
            {err && <p className="text-sm text-red-700">{err}</p>}
            {msg && <p className="text-sm text-green-700">{msg}</p>}
            <PasswordField
              label="Senha atual"
              value={currentPassword}
              onChange={setCurrentPassword}
              autoComplete="current-password"
            />
            <PasswordField
              label="Nova senha"
              value={newPassword}
              onChange={setNewPassword}
              autoComplete="new-password"
            />
            <PasswordField
              label="Confirmar nova senha"
              value={confirmPassword}
              onChange={setConfirmPassword}
              autoComplete="new-password"
            />
            <button type="submit" disabled={loading} className="btn-primary">
              Alterar senha
            </button>
          </form>
        </section>

        <section className="card space-y-3 border border-red-100">
          <h2 className="font-bold text-red-800">Excluir minha conta</h2>
          <p className="text-sm text-gray-600">
            Contas com certificado já emitido não podem ser excluídas, para você poder baixar o PDF de novo.
          </p>
          {delErr && <p className="text-sm text-red-700">{delErr}</p>}
          <form onSubmit={deleteAccount} className="space-y-3">
            <PasswordField
              label="Confirme com sua senha"
              value={delPass}
              onChange={setDelPass}
              autoComplete="current-password"
            />
            <button type="submit" className="btn-outline text-red-700 border-red-200">
              Excluir conta
            </button>
          </form>
        </section>
      </main>
    </div>
  )
}
