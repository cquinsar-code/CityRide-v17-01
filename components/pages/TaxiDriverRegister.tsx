"use client"

import type React from "react"
import { useState } from "react"
import { AlertCircle, CheckCircle, Eye, EyeOff } from "lucide-react"

const islandMunicipalities: Record<string, string[]> = {
  "Gran Canaria": [
    "Agaete",
    "Agüimes",
    "Artenara",
    "Arucas",
    "Firgas",
    "Gáldar",
    "Ingenio",
    "La Aldea de San Nicolás",
    "Las Palmas de Gran Canaria",
    "Mogán",
    "Moya",
    "San Bartolomé de Tirajana",
    "Santa Brígida",
    "Santa Lucía de Tirajana",
    "Santa María de Guía de Gran Canaria",
    "Tejeda",
    "Telde",
    "Teror",
    "Valleseco",
    "Valsequillo",
    "Vega de San Mateo",
  ],
  Tenerife: [
    "Adeje",
    "Arafo",
    "Arico",
    "Arona",
    "Buenavista del Norte",
    "Candelaria",
    "El Rosario",
    "El Sauzal",
    "El Tanque",
    "Fasnia",
    "Garachico",
    "Granadilla de Abona",
    "Guía de Isora",
    "Güímar",
    "Icod de los Vinos",
    "La Guancha",
    "La Matanza de Acentejo",
    "La Orotava",
    "La Victoria de Acentejo",
    "Los Realejos",
    "Los Silos",
    "Puerto de la Cruz",
    "San Cristóbal de La Laguna",
    "San Juan de la Rambla",
    "San Miguel de Abona",
    "Santa Cruz de Tenerife",
    "Santa Úrsula",
    "Santiago del Teide",
    "Tacoronte",
    "Tegueste",
    "Vilaflor de Chasna",
  ],
  Fuerteventura: ["Antigua", "Betancuria", "La Oliva", "Pájara", "Puerto del Rosario", "Tuineje"],
  Lanzarote: ["Arrecife", "Haría", "San Bartolomé", "Teguise", "Tías", "Tinajo", "Yaiza"],
}

interface DriverData {
  name: string
  phone: string
  email: string
  license: string
  island: string
  municipality: string
  vehiclePlate: string
  vehicleModel: string
  seats: number
  pmrAdapted: boolean
  username: string
  password: string
  confirmPassword: string
}

export default function TaxiDriverRegister({ onRegistered }: { onRegistered?: () => void }) {
  const islands = Object.keys(islandMunicipalities)

  const [formData, setFormData] = useState<DriverData>({
    name: "",
    phone: "",
    email: "",
    license: "",
    island: islands[0],
    municipality: islandMunicipalities[islands[0]][0],
    vehiclePlate: "",
    vehicleModel: "",
    seats: 4,
    pmrAdapted: false,
    username: "",
    password: "",
    confirmPassword: "",
  })

  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [passwordMatch, setPasswordMatch] = useState(true)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    const checked = (e.target as HTMLInputElement).checked

    if (type === "checkbox") {
      setFormData((prev) => ({ ...prev, [name]: checked }))
      return
    }

    if (name === "seats") {
      setFormData((prev) => ({ ...prev, seats: Number(value) }))
      return
    }

    if (name === "island") {
      setFormData((prev) => ({
        ...prev,
        island: value,
        municipality: islandMunicipalities[value][0],
      }))
      return
    }

    setFormData((prev) => ({ ...prev, [name]: value }))

    if (name === "password" || name === "confirmPassword") {
      const pwd = name === "password" ? value : formData.password
      const confirm = name === "confirmPassword" ? value : formData.confirmPassword
      setPasswordMatch(pwd === confirm)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSuccess(false)

    if (formData.password !== formData.confirmPassword) {
      setError("Las contraseñas no coinciden")
      return
    }

    if (formData.password.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres")
      return
    }

    const drivers = JSON.parse(localStorage.getItem("taxi_drivers") || "[]")

    const username = formData.username.trim()
    const email = formData.email.trim()

    if (drivers.some((d: any) => d.username === username)) {
      setError("Este usuario ya está registrado")
      return
    }

    if (drivers.some((d: any) => d.email === email)) {
      setError("Este email ya está registrado")
      return
    }

    const { confirmPassword, ...driverData } = formData

    const newDriver = {
      id: Math.random().toString(36).substr(2, 9),
      ...driverData,
      username,
      email,
      seats: Number(formData.seats),
      registeredAt: new Date().toISOString(),
    }

    drivers.push(newDriver)
    localStorage.setItem("taxi_drivers", JSON.stringify(drivers))

    const logs = JSON.parse(localStorage.getItem("admin_logs") || "[]")
    logs.push({
      id: Math.random().toString(36).substr(2, 9),
      type: "driver_registration",
      username,
      timestamp: new Date().toISOString(),
      message: `El taxista ${username} se ha registrado el ${new Date().toLocaleDateString(
        "es-ES",
      )} a las ${new Date().toLocaleTimeString("es-ES")}`,
    })
    localStorage.setItem("admin_logs", JSON.stringify(logs))

    setSuccess(true)

    setTimeout(() => {
      onRegistered?.()
    }, 1500)
  }

  const municipalities = islandMunicipalities[formData.island] || []

  return (
    <div className="bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl p-6 md:p-8">
      <h2 className="text-2xl font-semibold text-sky-900 mb-6">Registrarse</h2>

      {error && (
        <div className="mb-4 flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-lg">
          <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
          <p className="text-red-700 text-sm">{error}</p>
        </div>
      )}

      {success && (
        <div className="mb-4 flex items-start gap-3 p-4 bg-green-50 border border-green-200 rounded-lg">
          <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
          <p className="text-green-700 text-sm">Registro completado exitosamente</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* FORMULARIO SIN CAMBIOS VISUALES */}
        {/* (inputs exactamente iguales a los que ya tenías) */}

        {/* ... todo el JSX permanece igual ... */}

        <button
          type="submit"
          className="w-full py-3 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-medium rounded-lg transition-all duration-300"
        >
          Registrarse
        </button>
      </form>
    </div>
  )
}
