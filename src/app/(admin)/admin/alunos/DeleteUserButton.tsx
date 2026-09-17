"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

export default function DeleteUserButton({
  userId,
  name,
}: {
  userId: string
  name: string
}) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  async function handleDelete() {
    if (!confirm(`Excluir a conta de ${name}? Esta ação não pode ser desfeita.`)) return
    if (!confirm("Confirma a exclusão definitiva?")) return

    setLoading(true)
    try {
      const res = await fetch("/api/admin/alunos", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      })
      const data = await res.json()
      if (!res.ok) {
        alert(data.error || "Erro ao excluir")
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
      onClick={handleDelete}
      disabled={loading}
      className="text-xs font-medium px-3 py-1.5 rounded-lg text-red-700 hover:bg-red-50 border border-red-200 disabled:opacity-50"
    >
      {loading ? "..." : "Excluir"}
    </button>
  )
}
