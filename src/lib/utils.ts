import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: Date | string | null | undefined) {
  if (!date) return "—"
  const d = typeof date === "string" ? new Date(date) : date
  return d.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  })
}

export function generateCertificateCode() {
  const year = new Date().getFullYear()
  const random = Math.floor(Math.random() * 1000000)
    .toString()
    .padStart(6, "0")
  return `BC-${year}-${random}`
}
