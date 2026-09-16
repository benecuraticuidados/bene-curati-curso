"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Loader2, CheckCircle2, XCircle } from "lucide-react"

type Option = { id: string; text: string; order: number }
type Question = {
  id: string
  text: string
  type: string
  order: number
  options: Option[]
}

export default function QuizForm({
  quizId,
  questions,
  minScore,
  attemptNum,
}: {
  quizId: string
  questions: Question[]
  minScore: number
  attemptNum: number
}) {
  const router = useRouter()
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<null | {
    score: number
    maxScore: number
    passed: boolean
    percent: number
    details?: { questionId: string; correct: boolean; explanation?: string }[]
  }>(null)

  function selectOption(questionId: string, optionId: string) {
    setAnswers((prev) => ({ ...prev, [questionId]: optionId }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    if (Object.keys(answers).length < questions.length) {
      if (!confirm("Você não respondeu todas as questões. Deseja enviar mesmo assim?")) {
        return
      }
    }

    setLoading(true)
    try {
      const res = await fetch("/api/avaliacoes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          quizId,
          answers,
          attemptNum,
        }),
      })

      const data = await res.json()
      if (!res.ok) {
        alert(data.error || "Erro ao enviar avaliação")
        setLoading(false)
        return
      }

      setResult(data)
      router.refresh()
    } catch {
      alert("Erro de conexão. Tente novamente.")
    } finally {
      setLoading(false)
    }
  }

  if (result) {
    return (
      <div className="card text-center">
        {result.passed ? (
          <CheckCircle2 className="w-16 h-16 text-green-600 mx-auto mb-4" />
        ) : (
          <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
        )}

        <h2 className="text-xl font-bold text-gray-900 mb-2">
          {result.passed ? "APROVADO" : "NÃO APROVADO"}
        </h2>

        <p className="text-3xl font-bold text-wine mb-1">
          {result.score.toFixed(1)} / {result.maxScore}
        </p>
        <p className="text-gray-600 mb-6">
          Aproveitamento: {result.percent.toFixed(0)}%
          {!result.passed && (
            <span className="block text-sm text-gray-500 mt-1">
              Nota mínima necessária: {(minScore * 10).toFixed(0)}%
            </span>
          )}
        </p>

        {result.passed ? (
          <p className="text-green-700 text-sm mb-6">
            Parabéns! Você atingiu a nota mínima. Continue para o certificado.
          </p>
        ) : (
          <p className="text-red-600 text-sm mb-6">
            Você não atingiu a nota mínima. Revise o conteúdo e tente novamente
            (se ainda houver tentativas).
          </p>
        )}

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <a href="/avaliacoes" className="btn-outline">
            Voltar às avaliações
          </a>
          {result.passed && (
            <a href="/certificado" className="btn-primary">
              Ir para o certificado
            </a>
          )}
        </div>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {questions.map((q, idx) => (
        <div key={q.id} className="card">
          <p className="text-sm font-medium text-wine mb-1">
            Questão {idx + 1} de {questions.length}
          </p>
          <p className="font-medium text-gray-900 mb-4">{q.text}</p>

          <div className="space-y-2">
            {q.options.map((opt) => (
              <label
                key={opt.id}
                className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition ${
                  answers[q.id] === opt.id
                    ? "border-wine bg-wine/5"
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <input
                  type="radio"
                  name={q.id}
                  value={opt.id}
                  checked={answers[q.id] === opt.id}
                  onChange={() => selectOption(q.id, opt.id)}
                  className="mt-1 accent-[#722F37]"
                />
                <span className="text-sm text-gray-800">{opt.text}</span>
              </label>
            ))}
          </div>
        </div>
      ))}

      <div className="sticky bottom-4 bg-white border border-gray-200 rounded-xl p-4 shadow-lg flex flex-col sm:flex-row items-center justify-between gap-3">
        <p className="text-sm text-gray-500">
          {Object.keys(answers).length} de {questions.length} respondidas
        </p>
        <button
          type="submit"
          disabled={loading}
          className="btn-primary w-full sm:w-auto flex items-center justify-center gap-2"
        >
          {loading && <Loader2 className="w-4 h-4 animate-spin" />}
          {loading ? "Enviando..." : "Enviar avaliação"}
        </button>
      </div>
    </form>
  )
}
