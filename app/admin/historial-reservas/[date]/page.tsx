"use client"
import { useState, useEffect } from "react"
import { ArrowLeft } from "lucide-react"
import TicketReservationCard from "@/components/TicketReservationCard"
import Link from "next/link"

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
  status: "active" | "cancelled" | "completed" | "accepted"
  acceptedBy?: string
  is_fake?: boolean
}

export default function ReservationDetailPage({ params }: { params: { date: string } }) {
  const [reservations, setReservations] = useState<Reservation[]>([])
  const [drivers, setDrivers] = useState<any[]>([])
  const [selectedDate] = useState(params.date)

  useEffect(() => {
    const storedReservations: Reservation[] = JSON.parse(localStorage.getItem("reservations") || "[]")
    const storedDrivers = JSON.parse(localStorage.getItem("taxi_drivers") || "[]")

    // Filter reservations for the selected date
    const dateReservations = storedReservations.filter((res) => {
      const resDate = new Date(res.pickupDate)
      const [day, month, year] = selectedDate.split("/")
      const selectedDateObj = new Date(Number(year), Number(month) - 1, Number(day))

      return (
        resDate.getDate() === selectedDateObj.getDate() &&
        resDate.getMonth() === selectedDateObj.getMonth() &&
        resDate.getFullYear() === selectedDateObj.getFullYear()
      )
    })

    setReservations(dateReservations)
    setDrivers(storedDrivers)
  }, [selectedDate])

  const getReservationStatus = (res: Reservation): string => {
    const now = new Date()
    const pickupDateTime = new Date(`${res.pickupDate}T${res.pickupTime || "00:00"}`)

    if (res.status === "cancelled") return "cancelada"
    if (pickupDateTime < now) return "expirada"
    if (res.acceptedBy) return "aceptada"
    return "pendiente"
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-100 to-orange-100 p-6">
      <div className="max-w-4xl mx-auto">
        <Link href="/admin">
          <button className="flex items-center gap-2 px-4 py-2 bg-sky-500 hover:bg-sky-600 text-white rounded-lg transition font-medium mb-6">
            <ArrowLeft className="w-4 h-4" />
            Volver al Panel de Administración
          </button>
        </Link>

        <div className="bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl p-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-sky-600 to-orange-600 bg-clip-text text-transparent mb-6">
            Reservas del {selectedDate}
          </h1>

          {reservations.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-xl text-sky-600">No hay reservas para esta fecha</p>
            </div>
          ) : (
            <div className="grid gap-6">
              {reservations.map((res) => (
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
      </div>
    </div>
  )
}
