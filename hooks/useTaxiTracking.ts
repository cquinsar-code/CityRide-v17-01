"use client"

import { useState, useEffect, useCallback, useRef } from "react"

export interface TaxiLocation {
  lat: number
  lon: number
  address: string
  updatedAt: string
  isRealTime: boolean
}

interface UseTaxiTrackingReturn {
  taxiLocation: TaxiLocation | null
  isTracking: boolean
  error: string
  startTracking: () => void
  stopTracking: () => void
  getTaxiLocation: () => Promise<TaxiLocation | null>
}

export function useTaxiTracking(driverId: string | null): UseTaxiTrackingReturn {
  const [taxiLocation, setTaxiLocation] = useState<TaxiLocation | null>(null)
  const [isTracking, setIsTracking] = useState(false)
  const [error, setError] = useState<string>("")
  const intervalRef = useRef<NodeJS.Timer | null>(null)

  // Función para obtener la ubicación del taxi
  const getTaxiLocation = useCallback(async (): Promise<TaxiLocation | null> => {
    if (!driverId) return null

    try {
      const response = await fetch("/api/taxi/location/get", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ driverId }),
      })

      if (!response.ok) {
        setError("El taxista no tiene activada la ubicación en tiempo real")
        return null
      }

      const data = await response.json()
      const location: TaxiLocation = {
        lat: data.lat,
        lon: data.lon,
        address: data.address,
        updatedAt: data.updatedAt,
        isRealTime: true,
      }

      setTaxiLocation(location)
      setError("") // Clear previous errors
      return location
    } catch (err) {
      console.error("Error fetching taxi location:", err)
      setError("Error al obtener la ubicación del taxista")
      return null
    }
  }, [driverId])

  // Inicia el tracking en intervalos
  const startTracking = useCallback(() => {
    if (!driverId || intervalRef.current) return

    setIsTracking(true)
    getTaxiLocation() // Fetch immediately

    intervalRef.current = setInterval(() => {
      getTaxiLocation()
    }, 5000) // Actualiza cada 5 segundos
  }, [driverId, getTaxiLocation])

  // Detiene el tracking
  const stopTracking = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
      setIsTracking(false)
    }
  }, [])

  // Limpieza automática al desmontar
  useEffect(() => {
    return () => stopTracking()
  }, [stopTracking])

  return {
    taxiLocation,
    isTracking,
    error,
    startTracking,
    stopTracking,
    getTaxiLocation,
  }
}
