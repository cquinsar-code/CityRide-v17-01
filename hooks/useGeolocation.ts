"use client"

import { useState, useCallback } from "react"

interface GeolocationCoordinates {
  lat: number
  lon: number
  address?: string
}

export function useGeolocation() {
  const [coordinates, setCoordinates] = useState<GeolocationCoordinates | null>(null)
  const [address, setAddress] = useState<string>("")
  const [error, setError] = useState<string>("")
  const [isLoading, setIsLoading] = useState(false)

  const reverseGeocode = useCallback(async (lat: number, lon: number) => {
    try {
      const response = await fetch("/api/geolocation/reverse-geocode", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lat, lon }),
      })

      if (!response.ok) throw new Error("Failed to reverse geocode")
      const data = await response.json()
      return data.address
    } catch (err) {
      console.error("Reverse geocoding error:", err)
      return "Ubicación desconocida"
    }
  }, [])

  const getCurrentLocation = useCallback(async () => {
    setIsLoading(true)
    setError("")

    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0,
        })
      })

      const { latitude, longitude } = position.coords
      const addr = await reverseGeocode(latitude, longitude)

      setCoordinates({ lat: latitude, lon: longitude, address: addr })
      setAddress(addr)

      return { lat: latitude, lon: longitude, address: addr }
    } catch (err: any) {
      const errorMsg =
        err.message === "User denied geolocation"
          ? "Debes permitir el acceso a tu ubicación"
          : "No se pudo obtener tu ubicación"
      setError(errorMsg)
      throw new Error(errorMsg)
    } finally {
      setIsLoading(false)
    }
  }, [reverseGeocode])

  const watchLocation = useCallback(
    (onLocationChange: (loc: GeolocationCoordinates) => void, interval = 5000) => {
      const watchId = navigator.geolocation.watchPosition(
        async (position) => {
          const { latitude, longitude } = position.coords
          const addr = await reverseGeocode(latitude, longitude)
          const newLoc = { lat: latitude, lon: longitude, address: addr }
          setCoordinates(newLoc)
          setAddress(addr)
          onLocationChange(newLoc)
        },
        (err) => {
          if (err.code === 1) {
            setError("Ubicación desactivada")
          } else {
            setError("Error al obtener ubicación")
          }
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0,
        },
      )

      return () => navigator.geolocation.clearWatch(watchId)
    },
    [reverseGeocode],
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
