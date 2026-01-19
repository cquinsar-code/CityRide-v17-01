"use client"

import { useState } from "react"
import { ChevronLeft, ChevronRight, ArrowLeft } from "lucide-react"
import "react-calendar/dist/Calendar.css"

export interface Reservation {
  id: string
  pickupDate: string
  acceptedBy?: string | null
  [key: string]: any
}

interface ReservationCalendarProps {
  reservations: Reservation[]
  onSelectDay: (day: number, month: Date) => void
  onBack: () => void
  filterByDriver?: string
  title: string
}

export default function ReservationCalendar({
  reservations,
  onSelectDay,
  onBack,
  filterByDriver,
  title,
}: ReservationCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date())

  // Filtrar reservas para un día específico
  const getReservationsForDay = (day: number, month: Date): Reservation[] => {
    return reservations.filter((res) => {
      const resDate = new Date(res.pickupDate)
      const matchesDriver = !filterByDriver || res.acceptedBy === filterByDriver
      return (
        resDate.getDate() === day &&
        resDate.getMonth() === month.getMonth() &&
        resDate.getFullYear() === month.getFullYear() &&
        matchesDriver
      )
    })
  }

  // Obtener días del mes que tienen reservas
  const getDaysWithReservations = (): number[] => {
    const days = new Set<number>()
    reservations.forEach((res) => {
      const resDate = new Date(res.pickupDate)
      if (
        resDate.getMonth() === currentMonth.getMonth() &&
        resDate.getFullYear() === currentMonth.getFullYear()
      ) {
        const matchesDriver = !filterByDriver || res.acceptedBy === filterByDriver
        if (matchesDriver) days.add(resDate.getDate())
      }
    })
    return Array.from(days)
  }

  const daysWithReservations = getDaysWithReservations()

  const daysInMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0).getDate()
  const firstDay = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1).getDay()
  const mondayFirst = (firstDay + 6) % 7 // Convert Sunday=0 to Monday=0

  const previousMonth = () => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))
  const nextMonth = () => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))

  const handleDayClick = (day: number) => {
    if (getReservationsForDay(day, currentMonth).length > 0) {
      onSelectDay(day, currentMonth)
    }
  }

  const monthYear = currentMonth.toLocaleString("es-ES", { month: "long", year: "numeric" })

  const calendarDays: (number | null)[] = []
  for (let i = 0; i < mondayFirst; i++) calendarDays.push(null)
  for (let day = 1; day <= daysInMonth; day++) calendarDays.push(day)

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="flex items-center gap-2 px-4 py-2 bg-sky-100 text-sky-700 hover:bg-sky-200 rounded-lg transition font-medium"
        >
          <ArrowLeft className="w-4 h-4" />
          Volver
        </button>
        <h3 className="text-lg font-semibold text-sky-900 capitalize">{title}</h3>
        <div className="w-24"></div>
      </div>

      {/* Calendar */}
      <div className="bg-white rounded-lg border border-sky-200 p-6">
        {/* Month Navigation */}
        <div className="flex items-center justify-between mb-6">
          <button onClick={previousMonth} className="p-2 hover:bg-sky-100 rounded-lg transition">
            <ChevronLeft className="w-5 h-5 text-sky-600" />
          </button>
          <h4 className="text-lg font-semibold text-sky-900 capitalize">{monthYear}</h4>
          <button onClick={nextMonth} className="p-2 hover:bg-sky-100 rounded-lg transition">
            <ChevronRight className="w-5 h-5 text-sky-600" />
          </button>
        </div>

        {/* Days Header */}
        <div className="grid grid-cols-7 gap-2 mb-4">
          {["L", "M", "X", "J", "V", "S", "D"].map((day) => (
            <div key={day} className="text-center font-semibold text-sky-700 py-2">
              {day}
            </div>
          ))}

          {/* Calendar Days */}
          {calendarDays.map((day, index) => (
            <div key={index} className="aspect-square flex flex-col items-center justify-center relative">
              {day ? (
                <button
                  onClick={() => handleDayClick(day)}
                  disabled={!daysWithReservations.includes(day)}
                  className={`w-full h-full flex flex-col items-center justify-center rounded-lg relative transition
                    ${
                      daysWithReservations.includes(day)
                        ? "bg-orange-100 hover:bg-orange-200 cursor-pointer"
                        : "bg-gray-100 text-gray-400 cursor-not-allowed"
                    }
                  `}
                >
                  <span className="font-semibold text-sm">{day}</span>
                  {daysWithReservations.includes(day) && (
                    <span className="absolute bottom-1 w-2 h-2 bg-green-500 rounded-full"></span>
                  )}
                </button>
              ) : null}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
