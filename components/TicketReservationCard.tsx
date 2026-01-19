"use client"

import { Ticket, MapPin, Clock, Users, MessageSquare } from "lucide-react"

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
  sku: string
  status: "active" | "cancelled" | "completed" | "accepted"
  acceptedBy?: string
  is_fake?: boolean
}

interface TicketReservationCardProps {
  reservation: Reservation
  status: string
  driverName?: string
}

export default function TicketReservationCard({ reservation, status, driverName }: TicketReservationCardProps) {
  const formatDateDDMMYYYY = (dateStr: string): string => {
    if (!dateStr) return ""
    const [year, month, day] = dateStr.split("-")
    return `${day}/${month}/${year}`
  }

  const getStatusColor = (statusType: string) => {
    switch (statusType) {
      case "aceptada":
        return { bg: "bg-green-50", border: "border-green-200", tag: "bg-green-500", text: "text-green-900" }
      case "pendiente":
        return { bg: "bg-yellow-50", border: "border-yellow-200", tag: "bg-yellow-600", text: "text-yellow-900" }
      case "cancelada":
        return { bg: "bg-red-50", border: "border-red-200", tag: "bg-red-500", text: "text-red-900" }
      case "expirada":
        return { bg: "bg-gray-50", border: "border-gray-200", tag: "bg-gray-600", text: "text-gray-900" }
      case "ficticio":
        return { bg: "bg-purple-50", border: "border-purple-200", tag: "bg-purple-500", text: "text-purple-900" }
      default:
        return { bg: "bg-sky-50", border: "border-sky-200", tag: "bg-sky-600", text: "text-sky-900" }
    }
  }

  const statusColor = getStatusColor(status)

  // Determinar tags a mostrar
  const tags: string[] = []

  if (reservation.is_fake) tags.push("ficticio")
  if (reservation.status === "cancelled") tags.push("cancelada")
  else {
    const now = new Date()
    const pickupDateTime = new Date(`${reservation.pickupDate}T${reservation.pickupTime || "00:00"}`)

    if (pickupDateTime < now) tags.push("expirada")
    if (reservation.acceptedBy) tags.push("aceptada")
    else tags.push("pendiente")
  }

  return (
    <div className={`${statusColor.bg} border-2 ${statusColor.border} rounded-xl p-6 shadow-lg hover:shadow-xl transition`}>
      {/* Header: SKU y Tags */}
      <div className="flex justify-between items-start mb-4 pb-4 border-b-2 border-opacity-30 border-current">
        <div className="flex items-center gap-3">
          <Ticket className={`w-6 h-6 ${statusColor.text}`} />
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-widest">Reserva</p>
            <p className={`text-2xl font-bold ${statusColor.text}`}>{reservation.sku}</p>
          </div>
        </div>
        <div className="flex gap-2 flex-wrap justify-end max-w-xs">
          {tags.map((tag) => {
            const tagColor = getStatusColor(tag)
            return (
              <span
                key={tag}
                className={`${tagColor.tag} text-white text-xs font-semibold px-3 py-1 rounded-full`}
              >
                {tag.charAt(0).toUpperCase() + tag.slice(1)}
              </span>
            )
          })}
        </div>
      </div>

      {/* Cliente */}
      <div className="mb-4">
        <p className={`text-sm font-semibold ${statusColor.text} opacity-70 mb-1`}>CLIENTE</p>
        <p className={`text-xl font-bold ${statusColor.text}`}>{reservation.name}</p>
        <p className={`text-sm ${statusColor.text} opacity-70`}>📞 {reservation.phone}</p>
      </div>

      {/* Taxista asignado */}
      {driverName && (
        <div className="mb-4 p-3 bg-white bg-opacity-50 rounded-lg">
          <p className={`text-xs font-semibold ${statusColor.text} opacity-70 mb-1`}>TAXISTA ASIGNADO</p>
          <p className={`text-sm font-medium ${statusColor.text}`}>{driverName}</p>
        </div>
      )}

      {/* Detalles de recogida */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <p className={`text-xs font-semibold ${statusColor.text} opacity-70 mb-1 flex items-center gap-1`}>
            <Clock className="w-3 h-3" /> RECOGIDA
          </p>
          <p className={`font-bold ${statusColor.text}`}>{formatDateDDMMYYYY(reservation.pickupDate)}</p>
          <p className={`text-sm ${statusColor.text} opacity-70`}>{reservation.pickupTime}</p>
        </div>
        <div>
          <p className={`text-xs font-semibold ${statusColor.text} opacity-70 mb-1 flex items-center gap-1`}>
            <MapPin className="w-3 h-3" /> UBICACIÓN
          </p>
          <p className={`text-sm font-medium ${statusColor.text}`}>{reservation.pickupLocation}</p>
        </div>
      </div>

      {/* Destino */}
      <div className="mb-4">
        <p className={`text-xs font-semibold ${statusColor.text} opacity-70 mb-1 flex items-center gap-1`}>
          <MapPin className="w-3 h-3" /> DESTINO
        </p>
        <p className={`text-sm font-medium ${statusColor.text}`}>{reservation.destination}</p>
      </div>

      {/* Pasajeros */}
      <div className="mb-4 p-3 bg-white bg-opacity-50 rounded-lg">
        <p className={`text-xs font-semibold ${statusColor.text} opacity-70 mb-2 flex items-center gap-1`}>
          <Users className="w-3 h-3" /> PASAJEROS
        </p>
        <div className="grid grid-cols-3 gap-2">
          <div>
            <p className="text-xs text-gray-600 font-medium">Adultos</p>
            <p className={`text-lg font-bold ${statusColor.text}`}>{reservation.adults}</p>
          </div>
          <div>
            <p className="text-xs text-gray-600 font-medium">Niños</p>
            <p className={`text-lg font-bold ${statusColor.text}`}>{reservation.children}</p>
          </div>
          <div>
            <p className="text-xs text-gray-600 font-medium">PMR</p>
            <p className={`text-lg font-bold ${statusColor.text}`}>{reservation.pmr}</p>
          </div>
        </div>
      </div>

      {/* Observaciones especiales */}
      {reservation.observations && (
        <div className="p-3 bg-white bg-opacity-50 rounded-lg border border-current border-opacity-20">
          <p className={`text-xs font-semibold ${statusColor.text} opacity-70 mb-2 flex items-center gap-1`}>
            <MessageSquare className="w-3 h-3" /> OBSERVACIONES ESPECIALES
          </p>
          <p className={`text-sm ${statusColor.text} italic`}>{reservation.observations}</p>
        </div>
      )}
    </div>
  )
}
