"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useLanguage } from "@/context/LanguageContext"
import { AlertCircle, CheckCircle, MapPin } from "lucide-react"
import { reverseGeocode } from "@/lib/geoapify"

export interface Reservation {
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
  const [gpsLoading, setGpsLoading] = useState(false)
  const [gpsError, setGpsError] = useState("")
  const [watchId, setWatchId] = useState<number | null>(null)

  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    return () => {
      if (watchId !== null) navigator.geolocation.clearWatch(watchId)
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
        try {
          const result = await reverseGeocode(latitude, longitude)
          setFormData((prev) => ({ ...prev, pickupLocation: result.address }))
        } catch {
          setGpsError("Error obteniendo la dirección")
        }
        setGpsLoading(false)
      },
      (err) => {
        console.error("[v0] GPS error:", err.message)
        setGpsError(t("form.gps_error") || `Por favor, activa el GPS: ${err.message}`)
        setGpsLoading(false)
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 },
    )
  }

  const handleLocationTrackingToggle = () => {
    if (!locationTrackingEnabled) {
      if (!navigator.geolocation) {
        setGpsError("La geolocalización no está disponible")
        return
      }

      const id = navigator.geolocation.watchPosition(
        (position) => console.log("[v0] Location tracked:", position.coords),
        (err) => {
          console.error("[v0] Tracking error:", err)
          setGpsError("Error al rastrear ubicación")
          setLocationTrackingEnabled(false)
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 },
      )
      setWatchId(id)
      setLocationTrackingEnabled(true)
    } else {
      if (watchId !== null) navigator.geolocation.clearWatch(watchId)
      setWatchId(null)
      setLocationTrackingEnabled(false)
    }
  }

  const validatePhone = (phone: string): boolean => /^\+\d{1,3}\d{6,14}$/.test(phone)
  const generateSKU = (): string => `SKU-${Date.now().toString().slice(-6)}`

  const handleSubmit = (e: React.FormEvent) => {
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

    const reservations: Reservation[] = JSON.parse(localStorage.getItem("reservations") || "[]")
    reservations.push(reservation)
    localStorage.setItem("reservations", JSON.stringify(reservations))

    if (watchId !== null) navigator.geolocation.clearWatch(watchId)
    setWatchId(null)
    setLocationTrackingEnabled(false)
    setSuccess(true)

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
      {error && <AlertBox type="error" message={error} />}
      {success && <AlertBox type="success" message={t("form.success")} />}
      {gpsError && <AlertBox type="warning" message={gpsError} />}

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Inputs y toggles */}
        {/* ... Puedes incluir los componentes auxiliares TextInput, NumberInput, LocationTrackingToggle */}
      </form>

      <div className="mt-6 pt-6 border-t border-sky-200 space-y-3 text-xs text-sky-600">
        <p>{t("footer.contact")}</p>
      </div>
    </div>
  )
}

// AlertBox, TextInput, NumberInput, LocationTrackingToggle como en el ejemplo anterior
