"use client"

import { useState } from "react"
import { CheckCircle2, Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"

export default function MarkCompleteButton({
  lessonId,
  initiallyCompleted,
}: {
  lessonId: string
  initiallyCompleted: boolean
}) {
  const [completed, setCompleted] = useState(initiallyCompleted)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleMark() {
    if (completed) return
    setLoading(true)

    try {
      const res = await fetch("/api/progress", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lessonId, completed: true }),
      })

      if (res.ok) {
        setCompleted(true)
        router.refresh()
      }
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  if (completed) {
    return (
      <div className="flex items-center gap-2 text-green-700 bg-green-50 px-4 py-3 rounded-lg">
        <CheckCircle2 className="w-5 h-5" />
        <span className="font-medium">Aula concluída</span>
      </div>
    )
  }

  return (
    <button
      onClick={handleMark}
      disabled={loading}
      className="btn-primary w-full sm:w-auto inline-flex items-center justify-center gap-2"
    >
      {loading ? (
        <Loader2 className="w-5 h-5 animate-spin" />
      ) : (
        <CheckCircle2 className="w-5 h-5" />
      )}
      Marcar como concluída
    </button>
  )
}
