"use client"

import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { signOut, useSession } from "next-auth/react"
import {
  LayoutDashboard,
  Users,
  Award,
  BookOpen,
  Settings,
  LogOut,
  Menu,
  X,
} from "lucide-react"
import { useState } from "react"

const links = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/alunos", label: "Alunos", icon: Users },
  { href: "/admin/curso", label: "Curso", icon: BookOpen },
  { href: "/admin/certificados", label: "Certificados", icon: Award },
  { href: "/admin/configuracoes", label: "Configurações", icon: Settings },
]

export default function AdminSidebar() {
  const pathname = usePathname()
  const { data: session } = useSession()
  const [open, setOpen] = useState(false)

  const NavLinks = () => (
    <nav className="space-y-1">
      {links.map(({ href, label, icon: Icon }) => {
        const active =
          href === "/admin"
            ? pathname === "/admin"
            : pathname.startsWith(href)
        return (
          <Link
            key={href}
            href={href}
            onClick={() => setOpen(false)}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition ${
              active
                ? "bg-wine text-white"
                : "text-gray-700 hover:bg-wine/10 hover:text-wine"
            }`}
          >
            <Icon className="w-4 h-4" />
            {label}
          </Link>
        )
      })}
    </nav>
  )

  return (
    <>
      {/* Mobile top bar */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-40 bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Image
            src="/logo-bene-curati-v2.png"
            alt="Bene Curati"
            width={36}
            height={36}
            className="object-contain"
          />
          <span className="font-bold text-wine text-sm">Admin</span>
        </div>
        <button onClick={() => setOpen(!open)} className="p-2 text-gray-600">
          {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile drawer */}
      {open && (
        <div className="lg:hidden fixed inset-0 z-30 bg-black/40" onClick={() => setOpen(false)}>
          <div
            className="absolute left-0 top-0 bottom-0 w-64 bg-white p-4 pt-16"
            onClick={(e) => e.stopPropagation()}
          >
            <NavLinks />
            <div className="mt-6 pt-4 border-t">
              <p className="text-xs text-gray-500 mb-2 px-3">
                {session?.user?.name}
              </p>
              <button
                onClick={async () => {
                  await fetch("/api/logout", { method: "POST" })
                  await signOut({ callbackUrl: "/" })
                }}
                className="flex items-center gap-3 px-3 py-2.5 text-sm text-gray-600 hover:text-wine w-full"
              >
                <LogOut className="w-4 h-4" />
                Sair
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Desktop sidebar */}
      <aside className="hidden lg:flex flex-col w-64 min-h-screen bg-white border-r border-gray-200 fixed left-0 top-0">
        <div className="p-5 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <Image
              src="/logo-bene-curati-v2.png"
              alt="Bene Curati"
              width={44}
              height={44}
              className="object-contain"
            />
            <div>
              <p className="font-bold text-wine text-sm">Bene Curati</p>
              <p className="text-xs text-gray-500">Painel Administrativo</p>
            </div>
          </div>
        </div>

        <div className="flex-1 p-4">
          <NavLinks />
        </div>

        <div className="p-4 border-t border-gray-100">
          <p className="text-xs text-gray-500 mb-2 truncate px-1">
            {session?.user?.name || session?.user?.email}
          </p>
          <button
            onClick={async () => {
                  await fetch("/api/logout", { method: "POST" })
                  await signOut({ callbackUrl: "/" })
                }}
            className="flex items-center gap-2 text-sm text-gray-600 hover:text-wine transition"
          >
            <LogOut className="w-4 h-4" />
            Sair
          </button>
        </div>
      </aside>
    </>
  )
}
