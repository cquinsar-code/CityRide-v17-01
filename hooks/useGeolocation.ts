"use client"

import { useState, useCallback } from "react"

export interface GeolocationCoordinates {
  lat: number
  lon: number
  address?: string
}

interface UseGeolocationReturn {
  coordinates: GeolocationCoordinates | null
  address: string
  error: string
  isLoading: boolean
  getCurrentLocation: () => Promise<GeolocationCoordinates>
  watchLocation: (
    onLocationChange: (loc: GeolocationCoordinates) => void,
    interval?: number
  ) => () => void
  reverseGeocode: (lat: number, lon: number) => Promise<string>
}

export function useGeolocation(): UseGeolocationReturn {
  const [coordinates, setCoordinates] = useState<GeolocationCoordinates | null>(null)
  const [address, setAddress] = useState<string>("")
  const [error, setError] = useState<string>("")
  const [isLoading, setIsLoading] = useState(false)

  // Reverse geocoding API
  const reverseGeocode = useCallback(async (lat: number, lon: number): Promise<string> => {
    try {
      const response = await fetch("/api/geolocation/reverse-geocode", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lat, lon }),
      })

      if (!response.ok) throw new Error("Failed to reverse geocode")

      const data = await response.json()
      return data.address || "Ubicación desconocida"
    } catch (err) {
      console.error("Reverse geocoding error:", err)
      return "Ubicación desconocida"
    }
  }, [])

  // Obtener ubicación actual
  const getCurrentLocation = useCallback(async (): Promise<GeolocationCoordinates> => {
    setIsLoading(true)
    setError("")

    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        if (!navigator.geolocation) {
          reject(new Error("Geolocalización no soportada"))
        } else {
          navigator.geolocation.getCurrentPosition(resolve, reject, {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 0,
          })
        }
      })

      const { latitude, longitude } = position.coords
      const addr = await reverseGeocode(latitude, longitude)
      const loc: GeolocationCoordinates = { lat: latitude, lon: longitude, address: addr }

      setCoordinates(loc)
      setAddress(addr)
      return loc
    } catch (err: any) {
      const errorMsg =
        err?.code === 1 || err?.message === "User denied Geolocation"
          ? "Debes permitir el acceso a tu ubicación"
          : "No se pudo obtener tu ubicación"
      setError(errorMsg)
      throw new Error(errorMsg)
    } finally {
      setIsLoading(false)
    }
  }, [reverseGeocode])

  // Rastrear ubicación en tiempo real
  const watchLocation = useCallback(
    (
      onLocationChange: (loc: GeolocationCoordinates) => void,
      interval: number = 5000
    ): (() => void) => {
      if (!navigator.geolocation) {
        setError("Geolocalización no soportada")
        return () => {}
      }

      const watchId = navigator.geolocation.watchPosition(
        async (position) => {
          try {
            const { latitude, longitude } = position.coords
            const addr = await reverseGeocode(latitude, longitude)
            const loc: GeolocationCoordinates = { lat: latitude, lon: longitude, address: addr }
            setCoordinates(loc)
            setAddress(addr)
            onLocationChange(loc)
          } catch {
            setError("Error al obtener dirección")
          }
        },
        (err) => {
          if (err.code === 1) setError("Ubicación desactivada")
          else setError("Error al obtener ubicación")
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      )

      // Función para limpiar el watch
      return () => navigator.geolocation.clearWatch(watchId)
    },
    [reverseGeocode]
  )

  return {
    coordinates,
    address,
    error,
    isLoading,
    getCurrentLocation,
    watchLocation,
    reverseGeocode,
  }
}
