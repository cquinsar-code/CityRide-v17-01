"use client"

import { useState } from "react"
import Link from "next/link"
import { Shield, Lock, User, AlertCircle } from "lucide-react"

interface AdminLoginProps {
  onLogin: (admin: { username: string }) => void
}

export default function AdminLogin({ onLogin }: AdminLoginProps) {
  const [formData, setFormData] = useState({ username: "", password: "" })
  const [error, setError] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsSubmitting(true)

    // Simulación de login
    setTimeout(() => {
      const isValid =
        formData.username === "808334" &&
        formData.password === "Lomosilva.2025"

      if (isValid) {
        onLogin({ username: formData.username })
      } else {
        setError("Credenciales inválidas")
      }

      setIsSubmitting(false)
    }, 500)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-400 via-cyan-300 to-blue-400 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Fondos decorativos */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-yellow-300/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-orange-300/20 rounded-full blur-3xl" />
      </div>

      {/* Botón volver */}
      <Link
        href="/"
        className="absolute top-4 left-4 z-10 text-sky-700 hover:text-sky-900 hover:bg-white/50 transition-all duration-300 px-4 py-2 rounded-lg flex items-center gap-2 font-medium"
      >
        Volver
      </Link>

      {/* Tarjeta login */}
      <div className="w-full max-w-md relative z-10">
        <div className="bg-white/95 border border-sky-200 backdrop-blur-xl shadow-2xl rounded-2xl">
          <div className="text-center pb-6 px-6 pt-8">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center mx-auto mb-4 shadow-lg">
              <Shield className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-2xl font-medium text-sky-900">Acceso Administrador</h2>
          </div>

          <div className="px-6 pb-8">
            {/* Error */}
            {error && (
              <div className="mb-4 flex items-start gap-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
                <p className="text-red-700 text-sm">{error}</p>
              </div>
            )}

            {/* Formulario */}
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Usuario */}
              <div>
                <label className="block text-sm font-medium text-sky-700 mb-2">
                  <User className="w-4 h-4 inline mr-2 text-orange-500" />
                  Usuario
                </label>
                <input
                  type="text"
                  value={formData.username}
                  onChange={(e) =>
                    setFormData({ ...formData, username: e.target.value })
                  }
                  required
                  className="w-full h-12 bg-white border-sky-200 border px-4 rounded-lg text-sky-900 focus:ring-2 focus:ring-orange-400 focus:border-transparent"
                />
              </div>

              {/* Contraseña */}
              <div>
                <label className="block text-sm font-medium text-sky-700 mb-2">
                  <Lock className="w-4 h-4 inline mr-2 text-orange-500" />
                  Contraseña
                </label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                  required
                  className="w-full h-12 bg-white border-sky-200 border px-4 rounded-lg text-sky-900 focus:ring-2 focus:ring-orange-400 focus:border-transparent"
                />
              </div>

              {/* Botón */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full h-12 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-medium transition-all duration-300 rounded-lg"
              >
                {isSubmitting ? "Cargando..." : "Iniciar sesión"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
