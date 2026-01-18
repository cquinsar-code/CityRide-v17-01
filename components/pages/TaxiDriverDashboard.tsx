"use client"
import type React from "react"
import { useState, useEffect } from "react"
import { LogOut, Eye, EyeOff, MapPin, ArrowLeft } from "lucide-react"
import ReservationCalendar from "../ReservationCalendar"

interface Driver {
  id: string
  name: string
  username: string
  email: string
  phone: string
  license?: string
  municipality?: string
  island?: string
  vehicleModel?: string
  vehiclePlate?: string
  seats?: number
  pmrAdapted?: boolean
  registeredAt?: string
  locationTrackingEnabled?: boolean
}

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
  sku: string
  acceptedBy?: string | null
  acceptedAt?: string | null
  clientLocationTracking?: boolean
  clientLocation?: { lat: number; lon: number; address: string }
  lastLocationUpdate?: string
  completed?: boolean // Added for completed status
  acceptedDrivers?: string[]
}

export default function TaxiDriverDashboard({
  driver,
  onLogout,
  onLogin,
}: {
  driver?: Driver | null
  onLogout: () => void
  onLogin?: (driver: Driver) => void
}) {
  const [loginData, setLoginData] = useState({ username: "", password: "" })
  const [loginError, setLoginError] = useState("")
  const [loggedDriver, setLoggedDriver] = useState<Driver | null>(driver || null)
  const [activeTab, setActiveTab] = useState("requests")
  const [showForgotPanel, setShowForgotPanel] = useState(false)
  const [forgotEmail, setForgotEmail] = useState("")
  const [showResetPanel, setShowResetPanel] = useState(false)
  const [resetPassword, setResetPassword] = useState({ username: "", newPassword: "", confirmPassword: "" })
  const [resetError, setResetError] = useState("")
  const [resetSuccess, setResetSuccess] = useState(false)
  const [searchRequests, setSearchRequests] = useState("")
  const [searchReservations, setSearchReservations] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [locationTrackingEnabled, setLocationTrackingEnabled] = useState(false)
  const [watchId, setWatchId] = useState<number | null>(null)
  const [clientLocations, setClientLocations] = useState<Record<string, { address: string; time: string }>>({})
  const [acceptedReservationIds, setAcceptedReservationIds] = useState<string[]>([])
  const [filterDate, setFilterDate] = useState("")
  const [completedReservations, setCompletedReservations] = useState<string[]>([])
  const [showCalendarView, setShowCalendarView] = useState(false)
  const [selectedCalendarDate, setSelectedCalendarDate] = useState<{ day: number; month: Date } | null>(null)

  useEffect(() => {
    return () => {
      if (watchId !== null) {
        navigator.geolocation.clearWatch(watchId)
      }
    }
  }, [watchId])

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    setLoginError("")

    const drivers = JSON.parse(localStorage.getItem("taxi_drivers") || "[]")
    const foundDriver = drivers.find((d: any) => d.username === loginData.username && d.password === loginData.password)

    if (foundDriver) {
      const driverObj = {
        id: foundDriver.id,
        name: foundDriver.name,
        username: foundDriver.username,
        email: foundDriver.email,
        phone: foundDriver.phone,
        license: foundDriver.license,
        municipality: foundDriver.municipality,
        island: foundDriver.island,
        vehicleModel: foundDriver.vehicleModel,
        vehiclePlate: foundDriver.vehiclePlate,
        seats: foundDriver.seats,
        pmrAdapted: foundDriver.pmrAdapted,
        registeredAt: foundDriver.registeredAt,
        locationTrackingEnabled: false,
      }

      setLoggedDriver(driverObj)
      onLogin?.(driverObj)
      setLoginData({ username: "", password: "" })

      const logs = JSON.parse(localStorage.getItem("admin_logs") || "[]")
      logs.push({
        id: Math.random().toString(36).substr(2, 9),
        type: "driver_login",
        username: loginData.username,
        timestamp: new Date().toISOString(),
        message: `El taxista ${loginData.username} ha iniciado sesión el ${new Date().toLocaleDateString("es-ES")} a las ${new Date().toLocaleTimeString("es-ES")}`,
      })
      localStorage.setItem("admin_logs", JSON.stringify(logs))
    } else {
      setLoginError("Usuario o contraseña incorrectos")
    }
  }

  const handleForgotPassword = (e: React.FormEvent) => {
    e.preventDefault()

    const email = forgotEmail.trim()
    if (!email) {
      setLoginError("Por favor ingresa tu email")
      return
    }

    const drivers = JSON.parse(localStorage.getItem("taxi_drivers") || "[]")
    const driver = drivers.find((d: any) => d.email === email)

    if (!driver) {
      setLoginError("Email no encontrado en nuestros registros")
      return
    }

    const resetRequests = JSON.parse(localStorage.getItem("password_reset_requests") || "[]")

    if (!resetRequests.some((req: any) => req.username === driver.username && !req.approved)) {
      resetRequests.push({
        id: Math.random().toString(36).substr(2, 9),
        username: driver.username,
        email: driver.email,
        requestedAt: new Date().toISOString(),
        approved: false,
      })
      localStorage.setItem("password_reset_requests", JSON.stringify(resetRequests))
      setLoginError("")
      setShowForgotPanel(false)
      setForgotEmail("")
      alert("Tu solicitud ha sido enviada al administrador. Pronto recibirás instrucciones para cambiar tu contraseña.")
    }
  }

  const handleResetPassword = (e: React.FormEvent) => {
    e.preventDefault()
    setResetError("")
    setResetSuccess(false)

    if (!resetPassword.username) {
      setResetError("Por favor ingresa tu usuario")
      return
    }

    if (!resetPassword.newPassword || !resetPassword.confirmPassword) {
      setResetError("Por favor completa todos los campos")
      return
    }

    if (resetPassword.newPassword !== resetPassword.confirmPassword) {
      setResetError("Las contraseñas no coinciden")
      return
    }

    if (resetPassword.newPassword.length < 6) {
      setResetError("La contraseña debe tener al menos 6 caracteres")
      return
    }

    const resetRequests = JSON.parse(localStorage.getItem("password_reset_requests") || "[]")
    const hasApproval = resetRequests.some((req: any) => req.username === resetPassword.username && req.approved)

    if (!hasApproval) {
      setResetError("Tu solicitud de restablecimiento no ha sido aprobada por administración")
      return
    }

    const drivers = JSON.parse(localStorage.getItem("taxi_drivers") || "[]")
    const driverIndex = drivers.findIndex((d: any) => d.username === resetPassword.username)

    if (driverIndex === -1) {
      setResetError("Usuario no encontrado")
      return
    }

    drivers[driverIndex].password = resetPassword.newPassword
    localStorage.setItem("taxi_drivers", JSON.stringify(drivers))

    const updatedRequests = resetRequests.filter((req: any) => req.username !== resetPassword.username)
    localStorage.setItem("password_reset_requests", JSON.stringify(updatedRequests))

    setResetSuccess(true)
    setResetPassword({ username: "", newPassword: "", confirmPassword: "" })

    setTimeout(() => {
      setShowResetPanel(false)
      setResetSuccess(false)
    }, 3000)
  }

  const handleToggleReservation = (reservationId: string, isAccepting: boolean) => {
    if (typeof localStorage === "undefined") return

    const reservations: Reservation[] = JSON.parse(localStorage.getItem("reservations") || "[]")
    const reservationIndex = reservations.findIndex((r) => r.id === reservationId)

    if (reservationIndex !== -1 && loggedDriver) {
      if (isAccepting) {
        // Accepting: add driver to accepted list
        if (!reservations[reservationIndex].acceptedDrivers) {
          reservations[reservationIndex].acceptedDrivers = []
        }
        if (!reservations[reservationIndex].acceptedDrivers?.includes(loggedDriver.username)) {
          reservations[reservationIndex].acceptedDrivers?.push(loggedDriver.username)
        }
        reservations[reservationIndex].acceptedBy = loggedDriver.username
        reservations[reservationIndex].acceptedAt = new Date().toISOString()

        setAcceptedReservationIds([...acceptedReservationIds, reservationId])

        const logs = JSON.parse(localStorage.getItem("admin_logs") || "[]")
        const dateStr = new Date().toLocaleDateString("es-ES")
        const timeStr = new Date().toLocaleTimeString("es-ES")

        logs.push({
          id: Math.random().toString(36).substr(2, 9),
          type: "reservation_accepted",
          username: loggedDriver.username,
          reservationSku: reservations[reservationIndex].sku,
          timestamp: new Date().toISOString(),
          message: `El taxista ${loggedDriver.username} ha aceptado la reserva ${reservations[reservationIndex].sku} el ${dateStr} a las ${timeStr}`,
        })
        localStorage.setItem("admin_logs", JSON.stringify(logs))
      } else {
        // Declining: remove driver from accepted list, goes back to requests
        reservations[reservationIndex].acceptedDrivers = (reservations[reservationIndex].acceptedDrivers || []).filter(
          (d) => d !== loggedDriver.username,
        )
        if (reservations[reservationIndex].acceptedDrivers?.length === 0) {
          reservations[reservationIndex].acceptedBy = null
          reservations[reservationIndex].acceptedAt = null
        }

        setAcceptedReservationIds(acceptedReservationIds.filter((id) => id !== reservationId))
        setCompletedReservations(completedReservations.filter((id) => id !== reservationId))
      }

      localStorage.setItem("reservations", JSON.stringify(reservations))
    }
  }

  const handleCompleteReservation = (reservationId: string) => {
    if (typeof localStorage === "undefined") return

    if (loggedDriver) {
      const reservations: Reservation[] = JSON.parse(localStorage.getItem("reservations") || "[]")
      const reservationIndex = reservations.findIndex((r) => r.id === reservationId)

      if (reservationIndex !== -1) {
        reservations[reservationIndex].completed = true
        localStorage.setItem("reservations", JSON.stringify(reservations))
        setCompletedReservations([...completedReservations, reservationId])

        const logs = JSON.parse(localStorage.getItem("admin_logs") || "[]")
        const dateStr = new Date().toLocaleDateString("es-ES")
        const timeStr = new Date().toLocaleTimeString("es-ES")

        logs.push({
          id: Math.random().toString(36).substr(2, 9),
          type: "reservation_completed",
          username: loggedDriver.username,
          reservationSku: reservations[reservationIndex].sku,
          timestamp: new Date().toISOString(),
          message: `El taxista ${loggedDriver.username} ha marcado como completada la reserva ${reservations[reservationIndex].sku} el ${dateStr} a las ${timeStr}`,
        })
        localStorage.setItem("admin_logs", JSON.stringify(logs))
      }
    }
  }

  const handleLocationTrackingToggle = () => {
    if (!locationTrackingEnabled) {
      if (!navigator.geolocation) {
        alert("La geolocalización no está disponible")
        return
      }

      const id = navigator.geolocation.watchPosition(
        (position) => {
          console.log("[v0] Taxi location tracked:", position.coords)
        },
        (err) => {
          console.log("[v0] Taxi tracking error:", err)
          alert("Error al rastrear ubicación")
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

  const getClientLocation = (reservationId: string): { address: string; time: string } | null => {
    return clientLocations[reservationId] || null
  }

  useEffect(() => {
    if (activeTab === "requests") {
      const interval = setInterval(() => {
        const reservations: Reservation[] = JSON.parse(localStorage.getItem("reservations") || "[]")
        const unacceptedReservations = reservations.filter((r) => !r.acceptedBy)

        const locations: Record<string, { address: string; time: string }> = {}
        unacceptedReservations.forEach((res) => {
          if (res.clientLocationTracking) {
            locations[res.id] = {
              address: res.pickupLocation || "Ubicación desconocida",
              time: new Date().toLocaleTimeString("es-ES"),
            }
          }
        })
        setClientLocations(locations)
      }, 5000)

      return () => clearInterval(interval)
    }
  }, [activeTab])

  const reservations: Reservation[] = JSON.parse(localStorage.getItem("reservations") || "[]")

  const filteredRequests = reservations
    .filter((r) => !r.acceptedBy)
    .filter((r) => !filterDate || r.pickupDate === filterDate)
    .filter((r: any) => {
      const searchLower = searchRequests.toLowerCase()
      return (
        r.name.toLowerCase().includes(searchLower) ||
        r.phone.includes(searchRequests) ||
        r.sku.includes(searchRequests) ||
        r.pickupLocation.toLowerCase().includes(searchLower) ||
        r.destination.toLowerCase().includes(searchLower)
      )
    })
    .sort((a, b) => {
      const now = new Date()
      const dateA = new Date(`${a.pickupDate}T${a.pickupTime}`)
      const dateB = new Date(`${b.pickupDate}T${b.pickupTime}`)

      return Math.abs(dateA.getTime() - now.getTime()) - Math.abs(dateB.getTime() - now.getTime())
    })

  const filteredMyReservations = reservations
    .filter((r) => r.acceptedBy === loggedDriver?.username && !r.completed)
    .filter((r: any) => {
      const searchLower = searchReservations.toLowerCase()
      return (
        r.name.toLowerCase().includes(searchLower) ||
        r.phone.includes(searchReservations) ||
        r.sku.includes(searchReservations) ||
        r.pickupLocation.toLowerCase().includes(searchLower) ||
        r.destination.toLowerCase().includes(searchLower)
      )
    })

  const completedMyReservations = reservations
    .filter((r) => r.acceptedBy === loggedDriver?.username && r.completed)
    .filter((r: any) => {
      const searchLower = searchReservations.toLowerCase()
      return (
        r.name.toLowerCase().includes(searchLower) ||
        r.phone.includes(searchReservations) ||
        r.sku.includes(searchReservations) ||
        r.pickupLocation.toLowerCase().includes(searchLower) ||
        r.destination.toLowerCase().includes(searchLower)
      )
    })

  const filteredRequestsForDay = selectedCalendarDate
    ? reservations
        .filter((r) => !r.acceptedBy)
        .filter((r) => {
          const resDate = new Date(r.pickupDate)
          return (
            resDate.getDate() === selectedCalendarDate.day &&
            resDate.getMonth() === selectedCalendarDate.month.getMonth() &&
            resDate.getFullYear() === selectedCalendarDate.month.getFullYear()
          )
        })
        .sort((a, b) => {
          const timeA = new Date(`${a.pickupDate}T${a.pickupTime}`)
          const timeB = new Date(`${b.pickupDate}T${b.pickupTime}`)
          return timeA.getTime() - timeB.getTime()
        })
    : []

  const filteredMyReservationsForDay = selectedCalendarDate
    ? reservations
        .filter((r) => r.acceptedBy === loggedDriver?.username && !r.completed) // Only show pending reservations
        .filter((r) => {
          const resDate = new Date(r.pickupDate)
          return (
            resDate.getDate() === selectedCalendarDate.day &&
            resDate.getMonth() === selectedCalendarDate.month.getMonth() &&
            resDate.getFullYear() === selectedCalendarDate.month.getFullYear()
          )
        })
        .sort((a, b) => {
          const timeA = new Date(`${a.pickupDate}T${a.pickupTime}`)
          const timeB = new Date(`${b.pickupDate}T${b.pickupTime}`)
          return timeA.getTime() - timeB.getTime()
        })
    : []

  // Add filtering for completed reservations for the selected day
  const completedMyReservationsForDay = selectedCalendarDate
    ? reservations
        .filter((r) => r.acceptedBy === loggedDriver?.username && r.completed)
        .filter((r) => {
          const resDate = new Date(r.pickupDate)
          return (
            resDate.getDate() === selectedCalendarDate.day &&
            resDate.getMonth() === selectedCalendarDate.month.getMonth() &&
            resDate.getFullYear() === selectedCalendarDate.month.getFullYear()
          )
        })
        .sort((a, b) => {
          const timeA = new Date(`${a.pickupDate}T${a.pickupTime}`)
          const timeB = new Date(`${b.pickupDate}T${b.pickupTime}`)
          return timeA.getTime() - timeB.getTime()
        })
    : []

  const formatDateDDMMYYYY = (dateStr: string): string => {
    if (!dateStr) return ""
    const [year, month, day] = dateStr.split("-")
    return `${day}/${month}/${year}`
  }

  if (loggedDriver) {
    return (
      <div className="bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl p-6 md:p-8">
        <div className="flex justify-between items-center mb-6 pb-4 border-b-2 border-sky-200">
          <h2 className="text-2xl font-semibold text-sky-900">¡Hola, {loggedDriver.name}!</h2>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-orange-50 to-orange-100 border border-orange-200 rounded-lg">
              <MapPin
                className={`w-5 h-5 ${locationTrackingEnabled ? "text-orange-600 animate-pulse" : "text-sky-600"}`}
              />
              <label className="text-sm font-medium text-sky-900">Ubicación en Tiempo Real</label>
              <button
                onClick={handleLocationTrackingToggle}
                className={`relative inline-flex h-6 w-11 ml-2 items-center rounded-full transition-all ${
                  locationTrackingEnabled ? "bg-orange-500" : "bg-gray-300"
                }`}
                role="switch"
                aria-checked={locationTrackingEnabled}
              >
                <span
                  className={`absolute h-4 w-4 rounded-full bg-white transition-all ${
                    locationTrackingEnabled ? "right-1" : "left-1"
                  }`}
                />
              </button>
            </div>
            <button
              onClick={onLogout}
              className="flex items-center gap-2 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition font-medium"
            >
              <LogOut className="w-4 h-4" />
              Cerrar sesión
            </button>
          </div>
        </div>

        <div className="flex gap-2 mb-6 bg-sky-50 rounded-lg p-2">
          <button
            onClick={() => setActiveTab("requests")}
            className={`flex-1 px-4 py-2 font-medium rounded transition ${
              activeTab === "requests" ? "bg-orange-500 text-white" : "text-sky-600 hover:bg-white"
            }`}
          >
            Solicitudes
          </button>
          <button
            onClick={() => setActiveTab("myreservations")}
            className={`flex-1 px-4 py-2 font-medium rounded transition ${
              activeTab === "myreservations" ? "bg-orange-500 text-white" : "text-sky-600 hover:bg-white"
            }`}
          >
            Mis Reservas
          </button>
          <button
            onClick={() => setActiveTab("profile")}
            className={`flex-1 px-4 py-2 font-medium rounded transition ${
              activeTab === "profile" ? "bg-orange-500 text-white" : "text-sky-600 hover:bg-white"
            }`}
          >
            Perfil
          </button>
        </div>

        <div>
          {activeTab === "requests" && (
            <div className="space-y-4">
              {!showCalendarView ? (
                <ReservationCalendar
                  reservations={reservations.filter((r) => !r.acceptedBy)}
                  onSelectDay={(day, month) => {
                    setSelectedCalendarDate({ day, month })
                    setShowCalendarView(true)
                  }}
                  onBack={() => {
                    setShowCalendarView(false)
                    setSelectedCalendarDate(null)
                  }}
                  title="Solicitudes Disponibles"
                />
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        setShowCalendarView(false)
                        setSelectedCalendarDate(null)
                      }}
                      className="flex items-center gap-2 px-4 py-2 bg-sky-100 text-sky-700 hover:bg-sky-200 rounded-lg transition font-medium"
                    >
                      <ArrowLeft className="w-4 h-4" />
                      Volver al Calendario
                    </button>
                    <h3 className="text-lg font-semibold text-sky-900">
                      Solicitudes para {selectedCalendarDate?.day}/
                      {String(selectedCalendarDate!.month.getMonth() + 1).padStart(2, "0")}/
                      {selectedCalendarDate?.month.getFullYear()}
                    </h3>
                  </div>

                  {filteredRequestsForDay.length === 0 ? (
                    <p className="text-center py-12 text-sky-600">No hay solicitudes para este día</p>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead className="bg-sky-50 border-b border-sky-200">
                          <tr>
                            <th className="px-4 py-3 text-left font-semibold text-sky-900">Cliente</th>
                            <th className="px-4 py-3 text-left font-semibold text-sky-900">Teléfono</th>
                            <th className="px-4 py-3 text-left font-semibold text-sky-900">Fecha y Hora</th>
                            <th className="px-4 py-3 text-left font-semibold text-sky-900">Recogida</th>
                            <th className="px-4 py-3 text-left font-semibold text-sky-900">Destino</th>
                            <th className="px-4 py-3 text-left font-semibold text-sky-900">Pasajeros</th>
                            <th className="px-4 py-3 text-left font-semibold text-sky-900">Ubicación del Cliente</th>
                            <th className="px-4 py-3 text-center font-semibold text-sky-900">Aceptar/Desaceptar</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredRequestsForDay.map((res) => {
                            const clientLocation = getClientLocation(res.id)
                            const isAccepted = acceptedReservationIds.includes(res.id)
                            return (
                              <tr key={res.id} className="border-b border-sky-200 hover:bg-sky-50 transition">
                                <td className="px-4 py-3 font-medium text-sky-900">{res.name}</td>
                                <td className="px-4 py-3 text-sky-700">{res.phone}</td>
                                <td className="px-4 py-3 text-sky-700">
                                  <div>
                                    <p className="font-medium">{formatDateDDMMYYYY(res.pickupDate)}</p>
                                    <p className="text-xs text-sky-600">{res.pickupTime}</p>
                                  </div>
                                </td>
                                <td className="px-4 py-3 text-sky-700 text-xs">{res.pickupLocation}</td>
                                <td className="px-4 py-3 text-sky-700 text-xs">{res.destination}</td>
                                <td className="px-4 py-3 text-sky-700 text-xs">
                                  <div className="space-y-1">
                                    <p>Adultos: {res.adults}</p>
                                    <p>Niños: {res.children}</p>
                                    <p>PMR: {res.pmr}</p>
                                  </div>
                                </td>
                                <td className="px-4 py-3">
                                  {res.clientLocationTracking ? (
                                    <div className="space-y-1">
                                      <p className="text-xs font-medium text-orange-700 bg-orange-50 px-2 py-1 rounded">
                                        {clientLocation?.address || "Actualizando..."}
                                      </p>
                                      {clientLocation && (
                                        <p className="text-xs text-orange-600">{clientLocation.time}</p>
                                      )}
                                      {res.observations && (
                                        <p className="text-xs text-sky-600 italic">Obs: {res.observations}</p>
                                      )}
                                    </div>
                                  ) : (
                                    <div>
                                      <p className="text-xs text-gray-500 italic">Sin rastreo</p>
                                      {res.observations && (
                                        <p className="text-xs text-sky-600 italic">Obs: {res.observations}</p>
                                      )}
                                    </div>
                                  )}
                                </td>
                                <td className="px-4 py-3 text-center">
                                  <button
                                    onClick={() => handleToggleReservation(res.id, !isAccepted)}
                                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-all ${
                                      isAccepted ? "bg-green-500" : "bg-gray-300"
                                    }`}
                                    role="switch"
                                    aria-checked={isAccepted}
                                  >
                                    <span
                                      className={`absolute h-4 w-4 rounded-full bg-white transition-all ${
                                        isAccepted ? "right-1" : "left-1"
                                      }`}
                                    />
                                  </button>
                                </td>
                              </tr>
                            )
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {activeTab === "myreservations" && (
            <div className="space-y-4">
              {!showCalendarView ? (
                <ReservationCalendar
                  reservations={reservations.filter((r) => r.acceptedBy === loggedDriver?.username)}
                  onSelectDay={(day, month) => {
                    setSelectedCalendarDate({ day, month })
                    setShowCalendarView(true)
                  }}
                  onBack={() => {
                    setShowCalendarView(false)
                    setSelectedCalendarDate(null)
                  }}
                  filterByDriver={loggedDriver?.username}
                  title="Mis Reservas Aceptadas"
                />
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        setShowCalendarView(false)
                        setSelectedCalendarDate(null)
                      }}
                      className="flex items-center gap-2 px-4 py-2 bg-sky-100 text-sky-700 hover:bg-sky-200 rounded-lg transition font-medium"
                    >
                      <ArrowLeft className="w-4 h-4" />
                      Volver al Calendario
                    </button>
                    <h3 className="text-lg font-semibold text-sky-900">
                      Mis Reservas para {selectedCalendarDate?.day}/
                      {String(selectedCalendarDate!.month.getMonth() + 1).padStart(2, "0")}/
                      {selectedCalendarDate?.month.getFullYear()}
                    </h3>
                  </div>

                  {filteredMyReservationsForDay.length === 0 && completedMyReservationsForDay.length === 0 ? (
                    <p className="text-center py-12 text-sky-600">No hay reservas para este día</p>
                  ) : (
                    <div className="space-y-3">
                      {filteredMyReservationsForDay.map((reservation) => (
                        <div
                          key={reservation.id}
                          className="border border-sky-200 rounded-lg p-4 hover:shadow-md transition"
                        >
                          <div className="flex justify-between items-center mb-4 pb-3 border-b border-sky-100">
                            <div>
                              <h3 className="font-semibold text-sky-900">{reservation.name}</h3>
                              <p className="text-sm text-sky-600">SKU: {reservation.sku}</p>
                            </div>
                            {!completedReservations.includes(reservation.id) && (
                              <div className="flex items-center gap-2">
                                <label className="text-sm font-medium text-sky-700">Desmarcar reserva</label>
                                <button
                                  onClick={() => handleToggleReservation(reservation.id, false)}
                                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-all ${
                                    acceptedReservationIds.includes(reservation.id) ? "bg-green-500" : "bg-gray-300"
                                  }`}
                                  role="switch"
                                  aria-checked={acceptedReservationIds.includes(reservation.id)}
                                  title="Desaceptar esta reserva"
                                >
                                  <span
                                    className={`absolute h-4 w-4 rounded-full bg-white transition-all ${
                                      acceptedReservationIds.includes(reservation.id) ? "right-1" : "left-1"
                                    }`}
                                  />
                                </button>
                              </div>
                            )}
                          </div>

                          <div className="grid grid-cols-2 gap-3 text-sm mb-4">
                            <div>
                              <p className="text-sky-600">Teléfono:</p>
                              <p className="font-medium text-sky-900">{reservation.phone}</p>
                            </div>
                            <div>
                              <p className="text-sky-600">Fecha y Hora:</p>
                              <p className="font-medium text-sky-900">
                                {formatDateDDMMYYYY(reservation.pickupDate)} {reservation.pickupTime}
                              </p>
                            </div>
                            <div>
                              <p className="text-sky-600">Recogida:</p>
                              <p className="font-medium text-sky-900">{reservation.pickupLocation}</p>
                            </div>
                            <div>
                              <p className="text-sky-600">Destino:</p>
                              <p className="font-medium text-sky-900">{reservation.destination}</p>
                            </div>
                            <div>
                              <p className="text-sky-600">Pasajeros:</p>
                              <p className="text-sky-900">
                                Adultos: {reservation.adults}, Niños: {reservation.children}, PMR: {reservation.pmr}
                              </p>
                            </div>
                            {reservation.observations && (
                              <div>
                                <p className="text-sky-600">Observaciones:</p>
                                <p className="text-sky-900">{reservation.observations}</p>
                              </div>
                            )}
                          </div>

                          {!completedReservations.includes(reservation.id) ? (
                            <div className="flex items-center gap-2 pt-3 border-t border-sky-100">
                              <input
                                type="checkbox"
                                checked={false}
                                onChange={() => {
                                  if (!completedReservations.includes(reservation.id)) {
                                    handleCompleteReservation(reservation.id)
                                  }
                                }}
                                className="w-5 h-5 cursor-pointer rounded"
                                title="Marcar como hecho"
                              />
                              <label className="text-sm font-medium text-sky-700">Marcar como hecho</label>
                            </div>
                          ) : (
                            <div className="pt-3 border-t border-green-100">
                              <span className="inline-block px-3 py-1 bg-green-500 text-white text-xs font-semibold rounded-full">
                                Completada
                              </span>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  {completedMyReservationsForDay.length > 0 && (
                    <div className="mt-6">
                      <h4 className="text-lg font-semibold text-green-900 mb-3">Reservas Completadas</h4>
                      <div className="space-y-3">
                        {completedMyReservationsForDay.map((reservation) => (
                          <div key={reservation.id} className="p-4 border border-green-200 rounded-lg bg-green-50">
                            <div className="flex justify-between items-start mb-2">
                              <div>
                                <h4 className="font-semibold text-green-900">{reservation.name}</h4>
                                <p className="text-sm text-green-700">SKU: {reservation.sku}</p>
                                <span className="inline-block mt-2 px-3 py-1 bg-green-500 text-white text-xs font-semibold rounded-full">
                                  Completada
                                </span>
                              </div>
                            </div>
                            <div className="text-sm text-green-700 space-y-1">
                              <p>
                                <span className="font-medium">Teléfono:</span> {reservation.phone}
                              </p>
                              <p>
                                <span className="font-medium">Fecha/Hora:</span>{" "}
                                {formatDateDDMMYYYY(reservation.pickupDate)} {reservation.pickupTime}
                              </p>
                              <p>
                                <span className="font-medium">Recogida:</span> {reservation.pickupLocation}
                              </p>
                              <p>
                                <span className="font-medium">Destino:</span> {reservation.destination}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {activeTab === "profile" && (
            <div className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="p-4 border border-sky-200 rounded-lg bg-sky-50">
                  <p className="text-sm text-sky-600 font-medium">Nombre</p>
                  <p className="text-sky-900 font-semibold">{loggedDriver.name}</p>
                </div>
                <div className="p-4 border border-sky-200 rounded-lg bg-sky-50">
                  <p className="text-sm text-sky-600 font-medium">Usuario</p>
                  <p className="text-sky-900 font-semibold">{loggedDriver.username}</p>
                </div>
                <div className="p-4 border border-sky-200 rounded-lg bg-sky-50">
                  <p className="text-sm text-sky-600 font-medium">Email</p>
                  <p className="text-sky-900 font-semibold">{loggedDriver.email}</p>
                </div>
                <div className="p-4 border border-sky-200 rounded-lg bg-sky-50">
                  <p className="text-sm text-sky-600 font-medium">Teléfono</p>
                  <p className="text-sky-900 font-semibold">{loggedDriver.phone}</p>
                </div>
                <div className="p-4 border border-sky-200 rounded-lg bg-sky-50">
                  <p className="text-sm text-sky-600 font-medium">Licencia Municipal</p>
                  <p className="text-sky-900 font-semibold">{loggedDriver.license || "N/A"}</p>
                </div>
                <div className="p-4 border border-sky-200 rounded-lg bg-sky-50">
                  <p className="text-sm text-sky-600 font-medium">Isla</p>
                  <p className="text-sky-900 font-semibold">{loggedDriver.island || "N/A"}</p>
                </div>
                <div className="p-4 border border-sky-200 rounded-lg bg-sky-50">
                  <p className="text-sm text-sky-600 font-medium">Municipio</p>
                  <p className="text-sky-900 font-semibold">{loggedDriver.municipality || "N/A"}</p>
                </div>
                <div className="p-4 border border-sky-200 rounded-lg bg-sky-50">
                  <p className="text-sm text-sky-600 font-medium">Modelo del Vehículo</p>
                  <p className="text-sky-900 font-semibold">{loggedDriver.vehicleModel || "N/A"}</p>
                </div>
                <div className="p-4 border border-sky-200 rounded-lg bg-sky-50">
                  <p className="text-sm text-sky-600 font-medium">Matrícula del Vehículo</p>
                  <p className="text-sky-900 font-semibold">{loggedDriver.vehiclePlate || "N/A"}</p>
                </div>
                <div className="p-4 border border-sky-200 rounded-lg bg-sky-50">
                  <p className="text-sm text-sky-600 font-medium">Plazas Disponibles</p>
                  <p className="text-sky-900 font-semibold">{loggedDriver.seats || "N/A"}</p>
                </div>
                <div className="p-4 border border-sky-200 rounded-lg bg-sky-50">
                  <p className="text-sm text-sky-600 font-medium">PMR Adaptado</p>
                  <p className="text-sky-900 font-semibold">{loggedDriver.pmrAdapted ? "Sí" : "No"}</p>
                </div>
                <div className="p-4 border border-sky-200 rounded-lg bg-sky-50">
                  <p className="text-sm text-sky-600 font-medium">Registrado el</p>
                  <p className="text-sky-900 font-semibold">
                    {loggedDriver.registeredAt ? new Date(loggedDriver.registeredAt).toLocaleString("es-ES") : "N/A"}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        <p className="text-xs text-sky-600 mt-6 pt-6 border-t border-sky-200">
          Para cualquier duda o incidencia contacte al 622547799
        </p>
      </div>
    )
  }

  return (
    <div className="bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl p-6 md:p-8">
      <h2 className="text-2xl font-semibold text-sky-900 mb-2">Iniciar sesión</h2>
      <p className="text-sky-600 text-sm mb-6">¿Ya tienes cuenta? Inicia sesión para acceder a las reservas.</p>

      {loginError && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">{loginError}</div>
      )}

      {!showForgotPanel && !showResetPanel ? (
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-sky-900 mb-1">Usuario</label>
            <input
              type="text"
              value={loginData.username}
              onChange={(e) => setLoginData({ ...loginData, username: e.target.value })}
              className="w-full px-4 py-2 border border-sky-200 rounded-lg focus:ring-2 focus:ring-orange-400"
              placeholder="Tu usuario"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-sky-900 mb-1">Contraseña</label>
            <input
              type="password"
              value={loginData.password}
              onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
              className="w-full px-4 py-2 border border-sky-200 rounded-lg focus:ring-2 focus:ring-orange-400"
              placeholder="Tu contraseña"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full py-3 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-medium rounded-lg transition-all duration-300"
          >
            Iniciar sesión
          </button>
        </form>
      ) : showForgotPanel ? (
        <form
          onSubmit={(e) => {
            e.preventDefault()
            handleForgotPassword(e)
          }}
          className="space-y-4"
        >
          <h2 className="text-lg font-semibold text-sky-900">¿Has olvidado la contraseña?</h2>
          <p className="text-sm text-sky-600 leading-relaxed">
            Introduce tu email asociado a la cuenta. Cuando el administrador acepte tu solicitud te aparecerá un campo
            para cambiar tu contraseña
          </p>
          <div>
            <label className="block text-sm font-medium text-sky-900 mb-2">Email</label>
            <input
              type="email"
              required
              value={forgotEmail}
              onChange={(e) => setForgotEmail(e.target.value)}
              className="w-full px-4 py-2 border border-sky-200 rounded-lg focus:ring-2 focus:ring-orange-400"
              placeholder="tu@email.com"
            />
          </div>
          <button
            type="submit"
            className="w-full py-3 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-medium rounded-lg transition-all duration-300"
          >
            Aceptar
          </button>
          <button
            type="button"
            onClick={() => {
              setShowForgotPanel(false)
              setForgotEmail("")
              setLoginError("")
            }}
            className="w-full py-2 bg-sky-100 text-sky-700 rounded-lg hover:bg-sky-200 transition font-medium"
          >
            Volver
          </button>
        </form>
      ) : (
        <form onSubmit={handleResetPassword} className="space-y-4">
          <h2 className="text-lg font-semibold text-sky-900">Restablecer contraseña</h2>
          {resetSuccess && (
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm">
              ¡Contraseña actualizada correctamente!
            </div>
          )}
          {resetError && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">{resetError}</div>
          )}
          <div>
            <label className="block text-sm font-medium text-sky-900 mb-1">Usuario</label>
            <input
              type="text"
              required
              value={resetPassword.username}
              onChange={(e) => setResetPassword({ ...resetPassword, username: e.target.value })}
              className="w-full px-4 py-2 border border-sky-200 rounded-lg focus:ring-2 focus:ring-orange-400"
              placeholder="Tu usuario"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-sky-900 mb-1">Contraseña nueva</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                required
                value={resetPassword.newPassword}
                onChange={(e) => setResetPassword({ ...resetPassword, newPassword: e.target.value })}
                className="w-full px-4 py-2 border border-sky-200 rounded-lg focus:ring-2 focus:ring-orange-400"
                placeholder="Nueva contraseña"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-sky-600 hover:text-sky-900"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-sky-900 mb-1">Repetir contraseña</label>
            <input
              type="password"
              required
              value={resetPassword.confirmPassword}
              onChange={(e) => setResetPassword({ ...resetPassword, confirmPassword: e.target.value })}
              className="w-full px-4 py-2 border border-sky-200 rounded-lg focus:ring-2 focus:ring-orange-400"
              placeholder="Repetir contraseña"
            />
          </div>
          <button
            type="submit"
            className="w-full py-3 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-medium rounded-lg transition-all duration-300"
          >
            Aceptar
          </button>
          <button
            type="button"
            onClick={() => {
              setShowResetPanel(false)
              setForgotEmail("")
            }}
            className="w-full py-2 bg-sky-100 text-sky-700 rounded-lg hover:bg-sky-200 transition font-medium"
          >
            Volver al login
          </button>
        </form>
      )}

      {!showForgotPanel && !showResetPanel && (
        <>
          <button
            type="button"
            onClick={() => setShowForgotPanel(true)}
            className="w-full mt-4 text-sky-600 hover:text-sky-900 text-sm font-medium transition"
          >
            ¿Has olvidado tu contraseña?
          </button>
        </>
      )}
    </div>
  )
}
