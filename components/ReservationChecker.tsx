"use client"

import { useState } from "react"
import { useLanguage } from "@/context/LanguageContext"
import { CheckCircle, Clock, MapIcon, AlertCircle } from "lucide-react"
import dynamic from "next/dynamic"

const MapRouteViewer = dynamic(() => import("./MapRouteViewer"), { ssr: false })

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
  acceptedBy?: string
  acceptedAt?: string
}

export interface DriverInfo {
  name: string
  phone: string
  license: string
  municipality: string
  vehicleModel: string
  vehiclePlate: string
  seats: number
  pmrAdapted: boolean
}

export interface DirectionsInfo {
  time: number
  distance: number
}

export default function ReservationChecker() {
  const { t } = useLanguage()

  // Estados principales
  const [phone, setPhone] = useState("")
  const [selectedReservation, setSelectedReservation] = useState<Reservation | null>(null)
  const [driverInfo, setDriverInfo] = useState<DriverInfo | null>(null)
  const [directionsInfo, setDirectionsInfo] = useState<DirectionsInfo | null>(null)
  const [loadingDirections, setLoadingDirections] = useState(false)
  const [driverCoordinates, setDriverCoordinates] = useState<{ lat: number; lon: number } | null>(null)
  const [clientCoordinates, setClientCoordinates] = useState<{ lat: number; lon: number } | null>(null)

  // Cancelación de reservas
  const [showCancelForm, setShowCancelForm] = useState(false)
  const [cancelPhone, setCancelPhone] = useState("")
  const [cancelReservations, setCancelReservations] = useState<Reservation[]>([])
  const [showCancelList, setShowCancelList] = useState(false)
  const [cancelMessage, setCancelMessage] = useState("")

  // Obtener direcciones de ruta
  const fetchDirections = async (pickupLocation: string, destination: string): Promise<DirectionsInfo | null> => {
    try {
      const response = await fetch("/api/directions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pickupLocation, destination }),
      })

      if (!response.ok) return null

      const data = await response.json()

      if (data.driverCoordinates && data.clientCoordinates) {
        setDriverCoordinates(data.driverCoordinates)
        setClientCoordinates(data.clientCoordinates)
      }

      return { time: data.time, distance: data.distance }
    } catch (error) {
      console.error("Error fetching directions:", error)
      return null
    }
  }

  // Comprobar reserva por teléfono
  const checkReservation = async () => {
    const stored: Reservation[] = JSON.parse(localStorage.getItem("reservations") || "[]")
    const drivers = JSON.parse(localStorage.getItem("taxi_drivers") || "[]")

    const userReservations = stored.filter((r) => r.phone === phone && r.status === "active")
    if (userReservations.length === 0) {
      alert(t("check.no_driver"))
      clearReservationState()
      return
    }

    const now = new Date()
    const validReservation = userReservations.find((r) => {
      const pickupDateTime = new Date(`${r.pickupDate}T${r.pickupTime}`)
      const diffMinutes = (pickupDateTime.getTime() - now.getTime()) / 60000
      return diffMinutes > 0 && diffMinutes <= 60
    })

    if (!validReservation) {
      alert(t("check.outside_time"))
      clearReservationState()
      return
    }

    setSelectedReservation(validReservation)

    if (validReservation.acceptedBy) {
      const driver = drivers.find((d: any) => d.username === validReservation.acceptedBy)
      if (driver) {
        setDriverInfo({
          name: driver.name,
          phone: driver.phone,
          license: driver.license,
          municipality: driver.municipality,
          vehicleModel: driver.vehicleModel,
          vehiclePlate: driver.vehiclePlate,
          seats: driver.seats,
          pmrAdapted: driver.pmrAdapted,
        })

        setLoadingDirections(true)
        const directions = await fetchDirections(validReservation.pickupLocation, validReservation.destination)
        setDirectionsInfo(directions)
        setLoadingDirections(false)
      }
    } else {
      setDriverInfo(null)
      setDirectionsInfo(null)
    }
  }

  const clearReservationState = () => {
    setSelectedReservation(null)
    setDriverInfo(null)
    setDirectionsInfo(null)
    setDriverCoordinates(null)
    setClientCoordinates(null)
  }

  // Buscar reservas para cancelar
  const fetchCancelReservations = () => {
    if (!cancelPhone.trim()) {
      alert("Please enter a phone number")
      return
    }

    const stored: Reservation[] = JSON.parse(localStorage.getItem("reservations") || "[]")
    const userReservations = stored
      .filter((r) => r.phone === cancelPhone && r.status === "active")
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())

    setCancelReservations(userReservations)
    setShowCancelList(true)
  }

  const handleCancelSpecificReservation = (reservationId: string) => {
    const stored: Reservation[] = JSON.parse(localStorage.getItem("reservations") || "[]")
    const updatedReservations = stored.map((r) =>
      r.id === reservationId ? { ...r, status: "cancelled" } : r
    )

    localStorage.setItem("reservations", JSON.stringify(updatedReservations))
    setCancelReservations(cancelReservations.filter((r) => r.id !== reservationId))
    setCancelMessage("success")

    const logs = JSON.parse(localStorage.getItem("admin_logs") || "[]")
    const now = new Date()
    logs.push({
      id: Math.random().toString(36).substr(2, 9),
      type: "reservation_cancelled",
      phone: cancelPhone,
      reservationSku: updatedReservations.find((r) => r.id === reservationId)?.sku,
      timestamp: now.toISOString(),
      message: `La reserva ha sido cancelada el ${now.toLocaleDateString("es-ES")} a las ${now.toLocaleTimeString("es-ES")}`,
    })
    localStorage.setItem("admin_logs", JSON.stringify(logs))
  }

  const handleCancelReservation = () => {
    if (!cancelPhone.trim()) {
      alert("Please enter a phone number")
      return
    }

    const stored: Reservation[] = JSON.parse(localStorage.getItem("reservations") || "[]")
    const updatedReservations = stored.map((r) =>
      r.phone === cancelPhone && r.status === "active" ? { ...r, status: "cancelled" } : r
    )

    localStorage.setItem("reservations", JSON.stringify(updatedReservations))
    setCancelMessage("success")
    setCancelPhone("")
    setTimeout(() => {
      setShowCancelForm(false)
      setCancelMessage("")
    }, 2000)
  }

  return (
    <div className="space-y-4">
      {/* Check reservation section */}
      <div className="bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl p-6">
        <h3 className="text-lg font-semibold text-sky-900 mb-4">{t("check.title")}</h3>
        <p className="text-sm text-sky-600 mb-4">{t("check.description")}</p>
        <div className="space-y-3">
          <input
            type="tel"
            placeholder={t("form.phone")}
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="w-full px-4 py-2 border border-sky-200 rounded-lg focus:ring-2 focus:ring-orange-400 focus:border-transparent"
          />
          <button
            onClick={checkReservation}
            className="w-full py-2 bg-sky-600 hover:bg-sky-700 text-white font-medium rounded-lg transition"
          >
            {t("check.button")}
          </button>
        </div>

        {/* Driver info & route */}
        {selectedReservation && driverInfo && (
          <div className="mt-6 space-y-4 border-t border-sky-200 pt-4">
            <h4 className="font-semibold text-sky-900">Información del Taxista</h4>

            {driverCoordinates && clientCoordinates && (
              <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                <p className="text-sm font-medium text-gray-700 mb-3">Ruta del Taxista</p>
                <MapRouteViewer
                  pickupLocation={selectedReservation.pickupLocation}
                  driverLocation={driverCoordinates}
                  clientLocation={clientCoordinates}
                />
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <InfoCard label={t("driver.name")} value={driverInfo.name} />
              <InfoCard label={t("driver.phone")} value={driverInfo.phone} />
              <InfoCard label={t("driver.vehicle_model")} value={driverInfo.vehicleModel} />
              <InfoCard label={t("driver.vehicle_plate")} value={driverInfo.vehiclePlate} />
            </div>

            {loadingDirections ? (
              <LoadingDirections />
            ) : directionsInfo ? (
              <DirectionsInfoDisplay directionsInfo={directionsInfo} />
            ) : null}
          </div>
        )}

        {/* No driver assigned */}
        {selectedReservation && !driverInfo && (
          <div className="mt-6 flex items-start gap-3 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
            <p className="text-yellow-700 text-sm">{t("driver.status_no_tracking")}</p>
          </div>
        )}
      </div>

      {/* Cancel reservation section */}
      <div className="bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl p-6">
        <button
          onClick={() => setShowCancelForm(!showCancelForm)}
          className="w-full text-left font-semibold text-sky-900 hover:text-orange-600 transition flex items-center justify-between"
        >
          <span>{t("cancel.title")}</span>
          <span className="text-2xl">{showCancelForm ? "−" : "+"}</span>
        </button>

        {showCancelForm && (
          <div className="mt-4 space-y-3">
            {cancelMessage === "success" && (
              <div className="flex items-start gap-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <p className="text-green-700 text-sm">{t("cancel.success")}</p>
              </div>
            )}

            <div className="flex gap-2">
              <input
                type="tel"
                placeholder={t("cancel.phone")}
                value={cancelPhone}
                onChange={(e) => setCancelPhone(e.target.value)}
                className="flex-1 px-4 py-2 border border-sky-200 rounded-lg focus:ring-2 focus:ring-orange-400 focus:border-transparent"
              />
              <button
                onClick={fetchCancelReservations}
                className="px-6 py-2 bg-sky-600 hover:bg-sky-700 text-white font-medium rounded-lg transition"
              >
                Buscar
              </button>
            </div>

            {showCancelList && (
              <div className="space-y-3 mt-4">
                <h4 className="font-semibold text-sky-900">Mis Reservas:</h4>
                {cancelReservations.length === 0 ? (
                  <p className="text-center py-6 text-sky-600">No hay reservas activas para este número</p>
                ) : (
                  <div className="space-y-2">
                    {cancelReservations.map((res) => (
                      <div
                        key={res.id}
                        className="p-3 bg-sky-50 border border-sky-200 rounded-lg flex justify-between items-start"
                      >
                        <div className="text-sm">
                          <p className="font-medium text-sky-900">SKU: {res.sku}</p>
                          <p className="text-sky-700">
                            Fecha: {res.pickupDate} {res.pickupTime}
                          </p>
                          <p className="text-sky-600 text-xs">De: {res.pickupLocation}</p>
                        </div>
                        <button
                          onClick={() => handleCancelSpecificReservation(res.id)}
                          className="px-3 py-1 bg-red-500 hover:bg-red-600 text-white font-medium rounded text-sm transition"
                        >
                          Cancelar
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

// Componentes auxiliares
const InfoCard = ({ label, value }: { label: string; value: string | number }) => (
  <div className="p-3 bg-sky-50 rounded-lg">
    <p className="text-xs text-sky-600 font-medium">{label}</p>
    <p className="text-sky-900 font-semibold">{value}</p>
  </div>
)

const LoadingDirections = () => (
  <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg text-center">
    <p className="text-orange-700 text-sm">Calculando tiempo estimado...</p>
  </div>
)

const DirectionsInfoDisplay = ({ directionsInfo }: { directionsInfo: DirectionsInfo }) => (
  <div className="grid grid-cols-2 gap-3">
    <div className="p-4 bg-gradient-to-br from-orange-50 to-orange-100 border border-orange-200 rounded-lg">
      <div className="flex items-center gap-2 mb-1">
        <Clock className="w-4 h-4 text-orange-600" />
        <p className="text-xs text-orange-700 font-medium">Tiempo estimado</p>
      </div>
      <p className="text-2xl font-bold text-orange-900">{directionsInfo.time}</p>
      <p className="text-xs text-orange-700">minutos</p>
    </div>
    <div className="p-4 bg-gradient-to-br from-sky-50 to-sky-100 border border-sky-200 rounded-lg">
      <div className="flex items-center gap-2 mb-1">
        <MapIcon className="w-4 h-4 text-sky-600" />
        <p className="text-xs text-sky-700 font-medium">Distancia</p>
      </div>
      <p className="text-2xl font-bold text-sky-900">{directionsInfo.distance}</p>
      <p className="text-xs text-sky-700">km</p>
    </div>
  </div>
)
