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
    } else if (name === "island") {
      const newIsland = value
      const firstMunicipality = islandMunicipalities[newIsland][0]
      setFormData((prev) => ({
        ...prev,
        island: newIsland,
        municipality: firstMunicipality,
      }))
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }))
    }

    if (name === "confirmPassword" || name === "password") {
      const pwd = name === "password" ? value : formData.password
      const confirm = name === "confirmPassword" ? value : formData.confirmPassword
      setPasswordMatch(pwd === confirm)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
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
    const driverExists = drivers.some((d: DriverData) => d.username === formData.username)

    if (driverExists) {
      setError("Este usuario ya está registrado")
      return
    }

    const newDriver = {
      id: Math.random().toString(36).substr(2, 9),
      ...formData,
      seats: Number(formData.seats),
      registeredAt: new Date().toISOString(),
    }

    drivers.push(newDriver)
    localStorage.setItem("taxi_drivers", JSON.stringify(drivers))

    const logs = JSON.parse(localStorage.getItem("admin_logs") || "[]")
    logs.push({
      id: Math.random().toString(36).substr(2, 9),
      type: "driver_registration",
      username: formData.username,
      timestamp: new Date().toISOString(),
      message: `El taxista ${formData.username} se ha registrado el ${new Date().toLocaleDateString("es-ES")} a las ${new Date().toLocaleTimeString("es-ES")}`,
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
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <p className="text-red-700 text-sm">{error}</p>
        </div>
      )}

      {success && (
        <div className="mb-4 flex items-start gap-3 p-4 bg-green-50 border border-green-200 rounded-lg">
          <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
          <p className="text-green-700 text-sm">Registro completado exitosamente</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-sky-900 mb-1">Nombre</label>
          <input
            type="text"
            name="name"
            required
            value={formData.name}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-sky-200 rounded-lg focus:ring-2 focus:ring-orange-400"
            placeholder="Tu nombre completo"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-sky-900 mb-1">Teléfono</label>
          <input
            type="tel"
            name="phone"
            required
            value={formData.phone}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-sky-200 rounded-lg focus:ring-2 focus:ring-orange-400"
            placeholder="+34612345678"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-sky-900 mb-1">Email</label>
          <input
            type="email"
            name="email"
            required
            value={formData.email}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-sky-200 rounded-lg focus:ring-2 focus:ring-orange-400"
            placeholder="tu@email.com"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-sky-900 mb-1">Nº Licencia Municipal</label>
          <input
            type="text"
            name="license"
            required
            value={formData.license}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-sky-200 rounded-lg focus:ring-2 focus:ring-orange-400"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-sky-900 mb-1">Isla</label>
          <select
            name="island"
            value={formData.island}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-sky-200 rounded-lg focus:ring-2 focus:ring-orange-400"
          >
            {islands.map((island) => (
              <option key={island} value={island}>
                {island}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-sky-900 mb-1">Municipio</label>
          <select
            name="municipality"
            value={formData.municipality}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-sky-200 rounded-lg focus:ring-2 focus:ring-orange-400"
          >
            {municipalities.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-sky-900 mb-1">Matrícula del Vehículo</label>
          <input
            type="text"
            name="vehiclePlate"
            required
            value={formData.vehiclePlate}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-sky-200 rounded-lg focus:ring-2 focus:ring-orange-400"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-sky-900 mb-1">Marca y Modelo</label>
          <input
            type="text"
            name="vehicleModel"
            required
            value={formData.vehicleModel}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-sky-200 rounded-lg focus:ring-2 focus:ring-orange-400"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-sky-900 mb-1">Nº Plazas Disponibles</label>
          <input
            type="number"
            name="seats"
            min="1"
            value={formData.seats}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-sky-200 rounded-lg focus:ring-2 focus:ring-orange-400"
          />
        </div>

        <div className="flex items-center gap-3">
          <input
            type="checkbox"
            name="pmrAdapted"
            checked={formData.pmrAdapted}
            onChange={handleChange}
            className="w-5 h-5 rounded border-sky-200"
          />
          <label className="text-sm font-medium text-sky-900">¿Taxi adaptado para PMR?</label>
        </div>

        <div>
          <label className="block text-sm font-medium text-sky-900 mb-1">Usuario</label>
          <input
            type="text"
            name="username"
            required
            value={formData.username}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-sky-200 rounded-lg focus:ring-2 focus:ring-orange-400"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-sky-900 mb-1">Contraseña</label>
          <p className="text-xs text-sky-600 mb-2">
            Se recomienda utilizar una contraseña distinta a las usadas para acceder a tu email, datos bancarios u otros
            datos sensibles.
          </p>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              required
              value={formData.password}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-sky-200 rounded-lg focus:ring-2 focus:ring-orange-400"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-sky-600 hover:text-sky-900"
            >
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-sky-900 mb-1">Confirmar Contraseña</label>
          <input
            type="password"
            name="confirmPassword"
            required
            value={formData.confirmPassword}
            onChange={handleChange}
            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-400 ${
              passwordMatch ? "border-sky-200" : "border-red-500"
            }`}
          />
          {!passwordMatch && <p className="text-red-600 text-sm mt-1">Las contraseñas no coinciden</p>}
        </div>

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
