"use client"
import { useState, useEffect } from "react"
import { LogOut, CheckCircle, ArrowLeft } from "lucide-react"
import ReservationCalendar from "@/components/ReservationCalendar"
import TicketReservationCard from "@/components/TicketReservationCard"

interface AdminSession {
  username: string
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
  timestamp: Date
  sku: string
  status: "active" | "cancelled" | "completed" | "accepted"
  driverId?: string
  acceptedBy?: string
  is_fake?: boolean
}

interface PasswordResetRequest {
  id: string
  username: string
  email: string
  requestedAt: string
  approved: boolean
}

const handleApprovePasswordReset = async (id: string, username: string) => {
  // Implement the logic for approving password reset request
}

const handleRejectPasswordReset = async (id: string) => {
  // Implement the logic for rejecting password reset request
}

export default function AdminDashboard({
  admin,
  onLogout,
}: {
  admin: AdminSession
  onLogout: () => void
}) {
  const [activeTab, setActiveTab] = useState("reservations")
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [selectedDay, setSelectedDay] = useState<number | null>(null)
  const [viewFullHistory, setViewFullHistory] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [showDayDetail, setShowDayDetail] = useState(false)
  const [searchTermDay, setSearchTermDay] = useState("")
  const [resetRequests, setResetRequests] = useState<PasswordResetRequest[]>([])
  const [banState, setBanState] = useState<Record<string, boolean>>({})
  const [selectedDriver, setSelectedDriver] = useState<any>(null)
  const [selectedReservation, setSelectedReservation] = useState<any>(null)
  const [showDriverModal, setShowDriverModal] = useState(false)
  const [showReservationModal, setShowReservationModal] = useState(false)
  const [searchReservations, setSearchReservations] = useState("")
  const [searchDrivers, setSearchDrivers] = useState("")
  const [searchLogs, setSearchLogs] = useState("")
  const [searchSuggestions, setSearchSuggestions] = useState("")
  const [searchTrash, setSearchTrash] = useState("")
  const [calendarDate, setCalendarDate] = useState(new Date())
  const [selectedCalendarDate, setSelectedCalendarDate] = useState<string | null>(null)
  const [commissionValue, setCommissionValue] = useState<number>(0)
  const [showCommissionMonthly, setShowCommissionMonthly] = useState(false)

  const [generateRandomReservations, setGenerateRandomReservations] = useState(false)
  const [generateRandomTaxis, setGenerateRandomTaxis] = useState(false)
  const [generateRandomLogs, setGenerateRandomLogs] = useState(false)
  const [selectedIsland, setSelectedIsland] = useState("Gran Canaria")
  const [municipalities, setMunicipalities] = useState<string[]>([])

  const reservations: Reservation[] = JSON.parse(localStorage.getItem("reservations") || "[]")
  const deletedReservations: Reservation[] = JSON.parse(localStorage.getItem("deleted_reservations") || "[]")
  const drivers = JSON.parse(localStorage.getItem("taxi_drivers") || "[]")
  const suggestions = JSON.parse(localStorage.getItem("suggestions") || "[]")
  const passwordResetRequests: PasswordResetRequest[] = JSON.parse(
    localStorage.getItem("password_reset_requests") || "[]",
  )
  const logs = JSON.parse(localStorage.getItem("admin_logs") || "[]")

  useEffect(() => {
    setResetRequests(passwordResetRequests)
    const state: Record<string, boolean> = {}
    drivers.forEach((driver: any) => {
      state[driver.id] = driver.banned || false
    })
    setBanState(state)
  }, [])

  useEffect(() => {
    const fetchMunicipalities = async () => {
      const response = await fetch(`/api/islands/municipalities?island=${selectedIsland}`)
      const data = await response.json()
      setMunicipalities(data.municipalities || [])
    }
    fetchMunicipalities()
  }, [selectedIsland])

  useEffect(() => {
    if (!generateRandomReservations) return

    const interval = setInterval(
      async () => {
        const {
          generateRandomName,
          generateRandomPhone,
          generateRandomDate,
          generateRandomPassengers,
          generateRandomSKU,
        } = await import("@/lib/randomDataGenerator")

        const municipality = municipalities[Math.floor(Math.random() * municipalities.length)]
        if (!municipality) return

        const addressResponse = await fetch(`/api/geolocation/random-address?municipality=${municipality}`)
        const { address } = await addressResponse.json()

        const { date, time } = generateRandomDate()
        const { adults, children, pmr } = generateRandomPassengers()

        const newReservation = {
          id: Math.random().toString(36).substr(2, 9),
          name: generateRandomName(),
          phone: generateRandomPhone(),
          pickupDate: date,
          pickupTime: time,
          pickupLocation: address,
          destination: `${municipalities[Math.floor(Math.random() * municipalities.length)]}, Canarias`,
          adults,
          children,
          pmr,
          observations: Math.random() > 0.7 ? "Necesito coche con maletero grande" : "",
          timestamp: new Date(),
          sku: generateRandomSKU(),
          status: "active" as const,
          is_fake: true,
        }

        const existingReservations = JSON.parse(localStorage.getItem("reservations") || "[]")
        existingReservations.push(newReservation)
        localStorage.setItem("reservations", JSON.stringify(existingReservations))

        try {
          await fetch("/api/fake-data/save", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ type: "reservation", data: newReservation }),
          })
        } catch (error) {
          console.error("Failed to save to Supabase:", error)
        }
      },
      1000, // Changed to 1 second
    )

    return () => clearInterval(interval)
  }, [generateRandomReservations, municipalities])

  useEffect(() => {
    if (!generateRandomTaxis) return

    const interval = setInterval(
      async () => {
        const {
          generateRandomName,
          generateRandomPhone,
          generateRandomEmail,
          generateRandomLicenseNumber,
          generateRandomVehiclePlate,
          VEHICLE_MODELS,
        } = await import("@/lib/randomDataGenerator")

        const municipality = municipalities[Math.floor(Math.random() * municipalities.length)]
        if (!municipality) return

        const newTaxi = {
          id: Math.random().toString(36).substr(2, 9),
          name: generateRandomName(),
          phone: generateRandomPhone(),
          email: generateRandomEmail(),
          licenseNumber: generateRandomLicenseNumber(),
          island: selectedIsland,
          municipality: municipality,
          vehiclePlate: generateRandomVehiclePlate(),
          model: VEHICLE_MODELS[Math.floor(Math.random() * VEHICLE_MODELS.length)],
          seats: Math.floor(Math.random() * 3) + 4,
          pmrAdapted: Math.random() > 0.7,
          username: `taxi_${Math.random().toString(36).substr(2, 8)}`,
          password: Math.random().toString(36).substr(2, 10),
          realtimeLocationEnabled: false,
          is_fake: true,
        }

        const existingTaxis = JSON.parse(localStorage.getItem("taxi_drivers") || "[]")
        existingTaxis.push(newTaxi)
        localStorage.setItem("taxi_drivers", JSON.stringify(existingTaxis))

        try {
          await fetch("/api/fake-data/save", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ type: "taxi_driver", data: newTaxi }),
          })
        } catch (error) {
          console.error("Failed to save to Supabase:", error)
        }
      },
      1000, // Changed to 1 second
    )

    return () => clearInterval(interval)
  }, [generateRandomTaxis, municipalities])

  useEffect(() => {
    if (!generateRandomLogs) return

    const interval = setInterval(() => {
      const logTypes = ["login", "logout", "accept_reservation", "reject_reservation", "complete_reservation"]
      const drivers = JSON.parse(localStorage.getItem("taxi_drivers") || "[]")

      if (drivers.length === 0) return

      const randomDriver = drivers[Math.floor(Math.random() * drivers.length)]
      const logType = logTypes[Math.floor(Math.random() * logTypes.length)]

      const messages: Record<string, string> = {
        login: `Taxista ${randomDriver.name} inició sesión`,
        logout: `Taxista ${randomDriver.name} cerró sesión`,
        accept_reservation: `Taxista ${randomDriver.name} aceptó una reserva`,
        reject_reservation: `Taxista ${randomDriver.name} rechazó una reserva`,
        complete_reservation: `Taxista ${randomDriver.name} completó una reserva`,
      }

      const newLog = {
        id: Math.random().toString(36).substr(2, 9),
        type: logType,
        message: messages[logType],
        driverId: randomDriver.id,
        timestamp: new Date().toISOString(),
        is_fake: true,
      }

      const existingLogs = JSON.parse(localStorage.getItem("admin_logs") || "[]")
      existingLogs.push(newLog)
      localStorage.setItem("admin_logs", JSON.stringify(existingLogs))

      try {
        fetch("/api/fake-data/save", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ type: "activity_log", data: newLog }),
        }).catch((error) => console.error("Failed to save log to Supabase:", error))
      } catch (error) {
        console.error("Failed to save log to Supabase:", error)
      }
    }, 1000) // Changed to 1 second

    return () => clearInterval(interval)
  }, [generateRandomLogs])

  const deleteFakeData = async (tab: string) => {
    try {
      await fetch("/api/fake-data/delete", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: tab === "reservations" ? "reservation" : tab === "drivers" ? "taxi_driver" : "activity_log",
        }),
      })

      // Remove from localStorage
      if (tab === "reservations") {
        const realReservations = reservations.filter((res: any) => !res.is_fake)
        localStorage.setItem("reservations", JSON.stringify(realReservations))
      } else if (tab === "drivers") {
        const realDrivers = drivers.filter((driver: any) => !driver.is_fake)
        localStorage.setItem("taxi_drivers", JSON.stringify(realDrivers))
      } else if (tab === "logs") {
        const realLogs = logs.filter((log: any) => !log.is_fake)
        localStorage.setItem("admin_logs", JSON.stringify(realLogs))
      }

      window.location.href = window.location.href
    } catch (error) {
      console.error("Failed to delete fake data:", error)
    }
  }

  const getDaysInMonth = (date: Date) => new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()
  const getFirstDayOfMonth = (date: Date) => new Date(date.getFullYear(), date.getMonth(), 1).getDay()
  const daysInMonth = getDaysInMonth(currentMonth)
  const firstDay = getFirstDayOfMonth(currentMonth)

  const getReservationsForDay = (day: number, dateStr: string) => {
    const [dayPart, monthPart, yearPart] = dateStr.split("/")
    return reservations.filter((res) => {
      if (!res.pickupDate) return false
      const [resYear, resMonth, resDay] = res.pickupDate.split("-")
      return (
        Number.parseInt(resDay) === Number.parseInt(dayPart) &&
        Number.parseInt(resMonth) === Number.parseInt(monthPart) &&
        Number.parseInt(resYear) === Number.parseInt(yearPart)
      )
    })
  }

  const getLogsForDay = (dateStr: string) => {
    const [dayPart, monthPart, yearPart] = dateStr.split("/")
    return logs.filter((log) => {
      const logDate = new Date(log.timestamp)
      return (
        logDate.getDate() === Number.parseInt(dayPart) &&
        logDate.getMonth() + 1 === Number.parseInt(monthPart) &&
        logDate.getFullYear() === Number.parseInt(yearPart)
      )
    })
  }

  const formatDateForComparison = (date: Date): string => {
    const day = String(date.getDate()).padStart(2, "0")
    const month = String(date.getMonth() + 1).padStart(2, "0")
    const year = date.getFullYear()
    return `${day}/${month}/${year}`
  }

  const formatDateDDMMYYYY = (dateStr: string): string => {
    if (!dateStr) return ""
    const [year, month, day] = dateStr.split("-")
    return `${day}/${month}/${year}`
  }

  const getReservationStatus = (res: Reservation): string => {
    const now = new Date()
    const pickupDateTime = new Date(`${res.pickupDate}T${res.pickupTime || "00:00"}`)

    if (res.status === "cancelled") return "cancelada"
    if (pickupDateTime < now) return "expirada"
    if (res.acceptedBy) return "aceptada"
    return "pendiente"
  }

  const filteredReservations = reservations.filter((res: any) => {
    const searchLower = searchReservations.toLowerCase()
    return (
      res.name?.toLowerCase().includes(searchLower) ||
      res.phone?.includes(searchReservations) ||
      res.sku?.includes(searchReservations) ||
      res.pickupLocation?.toLowerCase().includes(searchLower) ||
      res.destination?.toLowerCase().includes(searchLower) ||
      res.observations?.toLowerCase().includes(searchLower) ||
      `${res.adults}`.includes(searchReservations) ||
      `${res.children}`.includes(searchReservations) ||
      `${res.pmr}`.includes(searchReservations)
    )
  })

  const filteredDrivers = drivers.filter((driver: any) => {
    const searchLower = searchDrivers.toLowerCase()
    return (
      driver.name?.toLowerCase().includes(searchLower) ||
      driver.username?.toLowerCase().includes(searchLower) ||
      driver.email?.toLowerCase().includes(searchLower) ||
      driver.phone?.includes(searchDrivers) ||
      driver.licenseNumber?.includes(searchDrivers) ||
      driver.vehiclePlate?.toLowerCase().includes(searchLower) ||
      driver.model?.toLowerCase().includes(searchLower) ||
      `${driver.seats}`.includes(searchDrivers) ||
      driver.municipality?.toLowerCase().includes(searchLower)
    )
  })

  const filteredLogs = logs.filter((log: any) => {
    const searchLower = searchLogs.toLowerCase()
    return (
      log.message?.toLowerCase().includes(searchLower) ||
      log.type?.toLowerCase().includes(searchLower) ||
      log.driverId?.toLowerCase().includes(searchLower)
    )
  })

  const filteredSuggestions = suggestions.filter((sug: any) => {
    const searchLower = searchSuggestions.toLowerCase()
    return sug.message?.toLowerCase().includes(searchLower) || sug.phone?.includes(searchSuggestions)
  })

  const filteredTrash = deletedReservations.filter((res: any) => {
    const searchLower = searchTrash.toLowerCase()
    return (
      res.name?.toLowerCase().includes(searchLower) ||
      res.phone?.includes(searchTrash) ||
      res.sku?.includes(searchTrash)
    )
  })

  return (
    <div className="bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl p-6 md:p-8">
      <div className="flex justify-between items-center mb-6 pb-4 border-b-2 border-sky-200">
        <h2 className="text-2xl font-semibold bg-gradient-to-r from-sky-600 to-orange-600 bg-clip-text text-transparent">
          Panel de Administración
        </h2>
        <button
          onClick={onLogout}
          className="flex items-center gap-2 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition font-medium"
        >
          <LogOut className="w-4 h-4" />
          Cerrar sesión
        </button>
      </div>

      <div className="flex gap-2 mb-6 bg-sky-50 rounded-lg p-2 overflow-x-auto">
        {["reservations", "drivers", "password_reset", "logs", "commissions", "suggestions", "trash"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition ${
              activeTab === tab ? "bg-orange-500 text-white" : "bg-white text-sky-600 hover:bg-sky-100"
            }`}
          >
            {tab === "reservations" && "Reservas"}
            {tab === "drivers" && "Taxistas"}
            {tab === "password_reset" && "Restablecer Contraseña"}
            {tab === "logs" && "Historial"}
            {tab === "commissions" && "Comisiones"}
            {tab === "suggestions" && "Sugerencias"}
            {tab === "trash" && "Papelera"}
          </button>
        ))}
      </div>

      <div>
        {activeTab === "password_reset" && (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-sky-900 mb-4">Solicitudes de Restablecimiento de Contraseña</h2>

            {resetRequests.filter((r) => !r.approved).length === 0 ? (
              <div className="text-center py-8 text-sky-600">No hay solicitudes pendientes</div>
            ) : (
              <div className="space-y-3">
                {resetRequests
                  .filter((r) => !r.approved)
                  .map((request) => (
                    <div
                      key={request.id}
                      className="p-4 border border-orange-200 rounded-lg bg-gradient-to-r from-orange-50 to-orange-100"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-semibold text-sky-900">Usuario: {request.username}</p>
                          <p className="text-sm text-sky-700">Email: {request.email}</p>
                          <p className="text-xs text-sky-600 mt-1">
                            Solicitado: {new Date(request.requestedAt).toLocaleString("es-ES")}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleApprovePasswordReset(request.id, request.username)}
                            className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition font-medium text-sm flex items-center gap-2"
                          >
                            <CheckCircle className="w-4 h-4" />
                            Aprobar
                          </button>
                          <button
                            onClick={() => handleRejectPasswordReset(request.id)}
                            className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition font-medium text-sm"
                          >
                            Rechazar
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            )}

            <div className="mt-8">
              <h3 className="text-lg font-bold text-sky-900 mb-3">Solicitudes Aprobadas</h3>
              {resetRequests.filter((r) => r.approved).length === 0 ? (
                <div className="text-center py-6 text-sky-600">No hay solicitudes aprobadas</div>
              ) : (
                <div className="space-y-2">
                  {resetRequests
                    .filter((r) => r.approved)
                    .map((request) => (
                      <div key={request.id} className="p-3 border border-green-200 rounded-lg bg-green-50">
                        <p className="font-medium text-green-900">{request.username}</p>
                        <p className="text-xs text-green-700">
                          Aprobado el {new Date(request.requestedAt).toLocaleString("es-ES")}
                        </p>
                      </div>
                    ))}
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === "reservations" && (
          <div className="space-y-4">
            <div className="flex gap-4 flex-wrap items-center">
              <label className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg">
                <input
                  type="checkbox"
                  checked={generateRandomReservations}
                  onChange={(e) => setGenerateRandomReservations(e.target.checked)}
                  className="w-4 h-4"
                />
                <span className="font-medium text-blue-900">Generar Reservas Aleatorias</span>
              </label>
              <select
                value={selectedIsland}
                onChange={(e) => setSelectedIsland(e.target.value)}
                className="px-4 py-2 border border-blue-200 rounded-lg focus:ring-2 focus:ring-orange-400"
              >
                <option>Gran Canaria</option>
                <option>Tenerife</option>
                <option>Fuerteventura</option>
                <option>Lanzarote</option>
              </select>
              {reservations.some((res: any) => res.is_fake) && (
                <button
                  onClick={() => deleteFakeData("reservations")}
                  className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition font-medium text-sm"
                >
                  Eliminar Datos Ficticios
                </button>
              )}
            </div>

            <input
              type="text"
              placeholder="Buscar por nombre, teléfono, SKU, ubicación, destino, observaciones o pasajeros..."
              value={searchReservations}
              onChange={(e) => setSearchReservations(e.target.value)}
              className="w-full px-4 py-2 border border-sky-200 rounded-lg focus:ring-2 focus:ring-orange-400"
            />

            <ReservationCalendar
              reservations={reservations}
              onSelectDay={(day, month) => {
                setSelectedCalendarDate(formatDateForComparison(new Date(month.getFullYear(), month.getMonth(), day)))
              }}
              onBack={() => setSelectedCalendarDate(null)}
              title="Historial de Reservas"
            />

            {selectedCalendarDate && (
              <div className="space-y-4">
                <button
                  onClick={() => setSelectedCalendarDate(null)}
                  className="flex items-center gap-2 px-4 py-2 bg-sky-100 text-sky-700 hover:bg-sky-200 rounded-lg transition font-medium"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Volver al Calendario
                </button>
                <h3 className="text-lg font-semibold text-sky-900">Reservas del {selectedCalendarDate}</h3>

                {getReservationsForDay(Number.parseInt(selectedCalendarDate.split("/")[0]), selectedCalendarDate)
                  .length === 0 ? (
                  <p className="text-center py-12 text-sky-600">No hay reservas para este día</p>
                ) : (
                  <div className="grid gap-4">
                    {getReservationsForDay(
                      Number.parseInt(selectedCalendarDate.split("/")[0]),
                      selectedCalendarDate,
                    ).map((res) => (
                      <TicketReservationCard
                        key={res.id}
                        reservation={res}
                        status={getReservationStatus(res)}
                        driverName={drivers.find((d: any) => d.username === res.acceptedBy)?.name}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {activeTab === "drivers" && (
          <div className="space-y-4">
            <div className="flex gap-4 flex-wrap items-center">
              <label className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg">
                <input
                  type="checkbox"
                  checked={generateRandomTaxis}
                  onChange={(e) => setGenerateRandomTaxis(e.target.checked)}
                  className="w-4 h-4"
                />
                <span className="font-medium text-blue-900">Generar Taxistas Aleatorios</span>
              </label>
              {drivers.some((driver: any) => driver.is_fake) && (
                <button
                  onClick={() => deleteFakeData("drivers")}
                  className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition font-medium text-sm"
                >
                  Eliminar Datos Ficticios
                </button>
              )}
            </div>

            <input
              type="text"
              placeholder="Buscar por nombre, usuario, email, teléfono, licencia, matrícula, modelo, plazas o municipio..."
              value={searchDrivers}
              onChange={(e) => setSearchDrivers(e.target.value)}
              className="w-full px-4 py-2 border border-sky-200 rounded-lg focus:ring-2 focus:ring-orange-400"
            />

            <div className="grid gap-4 md:grid-cols-2">
              {filteredDrivers.map((driver: any) => (
                <div
                  key={driver.id}
                  className="p-4 border-2 border-sky-300 rounded-lg bg-gradient-to-br from-sky-50 to-cyan-50 hover:shadow-lg transition relative"
                >
                  {driver.is_fake && (
                    <div className="absolute top-4 right-4">
                      <span className="bg-purple-500 text-white text-xs font-semibold px-3 py-1 rounded-full">
                        Ficticio
                      </span>
                    </div>
                  )}

                  <div className="space-y-2">
                    <h3 className="font-bold text-lg text-sky-900 pr-20">{driver.name}</h3>
                    <p className="text-sm text-sky-700">
                      <strong>Usuario:</strong> {driver.username}
                    </p>
                    <p className="text-sm text-sky-700">
                      <strong>Teléfono:</strong> {driver.phone}
                    </p>
                    <p className="text-sm text-sky-700">
                      <strong>Email:</strong> {driver.email}
                    </p>
                    <p className="text-sm text-sky-700">
                      <strong>Número de Licencia:</strong> {driver.licenseNumber}
                    </p>
                    <p className="text-sm text-sky-700">
                      <strong>Isla:</strong> {driver.island}
                    </p>
                    <p className="text-sm text-sky-700">
                      <strong>Municipio:</strong> {driver.municipality}
                    </p>
                    <p className="text-sm text-sky-700">
                      <strong>Matrícula:</strong> {driver.vehiclePlate}
                    </p>
                    <p className="text-sm text-sky-700">
                      <strong>Modelo:</strong> {driver.model}
                    </p>
                    <p className="text-sm text-sky-700">
                      <strong>Plazas:</strong> {driver.seats}
                    </p>
                    <p className="text-sm text-sky-700">
                      <strong>Adaptado PMR:</strong> {driver.pmrAdapted ? "Sí" : "No"}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === "logs" && (
          <div className="space-y-4">
            <div className="flex gap-4 flex-wrap items-center">
              <label className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg">
                <input
                  type="checkbox"
                  checked={generateRandomLogs}
                  onChange={(e) => setGenerateRandomLogs(e.target.checked)}
                  className="w-4 h-4"
                />
                <span className="font-medium text-blue-900">Generar Logs Aleatorios</span>
              </label>
              {logs.some((log: any) => log.is_fake) && (
                <button
                  onClick={() => deleteFakeData("logs")}
                  className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition font-medium text-sm"
                >
                  Eliminar Datos Ficticios
                </button>
              )}
            </div>

            <input
              type="text"
              placeholder="Buscar en historial de actividad..."
              value={searchLogs}
              onChange={(e) => setSearchLogs(e.target.value)}
              className="w-full px-4 py-2 border border-sky-200 rounded-lg focus:ring-2 focus:ring-orange-400"
            />

            <ReservationCalendar
              reservations={logs.map((log: any) => ({
                id: log.id,
                pickupDate: new Date(log.timestamp).toISOString().split("T")[0],
                pickupTime: "",
                sku: log.id,
              }))}
              onSelectDay={(day, month) => {
                setSelectedCalendarDate(formatDateForComparison(new Date(month.getFullYear(), month.getMonth(), day)))
              }}
              onBack={() => setSelectedCalendarDate(null)}
              title="Historial de Actividad"
              showDots={true}
            />

            {selectedCalendarDate && (
              <div className="space-y-4">
                <button
                  onClick={() => setSelectedCalendarDate(null)}
                  className="flex items-center gap-2 px-4 py-2 bg-sky-100 text-sky-700 hover:bg-sky-200 rounded-lg transition font-medium"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Volver al Calendario
                </button>
                <h3 className="text-lg font-semibold text-sky-900">Actividad del {selectedCalendarDate}</h3>

                {getLogsForDay(selectedCalendarDate).length === 0 ? (
                  <p className="text-center py-12 text-sky-600">No hay actividad para este día</p>
                ) : (
                  <div className="grid gap-2">
                    {getLogsForDay(selectedCalendarDate).map((log) => (
                      <div
                        key={log.id}
                        className="p-3 border border-sky-200 rounded-lg bg-sky-50 text-sm text-sky-700 relative"
                      >
                        {log.is_fake && (
                          <span className="absolute top-3 right-3 bg-purple-500 text-white text-xs font-semibold px-2 py-1 rounded-full">
                            Ficticio
                          </span>
                        )}
                        <p className="font-medium text-sky-900 pr-24">{log.message}</p>
                        <p className="text-xs text-sky-600 mt-1">
                          {new Date(log.timestamp).toLocaleTimeString("es-ES")}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {activeTab === "commissions" && (
          <div className="space-y-4">
            <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
              <label className="block text-sm font-medium text-orange-900 mb-2">Valor de Comisión (€)</label>
              <input
                type="number"
                value={commissionValue}
                onChange={(e) => setCommissionValue(Number.parseFloat(e.target.value) || 0)}
                className="w-full px-4 py-2 border border-orange-200 rounded-lg focus:ring-2 focus:ring-orange-400"
                placeholder="Ej: 5.00"
              />
            </div>

            <ReservationCalendar
              reservations={reservations}
              onSelectDay={(day, month) => {
                setSelectedCalendarDate(formatDateForComparison(new Date(month.getFullYear(), month.getMonth(), day)))
              }}
              onBack={() => setSelectedCalendarDate(null)}
              title="Comisiones"
              showDots={true}
            />

            {selectedCalendarDate && (
              <div className="space-y-4">
                <button
                  onClick={() => setSelectedCalendarDate(null)}
                  className="flex items-center gap-2 px-4 py-2 bg-sky-100 text-sky-700 hover:bg-sky-200 rounded-lg transition font-medium"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Volver al Calendario
                </button>
                <h3 className="text-lg font-semibold text-sky-900">Comisiones del {selectedCalendarDate}</h3>

                {getReservationsForDay(
                  Number.parseInt(selectedCalendarDate.split("/")[0]),
                  selectedCalendarDate,
                ).filter((r) => r.acceptedBy && r.completed).length === 0 ? (
                  <p className="text-center py-12 text-sky-600">No hay viajes completados para este día</p>
                ) : (
                  <div className="grid gap-4">
                    {drivers.map((driver: any) => {
                      const completedTrips = getReservationsForDay(
                        Number.parseInt(selectedCalendarDate.split("/")[0]),
                        selectedCalendarDate,
                      ).filter((r) => r.acceptedBy === driver.username && r.completed)

                      return completedTrips.length > 0 ? (
                        <div key={driver.id} className="p-4 border border-orange-200 rounded-lg bg-orange-50">
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="font-semibold text-orange-900">{driver.name}</p>
                              <p className="text-sm text-orange-700">Usuario: {driver.username}</p>
                              <p className="text-sm text-orange-700 mt-2">
                                Viajes completados: {completedTrips.length}
                              </p>
                              <p className="text-lg font-bold text-orange-900 mt-2">
                                Comisión: €{(completedTrips.length * commissionValue).toFixed(2)}
                              </p>
                            </div>
                          </div>
                        </div>
                      ) : null
                    })}
                  </div>
                )}
              </div>
            )}

            {!selectedCalendarDate && (
              <button
                onClick={() => setShowCommissionMonthly(!showCommissionMonthly)}
                className="w-full py-3 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-lg transition"
              >
                {showCommissionMonthly ? "Ocultar" : "Mostrar"} Comisión Mensual
              </button>
            )}

            {showCommissionMonthly && !selectedCalendarDate && (
              <div className="p-6 bg-orange-100 border border-orange-300 rounded-lg">
                <h3 className="font-bold text-orange-900 mb-4 text-lg">Comisión Total del Mes</h3>
                <div className="space-y-3">
                  {drivers.map((driver: any) => {
                    const monthlyCompleted = reservations.filter((r) => r.acceptedBy === driver.username && r.completed)

                    return monthlyCompleted.length > 0 ? (
                      <div key={driver.id} className="p-3 bg-white rounded-lg flex justify-between items-center">
                        <p className="font-medium text-orange-900">{driver.name}</p>
                        <p className="text-lg font-bold text-orange-900">
                          €{(monthlyCompleted.length * commissionValue).toFixed(2)}
                        </p>
                      </div>
                    ) : null
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === "suggestions" && (
          <div className="space-y-4">
            <input
              type="text"
              placeholder="Buscar sugerencias..."
              value={searchSuggestions}
              onChange={(e) => setSearchSuggestions(e.target.value)}
              className="w-full px-4 py-2 border border-sky-200 rounded-lg focus:ring-2 focus:ring-orange-400"
            />
            <div className="grid gap-3">
              {filteredSuggestions.map((sug) => (
                <div key={sug.id} className="p-4 border border-orange-200 rounded-lg bg-orange-50">
                  <p className="font-medium text-orange-900">{sug.phone}</p>
                  <p className="text-sm text-orange-800 mt-1">{sug.message}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === "trash" && (
          <div className="space-y-4">
            <input
              type="text"
              placeholder="Buscar en papelera..."
              value={searchTrash}
              onChange={(e) => setSearchTrash(e.target.value)}
              className="w-full px-4 py-2 border border-sky-200 rounded-lg focus:ring-2 focus:ring-orange-400"
            />
            <div className="grid gap-3">
              {filteredTrash.map((res) => (
                <div key={res.id} className="p-4 border border-red-200 rounded-lg bg-red-50">
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <p className="font-medium text-red-900">{res.name}</p>
                      <p className="text-red-700">{res.phone}</p>
                    </div>
                    <div className="text-red-800">
                      <p>
                        <span className="font-medium">SKU:</span> {res.sku}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
