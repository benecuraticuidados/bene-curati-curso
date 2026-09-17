"use client"

import Link from "next/link"
import Image from "next/image"
import { useSession, signOut } from "next-auth/react"
import { LogOut, User, BookOpen, Award, LayoutDashboard, ClipboardList } from "lucide-react"
import { useState } from "react"

export default function StudentHeader() {
  const { data: session } = useSession()
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <header className="border-b border-gray-100 bg-white sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        <Link href="/dashboard" className="flex items-center gap-3">
          <Image
            src="/logo-bene-curati-v2.png"
            alt="Bene Curati Cuidados"
            width={44}
            height={44}
            className="object-contain"
          />
          <div className="hidden sm:block">
            <p className="font-bold text-wine text-sm leading-tight">Bene Curati Cuidados</p>
            <p className="text-xs text-gray-500">Área do Aluno</p>
          </div>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-1">
          <Link href="/dashboard" className="flex items-center gap-1.5 px-3 py-2 text-sm text-gray-700 hover:text-wine rounded-lg hover:bg-wine/5 transition">
            <LayoutDashboard className="w-4 h-4" />
            Dashboard
          </Link>
          <Link href="/curso" className="flex items-center gap-1.5 px-3 py-2 text-sm text-gray-700 hover:text-wine rounded-lg hover:bg-wine/5 transition">
            <BookOpen className="w-4 h-4" />
            Meu Curso
          </Link>
          <Link href="/avaliacoes" className="flex items-center gap-1.5 px-3 py-2 text-sm text-gray-700 hover:text-wine rounded-lg hover:bg-wine/5 transition">
            <ClipboardList className="w-4 h-4" />
            Avaliações
          </Link>
          <Link href="/certificado" className="flex items-center gap-1.5 px-3 py-2 text-sm text-gray-700 hover:text-wine rounded-lg hover:bg-wine/5 transition">
            <Award className="w-4 h-4" />
            Certificado
          </Link>
        </nav>

        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2 text-sm text-gray-600">
            <User className="w-4 h-4" />
            <span className="max-w-[140px] truncate">{session?.user?.name}</span>
          </div>
          <button
            onClick={async () => {
              await fetch("/api/logout", { method: "POST" })
              await signOut({ callbackUrl: "/" })
            }}
            className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-wine transition"
            title="Sair"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline">Sair</span>
          </button>

          {/* Mobile menu button */}
          <button
            className="md:hidden p-2 text-gray-600"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {menuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden border-t border-gray-100 bg-white px-4 py-3 space-y-1">
          <Link href="/dashboard" onClick={() => setMenuOpen(false)} className="block px-3 py-2 text-sm text-gray-700 hover:bg-wine/5 rounded-lg">
            Dashboard
          </Link>
          <Link href="/curso" onClick={() => setMenuOpen(false)} className="block px-3 py-2 text-sm text-gray-700 hover:bg-wine/5 rounded-lg">
            Meu Curso
          </Link>
          <Link href="/avaliacoes" onClick={() => setMenuOpen(false)} className="block px-3 py-2 text-sm text-gray-700 hover:bg-wine/5 rounded-lg">
            Avaliações
          </Link>
          <Link href="/certificado" onClick={() => setMenuOpen(false)} className="block px-3 py-2 text-sm text-gray-700 hover:bg-wine/5 rounded-lg">
            Certificado
          </Link>
        </div>
      )}
    </header>
  )
}
