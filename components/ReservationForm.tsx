"use client"
import type React from "react"
import { useState, useEffect } from "react"
import { useLanguage } from "@/context/LanguageContext"
import { AlertCircle, CheckCircle, MapPin } from "lucide-react"
import { reverseGeocode } from "@/lib/geoapify"

interface Reservation {
  id: string
  name: string
  phone: string
  pickupDate: string
  pickupTime: string
  pickupLocation: string
  destination: string
  adults: number
  children: number
  pmr: number
  observations: string
  timestamp: Date
  sku: string
  status: "active" | "cancelled"
  driverId?: string
  clientLocationTracking?: boolean
  clientLocation?: { lat: number; lon: number; address: string }
  lastLocationUpdate?: string
}

export default function ReservationForm() {
  const { t } = useLanguage()
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    pickupDate: "",
    pickupTime: "",
    pickupLocation: "",
    destination: "",
    adults: 1,
    children: 0,
    pmr: 0,
    observations: "",
  })
  const [locationTrackingEnabled, setLocationTrackingEnabled] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)
  const [gpsLoading, setGpsLoading] = useState(false)
  const [gpsError, setGpsError] = useState("")
  const [watchId, setWatchId] = useState<number | null>(null)

  useEffect(() => {
    return () => {
      if (watchId !== null) {
        navigator.geolocation.clearWatch(watchId)
      }
    }
  }, [watchId])

  const handleGenerateLocation = () => {
    setGpsLoading(true)
    setGpsError("")
    if (!navigator.geolocation) {
      setGpsError(t("form.geolocation_not_available") || "La geolocalización no está disponible")
      setGpsLoading(false)
      return
    }
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords
        const result = await reverseGeocode(latitude, longitude)
        setFormData((prev) => ({
          ...prev,
          pickupLocation: result.address,
        }))
        setGpsLoading(false)
      },
      (err) => {
        console.log("[v0] GPS error:", err.message)
        setGpsError(t("form.gps_error") || `Por favor, activa el GPS: ${err.message}`)
        setGpsLoading(false)
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      },
    )
  }

  const handleLocationTrackingToggle = () => {
    if (!locationTrackingEnabled) {
      if (!navigator.geolocation) {
        setGpsError("La geolocalización no está disponible")
        return
      }

      const id = navigator.geolocation.watchPosition(
        (position) => {
          console.log("[v0] Location tracked:", position.coords)
        },
        (err) => {
          console.log("[v0] Tracking error:", err)
          setGpsError("Error al rastrear ubicación")
          setLocationTrackingEnabled(false)
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0,
        },
      )
      setWatchId(id)
      setLocationTrackingEnabled(true)
    } else {
      if (watchId !== null) {
        navigator.geolocation.clearWatch(watchId)
        setWatchId(null)
      }
      setLocationTrackingEnabled(false)
    }
  }

  const validatePhone = (phone: string): boolean => {
    const phoneRegex = /^\+\d{1,3}\d{6,14}$/
    return phoneRegex.test(phone)
  }

  const generateSKU = (): string => {
    return `SKU-${Date.now().toString().slice(-6)}`
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSuccess(false)

    if (!validatePhone(formData.phone)) {
      setError(t("form.phone_error"))
      return
    }

    const reservation: Reservation = {
      id: Math.random().toString(36).substr(2, 9),
      ...formData,
      adults: Number(formData.adults),
      children: Number(formData.children),
      pmr: Number(formData.pmr),
      timestamp: new Date(),
      sku: generateSKU(),
      status: "active",
      clientLocationTracking: locationTrackingEnabled,
      lastLocationUpdate: new Date().toISOString(),
    }

    const reservations = JSON.parse(localStorage.getItem("reservations") || "[]")
    reservations.push(reservation)
    localStorage.setItem("reservations", JSON.stringify(reservations))

    if (watchId !== null) {
      navigator.geolocation.clearWatch(watchId)
      setWatchId(null)
    }

    setSuccess(true)
    setLocationTrackingEnabled(false)
    setFormData({
      name: "",
      phone: "",
      pickupDate: "",
      pickupTime: "",
      pickupLocation: "",
      destination: "",
      adults: 1,
      children: 0,
      pmr: 0,
      observations: "",
    })
    setTimeout(() => setSuccess(false), 3000)
  }

  return (
    <div className="bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl p-6 md:p-8">
      {error && (
        <div className="mb-4 flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-lg">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <p className="text-red-700 text-sm">{error}</p>
        </div>
      )}
      {success && (
        <div className="mb-4 flex items-start gap-3 p-4 bg-green-50 border border-green-200 rounded-lg">
          <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
          <p className="text-green-700 text-sm">{t("form.success")}</p>
        </div>
      )}
      {gpsError && (
        <div className="mb-4 flex items-start gap-3 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
          <p className="text-yellow-700 text-sm">{gpsError}</p>
        </div>
      )}
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-sky-900 mb-2">{t("form.name")}</label>
          <input
            type="text"
            required
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full px-4 py-2 border border-sky-200 rounded-lg focus:ring-2 focus:ring-orange-400 focus:border-transparent"
            placeholder={t("form.name")}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-sky-900 mb-2">{t("form.phone")}</label>
          <p className="text-xs text-sky-600 mb-2">{t("form.phone_help")}</p>
          <input
            type="tel"
            required
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            className="w-full px-4 py-2 border border-sky-200 rounded-lg focus:ring-2 focus:ring-orange-400 focus:border-transparent"
            placeholder="+34612345678"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-sky-900 mb-2">{t("form.pickup_date")}</label>
          <input
            type="date"
            required
            value={formData.pickupDate}
            onChange={(e) => setFormData({ ...formData, pickupDate: e.target.value })}
            className="w-full px-4 py-2 border border-sky-200 rounded-lg focus:ring-2 focus:ring-orange-400 focus:border-transparent"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-sky-900 mb-2">{t("form.pickup_time")}</label>
          <input
            type="time"
            required
            value={formData.pickupTime}
            onChange={(e) => setFormData({ ...formData, pickupTime: e.target.value })}
            className="w-full px-4 py-2 border border-sky-200 rounded-lg focus:ring-2 focus:ring-orange-400 focus:border-transparent"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-sky-900 mb-2">{t("form.pickup_location")}</label>
          <div className="flex flex-col sm:flex-row gap-2">
            <input
              type="text"
              required
              value={formData.pickupLocation}
              onChange={(e) => setFormData({ ...formData, pickupLocation: e.target.value })}
              className="flex-1 px-4 py-2 border border-sky-200 rounded-lg focus:ring-2 focus:ring-orange-400 focus:border-transparent"
              placeholder={t("form.pickup_location")}
            />
            <button
              type="button"
              onClick={handleGenerateLocation}
              disabled={gpsLoading}
              className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 disabled:bg-orange-300 transition font-medium text-sm whitespace-nowrap"
            >
              {gpsLoading ? "..." : t("form.generate_auto")}
            </button>
          </div>
        </div>

        <div className="p-4 border border-sky-200 rounded-lg bg-sky-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <MapPin className={`w-5 h-5 ${locationTrackingEnabled ? "text-orange-500" : "text-sky-600"}`} />
              <label className="text-sm font-medium text-sky-900">{t("form.location_tracking")}</label>
            </div>
            <button
              type="button"
              onClick={handleLocationTrackingToggle}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                locationTrackingEnabled ? "bg-orange-500" : "bg-gray-300"
              }`}
            >
              <span
                className={`absolute h-4 w-4 rounded-full bg-white transition-all ${
                  locationTrackingEnabled ? "right-1" : "left-1"
                }`}
              />
            </button>
          </div>
          {locationTrackingEnabled && <p className="text-xs text-orange-600 mt-2">{t("form.location_enabled")}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-sky-900 mb-2">{t("form.destination")}</label>
          <p className="text-xs text-sky-600 mb-2">{t("form.destination_help")}</p>
          <input
            type="text"
            value={formData.destination}
            onChange={(e) => setFormData({ ...formData, destination: e.target.value })}
            className="w-full px-4 py-2 border border-sky-200 rounded-lg focus:ring-2 focus:ring-orange-400 focus:border-transparent"
            placeholder={t("form.destination")}
          />
        </div>
        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="block text-sm font-medium text-sky-900 mb-2">{t("form.adults")}</label>
            <input
              type="number"
              min="0"
              value={formData.adults}
              onChange={(e) => setFormData({ ...formData, adults: Number(e.target.value) })}
              className="w-full px-4 py-2 border border-sky-200 rounded-lg focus:ring-2 focus:ring-orange-400 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-sky-900 mb-2">{t("form.children")}</label>
            <input
              type="number"
              min="0"
              value={formData.children}
              onChange={(e) => setFormData({ ...formData, children: Number(e.target.value) })}
              className="w-full px-4 py-2 border border-sky-200 rounded-lg focus:ring-2 focus:ring-orange-400 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-sky-900 mb-2">{t("form.pmr")}</label>
            <input
              type="number"
              min="0"
              value={formData.pmr}
              onChange={(e) => setFormData({ ...formData, pmr: Number(e.target.value) })}
              className="w-full px-4 py-2 border border-sky-200 rounded-lg focus:ring-2 focus:ring-orange-400 focus:border-transparent"
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-sky-900 mb-2">{t("form.special_observations")}</label>
          <textarea
            value={formData.observations}
            onChange={(e) => setFormData({ ...formData, observations: e.target.value })}
            maxLength={1000}
            className="w-full px-4 py-2 border border-sky-200 rounded-lg focus:ring-2 focus:ring-orange-400 focus:border-transparent min-h-24 resize-none"
            placeholder={t("form.special_observations")}
          />
        </div>
        <button
          type="submit"
          className="w-full py-3 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-medium rounded-lg transition-all duration-300"
        >
          {t("form.submit")}
        </button>
      </form>
      <div className="mt-6 pt-6 border-t border-sky-200 space-y-3 text-xs text-sky-600">
        <p>{t("footer.contact")}</p>
      </div>
    </div>
  )
}
