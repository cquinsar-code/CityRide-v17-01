"use client"

import { useEffect, useRef } from "react"
import L from "leaflet"
import "leaflet/dist/leaflet.css"

interface MapRouteViewerClientProps {
  pickupLocation: string
  driverLocation: { lat: number; lon: number }
  clientLocation: { lat: number; lon: number }
}

export default function MapRouteViewerClient({ driverLocation, clientLocation }: MapRouteViewerClientProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstance = useRef<L.Map | null>(null)

  useEffect(() => {
    if (!mapRef.current) return

    // Create map
    if (!mapInstance.current) {
      mapInstance.current = L.map(mapRef.current).setView(
        [(driverLocation.lat + clientLocation.lat) / 2, (driverLocation.lon + clientLocation.lon) / 2],
        13,
      )

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "© OpenStreetMap contributors",
        maxZoom: 19,
      }).addTo(mapInstance.current)
    }

    // Clear previous markers
    mapInstance.current.eachLayer((layer) => {
      if (layer instanceof L.Marker || layer instanceof L.Polyline) {
        mapInstance.current?.removeLayer(layer)
      }
    })

    // Add driver marker (green)
    L.marker([driverLocation.lat, driverLocation.lon], {
      icon: L.icon({
        iconUrl:
          "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0Ij48cGF0aCBmaWxsPSIjMTZhMzRhIiBkPSJNMTIgMkM2LjQ4IDIgMiA2LjQ4IDIgMTJzNC40OCAxMCAxMCAxMCAxMC00LjQ4IDEwLTEwUzE3LjUyIDIgMTIgMnptMCA4YzEuMDYgMCAyLS45NCAyLTJzLS45NC0yLTItMi0yIC45NC0yIDIgLjk0IDIgMiAyem0wIDZjLTIuMzMgMC00LjMxLTEuNDYtNS4xMS0zLjVIMTdjLS44IDIuMDQtMi43OCAzLjUtNS4xMSAzLjV6Ii8+PC9zdmc+",
        iconSize: [32, 32],
        iconAnchor: [16, 32],
      }),
    })
      .bindPopup("Ubicación del Taxista")
      .addTo(mapInstance.current)

    // Add client marker (blue)
    L.marker([clientLocation.lat, clientLocation.lon], {
      icon: L.icon({
        iconUrl:
          "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0Ij48cGF0aCBmaWxsPSIjMDAxZjNmIiBkPSJNMTIgMkM2LjQ4IDIgMiA2LjQ4IDIgMTJzNC40OCAxMCAxMCAxMCAxMC00LjQ4IDEwLTEwUzE3LjUyIDIgMTIgMnptMCA4YzEuMDYgMCAyLS45NCAyLTJzLS45NC0yLTItMi0yIC45NC0yIDIgLjk0IDIgMiAyem0wIDZjLTIuMzMgMC00LjMxLTEuNDYtNS4xMS0zLjVIMTdjLS44IDIuMDQtMi43OCAzLjUtNS4xMSAzLjV6Ii8+PC9zdmc+",
        iconSize: [32, 32],
        iconAnchor: [16, 32],
      }),
    })
      .bindPopup("Ubicación del Cliente")
      .addTo(mapInstance.current)

    // Draw line between markers
    const line = L.polyline(
      [
        [driverLocation.lat, driverLocation.lon],
        [clientLocation.lat, clientLocation.lon],
      ],
      {
        color: "#f97316",
        weight: 3,
        opacity: 0.8,
        dashArray: "5, 5",
      },
    )
    line.addTo(mapInstance.current)

    // Fit bounds
    const bounds = L.latLngBounds([
      [driverLocation.lat, driverLocation.lon],
      [clientLocation.lat, clientLocation.lon],
    ])
    mapInstance.current.fitBounds(bounds, { padding: [50, 50] })

    return () => {
      // Cleanup on unmount - don't remove map, just clear it
    }
  }, [driverLocation, clientLocation])

  return <div ref={mapRef} className="w-full h-80 rounded-lg border border-orange-200 shadow-md" />
}
