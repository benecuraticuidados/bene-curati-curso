"use client"

import { useState, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { Search, CheckCircle2, XCircle, Loader2 } from "lucide-react"

function ValidarForm() {
  const searchParams = useSearchParams()
  const initialCode = searchParams.get("codigo") || ""

  const [code, setCode] = useState(initialCode)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<null | {
    valid: boolean
    studentName?: string
    courseName?: string
    workloadHours?: number
    issuedAt?: string
    code?: string
    message?: string
    invalidated?: boolean
  }>(null)

  async function handleValidate(e: React.FormEvent) {
    e.preventDefault()
    if (!code.trim()) return

    setLoading(true)
    setResult(null)

    try {
      const res = await fetch(
        `/api/certificado/validar?codigo=${encodeURIComponent(code.trim())}`
      )
      const data = await res.json()
      setResult(data)
    } catch {
      setResult({ valid: false, message: "Erro ao consultar. Tente novamente." })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="border-b border-gray-100 bg-white">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center gap-3">
          <Link href="/">
            <Image
              src="/logo-bene-curati-v2.png"
              alt="Bene Curati Cuidados"
              width={48}
              height={48}
              className="object-contain"
            />
          </Link>
          <div>
            <p className="font-bold text-wine text-sm">Bene Curati Cuidados</p>
            <p className="text-xs text-gray-500">Validação de Certificado</p>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-xl mx-auto w-full px-4 py-12">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900">
            Validar Certificado
          </h1>
          <p className="text-gray-500 mt-2 text-sm">
            Informe o código de autenticação para confirmar a autenticidade.
          </p>
        </div>

        <form onSubmit={handleValidate} className="card mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Código do certificado
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              placeholder="BC-2026-000001"
              className="input-field font-mono"
              required
            />
            <button
              type="submit"
              disabled={loading}
              className="btn-primary px-5 flex items-center gap-2"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Search className="w-5 h-5" />
              )}
              Validar
            </button>
          </div>
        </form>

        {result && (
          <div
            className={`card border-2 ${
              result.valid
                ? "border-green-200 bg-green-50/50"
                : "border-red-200 bg-red-50/50"
            }`}
          >
            {result.valid ? (
              <>
                <div className="flex items-center gap-2 text-green-700 mb-4">
                  <CheckCircle2 className="w-6 h-6" />
                  <span className="font-bold text-lg">CERTIFICADO VÁLIDO</span>
                </div>
                <dl className="space-y-3 text-sm">
                  <div>
                    <dt className="text-gray-500">Aluno</dt>
                    <dd className="font-semibold text-gray-900">
                      {result.studentName}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-gray-500">Curso</dt>
                    <dd className="font-semibold text-gray-900">
                      {result.courseName}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-gray-500">Carga horária</dt>
                    <dd className="font-semibold text-gray-900">
                      {result.workloadHours || 210} horas (204h teóricas + 6h práticas)
                    </dd>
                  </div>
                  <div>
                    <dt className="text-gray-500">Data de conclusão</dt>
                    <dd className="font-semibold text-gray-900">
                      {result.issuedAt
                        ? new Date(result.issuedAt).toLocaleDateString("pt-BR")
                        : "—"}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-gray-500">Código</dt>
                    <dd className="font-mono font-semibold text-wine">
                      {result.code}
                    </dd>
                  </div>
                </dl>
                <p className="text-xs text-gray-500 mt-6 pt-4 border-t border-green-200">
                  Emitido por Bene Curati Cuidados • CNPJ 60.725.201/0001-88
                </p>
              </>
            ) : (
              <>
                <div className="flex items-center gap-2 text-red-700 mb-3">
                  <XCircle className="w-6 h-6" />
                  <span className="font-bold text-lg">
                    {result.invalidated ? "CERTIFICADO INVALIDADO" : "CERTIFICADO NÃO ENCONTRADO"}
                  </span>
                </div>
                <p className="text-sm text-gray-600">
                  {result.message ||
                    "O código informado não corresponde a nenhum certificado válido emitido pela Bene Curati Cuidados."}
                </p>
              </>
            )}
          </div>
        )}

        <p className="text-center text-xs text-gray-400 mt-10">
          Bene Curati Cuidados • CNPJ 60.725.201/0001-88
          <br />
          Apenas informações necessárias para autenticação são exibidas.
        </p>
      </main>
    </div>
  )
}

export default function ValidarPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Carregando...</div>}>
      <ValidarForm />
    </Suspense>
  )
}
