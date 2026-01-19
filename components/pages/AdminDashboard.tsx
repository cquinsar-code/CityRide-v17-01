"use client"

import { useEffect, useState } from "react"
import { LogOut, CheckCircle, ArrowLeft } from "lucide-react"
import ReservationCalendar from "@/components/ReservationCalendar"
import TicketReservationCard from "@/components/TicketReservationCard"

/* =======================
   TIPOS
======================= */

interface AdminSession {
  username: string
}

type ReservationStatus = "active" | "cancelled" | "completed" | "accepted"

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
  timestamp: string
  sku: string
  status: ReservationStatus
  acceptedBy?: string
  is_fake?: boolean
}

interface Driver {
  id: string
  name: string
  username: string
  phone: string
  email: string
  licenseNumber: string
  island: string
  municipality: string
  vehiclePlate: string
  model: string
  seats: number
  pmrAdapted: boolean
  banned?: boolean
  is_fake?: boolean
}

interface PasswordResetRequest {
  id: string
  username: string
  email: string
  requestedAt: string
  approved: boolean
}

interface AdminLog {
  id: string
  type: string
  message: string
  driverId: string
  timestamp: string
  is_fake?: boolean
}

/* =======================
   COMPONENTE
======================= */

export default function AdminDashboard({
  admin,
  onLogout,
}: {
  admin: AdminSession
  onLogout: () => void
}) {
  const [activeTab, setActiveTab] = useState("reservations")
  const [searchReservations, setSearchReservations] = useState("")
  const [searchDrivers, setSearchDrivers] = useState("")
  const [searchLogs, setSearchLogs] = useState("")
  const [searchSuggestions, setSearchSuggestions] = useState("")
  const [searchTrash, setSearchTrash] = useState("")
  const [selectedCalendarDate, setSelectedCalendarDate] = useState<string | null>(null)
  const [commissionValue, setCommissionValue] = useState(0)
  const [showCommissionMonthly, setShowCommissionMonthly] = useState(false)

  const [generateRandomReservations, setGenerateRandomReservations] = useState(false)
  const [generateRandomTaxis, setGenerateRandomTaxis] = useState(false)
  const [generateRandomLogs, setGenerateRandomLogs] = useState(false)

  const [selectedIsland, setSelectedIsland] = useState("Gran Canaria")
  const [municipalities, setMunicipalities] = useState<string[]>([])
  const [resetRequests, setResetRequests] = useState<PasswordResetRequest[]>([])

  /* =======================
     LOCAL STORAGE (SAFE)
  ======================= */

  const getLS = <T,>(key: string, fallback: T): T => {
    if (typeof window === "undefined") return fallback
    try {
      const raw = localStorage.getItem(key)
      if (!raw) return fallback
      return JSON.parse(raw) as T
    } catch {
      return fallback
    }
  }

  const reservations = getLS<Reservation[]>("reservations", [])
  const deletedReservations = getLS<Reservation[]>("deleted_reservations", [])
  const drivers = getLS<Driver[]>("taxi_drivers", [])
  const suggestions = getLS<any[]>("suggestions", [])
  const logs = getLS<AdminLog[]>("admin_logs", [])

  /* =======================
     PASSWORD RESET
  ======================= */

  const handleApprovePasswordReset = (id: string) => {
    const updated = resetRequests.map((r) =>
      r.id === id ? { ...r, approved: true } : r,
    )
    setResetRequests(updated)
    localStorage.setItem("password_reset_requests", JSON.stringify(updated))
  }

  const handleRejectPasswordReset = (id: string) => {
    const updated = resetRequests.filter((r) => r.id !== id)
    setResetRequests(updated)
    localStorage.setItem("password_reset_requests", JSON.stringify(updated))
  }

  useEffect(() => {
    setResetRequests(getLS("password_reset_requests", []))
  }, [])

  /* =======================
     MUNICIPIOS
  ======================= */

  useEffect(() => {
    fetch(`/api/islands/municipalities?island=${selectedIsland}`)
      .then((r) => r.json())
      .then((d) => setMunicipalities(d.municipalities || []))
      .catch(() => setMunicipalities([]))
  }, [selectedIsland])

  /* =======================
     HELPERS
  ======================= */

  const formatDate = (date: Date) =>
    `${String(date.getDate()).padStart(2, "0")}/${String(
      date.getMonth() + 1,
    ).padStart(2, "0")}/${date.getFullYear()}`

  const getReservationsForDay = (date: string) => {
    const [d, m, y] = date.split("/")
    return reservations.filter((r) => {
      const [yy, mm, dd] = r.pickupDate.split("-")
      return dd === d && mm === m && yy === y
    })
  }

  const getLogsForDay = (date: string) => {
    const [d, m, y] = date.split("/")
    return logs.filter((l) => {
      const dt = new Date(l.timestamp)
      return (
        dt.getDate() === Number(d) &&
        dt.getMonth() + 1 === Number(m) &&
        dt.getFullYear() === Number(y)
      )
    })
  }

  const getReservationStatus = (r: Reservation) => {
    if (r.status === "cancelled") return "cancelada"
    if (r.status === "completed") return "completada"
    if (r.acceptedBy) return "aceptada"
    return "pendiente"
  }

  /* =======================
     RENDER
  ======================= */

  return (
    <div className="bg-white rounded-2xl shadow-2xl p-6">
      <div className="flex justify-between mb-6 border-b pb-4">
        <h2 className="text-2xl font-bold">Panel de Administración</h2>
        <button
          onClick={onLogout}
          className="flex gap-2 px-4 py-2 bg-red-500 text-white rounded-lg"
        >
          <LogOut size={16} /> Cerrar sesión
        </button>
      </div>

      {/* TABS */}
      <div className="flex gap-2 mb-6 overflow-x-auto">
        {([
          ["reservations", "Reservas"],
          ["drivers", "Taxistas"],
          ["password_reset", "Restablecer contraseña"],
          ["logs", "Historial"],
          ["commissions", "Comisiones"],
          ["suggestions", "Sugerencias"],
          ["trash", "Papelera"],
        ] as const).map(([k, label]) => (
          <button
            key={k}
            onClick={() => setActiveTab(k)}
            className={`px-4 py-2 rounded-lg ${
              activeTab === k ? "bg-orange-500 text-white" : "bg-sky-100"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* === CONTENIDO POR TAB === */}
      {activeTab === "reservations" && (
        <>
          <input
            className="w-full mb-4 p-2 border rounded"
            placeholder="Buscar reservas..."
            value={searchReservations}
            onChange={(e) => setSearchReservations(e.target.value)}
          />

          <ReservationCalendar
            reservations={reservations}
            title="Reservas"
            onSelectDay={(day, monthDate) =>
              setSelectedCalendarDate(
                formatDate(
                  new Date(
                    monthDate.getFullYear(),
                    monthDate.getMonth(),
                    day,
                  ),
                ),
              )
            }
            onBack={() => setSelectedCalendarDate(null)}
          />

          {selectedCalendarDate && (
            <>
              <button
                className="mt-4 flex items-center gap-2"
                onClick={() => setSelectedCalendarDate(null)}
              >
                <ArrowLeft size={16} /> Volver
              </button>

              <div className="grid gap-4 mt-4">
                {getReservationsForDay(selectedCalendarDate).map((r) => (
                  <TicketReservationCard
                    key={r.id}
                    reservation={r}
                    status={getReservationStatus(r)}
                    driverName={
                      drivers.find((d) => d.username === r.acceptedBy)?.name
                    }
                  />
                ))}
              </div>
            </>
          )}
        </>
      )}

      {activeTab === "logs" && (
        <>
          <input
            className="w-full mb-4 p-2 border rounded"
            placeholder="Buscar en historial..."
            value={searchLogs}
            onChange={(e) => setSearchLogs(e.target.value)}
          />

          <div className="mt-4 space-y-2">
            {logs
              .filter((l) =>
                l.message.toLowerCase().includes(searchLogs.toLowerCase()),
              )
              .map((l) => (
                <div
                  key={l.id}
                  className="p-3 border rounded flex justify-between items-center"
                >
                  <div>
                    <p className="text-sm">{l.message}</p>
                    <p className="text-xs text-gray-500">
                      {new Date(l.timestamp).toLocaleString()}
                    </p>
                  </div>
                  <span className="text-xs bg-sky-100 px-2 py-1 rounded">
                    {l.type}
                  </span>
                </div>
              ))}
          </div>
        </>
      )}

      {activeTab === "password_reset" && (
        <>
          <h3 className="text-lg font-semibold mb-4">
            Solicitudes de restablecimiento de contraseña
          </h3>
          {resetRequests.length === 0 && (
            <p className="text-sm text-gray-500">
              No hay solicitudes pendientes.
            </p>
          )}
          <div className="space-y-3">
            {resetRequests.map((r) => (
              <div
                key={r.id}
                className="p-3 border rounded flex justify-between items-center"
              >
                <div>
                  <p className="font-medium">{r.username}</p>
                  <p className="text-sm text-gray-600">{r.email}</p>
                  <p className="text-xs text-gray-500">
                    Solicitado:{" "}
                    {new Date(r.requestedAt).toLocaleString()}
                  </p>
                </div>
                <div className="flex gap-2">
                  {!r.approved && (
                    <>
                      <button
                        onClick={() => handleApprovePasswordReset(r.id)}
                        className="px-3 py-1 text-xs bg-green-500 text-white rounded flex items-center gap-1"
                      >
                        <CheckCircle size={12} /> Aprobar
                      </button>
                      <button
                        onClick={() => handleRejectPasswordReset(r.id)}
                        className="px-3 py-1 text-xs bg-red-500 text-white rounded"
                      >
                        Rechazar
                      </button>
                    </>
                  )}
                  {r.approved && (
                    <span className="text-xs text-green-600">
                      Aprobada
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* El resto de pestañas (drivers, commissions, suggestions, trash)
          las puedes ir completando igual que estas, usando los estados
          que ya tienes definidos arriba. */}
    </div>
  )
}
