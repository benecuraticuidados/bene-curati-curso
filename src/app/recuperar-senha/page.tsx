import Link from "next/link"
import Image from "next/image"

const SUPPORT = "contato@benecurati.com.br"

export default function RecuperarSenhaPage() {
  const subject = encodeURIComponent("Esqueci minha senha — Curso Bene Curati")
  const body = encodeURIComponent(
    "Olá, esqueci a senha da minha conta do curso.\n\nNome:\nE-mail cadastrado:\n"
  )
  const mailto = `mailto:${SUPPORT}?subject=${subject}&body=${body}`

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Image src="/logo-bene-curati-v2.png" alt="" width={64} height={64} className="mx-auto mb-3" />
          <h1 className="text-2xl font-bold">Esqueci minha senha</h1>
        </div>
        <div className="card space-y-4 text-sm text-gray-700">
          <p>
            Para redefinir sua senha, fale com o suporte da Bene Curati Cuidados pelo e-mail:
          </p>
          <p className="text-center">
            <a href={mailto} className="text-wine font-bold text-base hover:underline">
              {SUPPORT}
            </a>
          </p>
          <p>
            Informe o <strong>nome</strong> e o <strong>e-mail cadastrado</strong> no curso. Nossa equipe confirma a
            conta e envia uma nova senha de acesso.
          </p>
          <a href={mailto} className="btn-primary w-full text-center block">
            Abrir e-mail de suporte
          </a>
        </div>
        <p className="text-center text-sm text-gray-500 mt-6">
          <Link href="/login" className="text-wine hover:underline">
            Voltar ao login
          </Link>
        </p>
      </div>
    </div>
  )
}
