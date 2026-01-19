"use client"

import { useState } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"

interface CompactCalendarProps {
  selectedDate: Date | null
  onDateSelect: (date: Date) => void
  highlightedDates?: Date[]
  minDate?: Date
  maxDate?: Date
}

export default function CompactCalendar({
  selectedDate,
  onDateSelect,
  highlightedDates = [],
  minDate,
  maxDate,
}: CompactCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState<Date>(
    selectedDate ? new Date(selectedDate) : new Date()
  )

  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()
  }

  const getFirstDayOfMonth = (date: Date) => {
    const day = new Date(date.getFullYear(), date.getMonth(), 1).getDay()
    return day === 0 ? 6 : day - 1 // Convert Sunday=0 to Monday=0
  }

  const isDateHighlighted = (day: number) => {
    const checkDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day)
    return highlightedDates.some(
      (d) =>
        d.getDate() === checkDate.getDate() &&
        d.getMonth() === checkDate.getMonth() &&
        d.getFullYear() === checkDate.getFullYear()
    )
  }

  const isDateSelected = (day: number) => {
    if (!selectedDate) return false
    return (
      selectedDate.getDate() === day &&
      selectedDate.getMonth() === currentMonth.getMonth() &&
      selectedDate.getFullYear() === currentMonth.getFullYear()
    )
  }

  const isDateDisabled = (day: number) => {
    const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day)
    if (minDate && date < minDate) return true
    if (maxDate && date > maxDate) return true
    return false
  }

  const handleDateClick = (day: number) => {
    if (isDateDisabled(day)) return
    const newDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day)
    onDateSelect(newDate)
  }

  const handlePrevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))
  }

  const handleNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))
  }

  const daysInMonth = getDaysInMonth(currentMonth)
  const firstDay = getFirstDayOfMonth(currentMonth)
  const days: (number | null)[] = []

  for (let i = 0; i < firstDay; i++) days.push(null)
  for (let i = 1; i <= daysInMonth; i++) days.push(i)

  const monthNames = [
    "Enero",
    "Febrero",
    "Marzo",
    "Abril",
    "Mayo",
    "Junio",
    "Julio",
    "Agosto",
    "Septiembre",
    "Octubre",
    "Noviembre",
    "Diciembre",
  ]

  const dayNames = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"]

  return (
    <div className="w-full max-w-xs mx-auto p-3 bg-white rounded-lg shadow-md">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <button
          onClick={handlePrevMonth}
          className="p-1 hover:bg-gray-100 rounded"
          aria-label="Mes anterior"
        >
          <ChevronLeft size={18} />
        </button>
        <h3 className="text-sm font-semibold text-gray-800">
          {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
        </h3>
        <button
          onClick={handleNextMonth}
          className="p-1 hover:bg-gray-100 rounded"
          aria-label="Próximo mes"
        >
          <ChevronRight size={18} />
        </button>
      </div>

      {/* Day headers */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {dayNames.map((day) => (
          <div key={day} className="text-center text-xs font-semibold text-gray-600 h-6">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar days */}
      <div className="grid grid-cols-7 gap-1">
        {days.map((day, idx) => (
          <div key={idx} className="aspect-square flex items-center justify-center">
            {day ? (
              <button
                onClick={() => handleDateClick(day)}
                disabled={isDateDisabled(day)}
                className={`w-full h-full flex items-center justify-center rounded text-xs font-medium transition-colors relative
                  ${isDateSelected(day) ? "bg-sky-500 text-white" :
                  isDateHighlighted(day) ? "bg-sky-50 text-sky-900 hover:bg-sky-100" :
                  "text-gray-700 hover:bg-gray-100"}
                  ${isDateDisabled(day) ? "opacity-50 cursor-not-allowed" : ""}
                `}
              >
                <span>{day}</span>
                {isDateHighlighted(day) && !isDateSelected(day) && (
                  <span className="w-1 h-1 bg-green-500 rounded-full absolute bottom-0.5"></span>
                )}
              </button>
            ) : (
              <div></div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
