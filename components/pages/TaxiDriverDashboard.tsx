"use client"

import type React from "react"
import { useEffect, useMemo, useState } from "react"
import { LogOut, Eye, EyeOff, MapPin, ArrowLeft } from "lucide-react"
import ReservationCalendar from "../ReservationCalendar"

/* =====================
   TIPOS
===================== */

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
}

interface Reservation {
  id: string
  name: string
  phone: string
  pickupDate: string // YYYY-MM-DD
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
  completed?: boolean
}

/* =====================
   HELPERS
===================== */

const getLS = <T,>(key: string, fallback: T): T => {
  if (typeof window === "undefined") return fallback
  try {
    return JSON.parse(localStorage.getItem(key) || "") || fallback
  } catch {
    return fallback
  }
}

const formatDateDDMMYYYY = (date: string) => {
  const [y, m, d] = date.split("-")
  return `${d}/${m}/${y}`
}

/* =====================
   COMPONENTE
===================== */

export default function TaxiDriverDashboard({
  driver,
  onLogout,
  onLogin,
}: {
  driver?: Driver | null
  onLogout: () => void
  onLogin?: (driver: Driver) => void
}) {
  const [loggedDriver, setLoggedDriver] = useState<Driver | null>(driver || null)
  const [activeTab, setActiveTab] = useState<"requests" | "myreservations" | "profile">("requests")

  const [showForgotPanel, setShowForgotPanel] = useState(false)
  const [showResetPanel, setShowResetPanel] = useState(false)

  const [loginData, setLoginData] = useState({ username: "", password: "" })
  const [log]()
