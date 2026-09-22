"use client"

import { useState } from "react"
import { Eye, EyeOff } from "lucide-react"

type Props = {
  name?: string
  label: string
  value: string
  onChange: (v: string) => void
  placeholder?: string
  autoComplete?: string
  required?: boolean
}

export default function PasswordField({
  name,
  label,
  value,
  onChange,
  placeholder = "••••••••",
  autoComplete,
  required = true,
}: Props) {
  const [show, setShow] = useState(false)
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1.5">{label}</label>
      <div className="relative">
        <input
          name={name}
          type={show ? "text" : "password"}
          required={required}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="input-field pr-11"
          placeholder={placeholder}
          autoComplete={autoComplete}
        />
        <button
          type="button"
          onClick={() => setShow((s) => !s)}
          className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-gray-500 hover:text-wine"
          aria-label={show ? "Ocultar senha" : "Mostrar senha"}
        >
          {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        </button>
      </div>
    </div>
  )
}
