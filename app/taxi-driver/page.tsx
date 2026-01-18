"use client"
import { useState } from "react"
import TaxiDriverRegister from "@/components/pages/TaxiDriverRegister"
import TaxiDriverDashboard from "@/components/pages/TaxiDriverDashboard"
import Link from "next/link"
import { ArrowLeft, Car } from "lucide-react"

export default function TaxiDriverPage() {
  const [loggedInDriver, setLoggedInDriver] = useState(null)
  const [showLogin, setShowLogin] = useState(false)

  if (loggedInDriver) {
    return <TaxiDriverDashboard driver={loggedInDriver} onLogout={() => setLoggedInDriver(null)} />
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-400 via-cyan-300 to-blue-400 relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-yellow-300/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-orange-300/20 rounded-full blur-3xl" />
      </div>

      <header className="relative z-10 px-4 py-4 md:px-8 md:py-6">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <Link href="/">
            <button className="text-sky-700 hover:text-sky-900 hover:bg-white/50 transition-all duration-300 px-4 py-2 rounded-lg flex items-center gap-2 font-medium">
              <ArrowLeft className="w-4 h-4" />
              Volver
            </button>
          </Link>
          <div className="flex items-center gap-2 text-sky-900 font-medium">
            <Car className="w-5 h-5 text-orange-500" />
            <span>Portal de taxistas</span>
          </div>
        </div>
      </header>

      <main className="relative z-10 px-4 py-8 md:py-12">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-10">
            <h1 className="text-3xl md:text-4xl font-extralight text-sky-900 mb-2">
              Portal de <span className="text-orange-600">taxistas</span>
            </h1>
            <p className="text-sky-700 font-light">Regístrate o accede a tu cuenta para gestionar reservas</p>
          </div>

          <div className="flex md:hidden gap-2 mb-6">
            <button
              onClick={() => setShowLogin(false)}
              className={`flex-1 px-4 py-2 rounded-lg font-medium transition ${
                !showLogin ? "bg-orange-500 hover:bg-orange-600 text-white" : "bg-white/80 border-white text-sky-700"
              }`}
            >
              Registrarse
            </button>
            <button
              onClick={() => setShowLogin(true)}
              className={`flex-1 px-4 py-2 rounded-lg font-medium transition ${
                showLogin ? "bg-orange-500 hover:bg-orange-600 text-white" : "bg-white/80 border-white text-sky-700"
              }`}
            >
              Iniciar sesión
            </button>
          </div>

          <div className="grid md:grid-cols-2 gap-6 md:gap-8">
            <div className={`${showLogin ? "hidden md:block" : ""}`}>
              <TaxiDriverRegister onRegistered={() => setShowLogin(true)} />
            </div>
            <div className={`${!showLogin ? "hidden md:block" : ""}`}>
              <TaxiDriverDashboard onLogout={() => setLoggedInDriver(null)} onLogin={setLoggedInDriver} />
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
