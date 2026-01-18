"use client"

import { useState, useEffect, useCallback } from "react"

interface TaxiLocation {
  lat: number
  lon: number
  address: string
  updatedAt: string
  isRealTime: boolean
}

export function useTaxiTracking(driverId: string | null) {
  const [taxiLocation, setTaxiLocation] = useState<TaxiLocation | null>(null)
  const [isTracking, setIsTracking] = useState(false)
  const [error, setError] = useState<string>("")

  const getTaxiLocation = useCallback(async () => {
    if (!driverId) return null

    try {
      const response = await fetch("/api/taxi/location/get", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ driverId }),
      })

      if (!response.ok) {
        // Taxista no tiene ubicación compartida
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
      return location
    } catch (err) {
      setError("El taxista no tiene activada la ubicación en tiempo real")
      return null
    }
  }, [driverId])

  const startTracking = useCallback(() => {
    if (!driverId) return

    setIsTracking(true)
    const interval = setInterval(() => {
      getTaxiLocation()
    }, 5000) // Update every 5 seconds

    return () => {
      clearInterval(interval)
      setIsTracking(false)
    }
  }, [driverId, getTaxiLocation])

  useEffect(() => {
    if (isTracking && driverId) {
      getTaxiLocation()
      const cleanup = startTracking()
      return cleanup
    }
  }, [isTracking, driverId])

  return {
    taxiLocation,
    isTracking,
    error,
    startTracking,
    getTaxiLocation,
  }
}
