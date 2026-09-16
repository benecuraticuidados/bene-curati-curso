"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

export default function ToggleStudentButton({
  userId,
  isActive,
  name,
}: {
  userId: string
  isActive: boolean
  name: string
}) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  async function handleToggle() {
    const action = isActive ? "bloquear" : "reativar"
    if (!confirm(`Deseja ${action} o aluno ${name}?`)) return

    setLoading(true)
    try {
      const res = await fetch("/api/admin/alunos", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, isActive: !isActive }),
      })
      if (!res.ok) {
        const data = await res.json()
        alert(data.error || "Erro ao atualizar")
      } else {
        router.refresh()
      }
    } catch {
      alert("Erro de conexão")
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handleToggle}
      disabled={loading}
      className={`text-xs font-medium px-3 py-1.5 rounded-lg transition ${
        isActive
          ? "text-red-600 hover:bg-red-50 border border-red-200"
          : "text-green-700 hover:bg-green-50 border border-green-200"
      }`}
    >
      {loading ? "..." : isActive ? "Bloquear" : "Reativar"}
    </button>
  )
}
