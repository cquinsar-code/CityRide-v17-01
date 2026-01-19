"use client"

import { useEffect, useRef } from "react"
import L from "leaflet"
import "leaflet/dist/leaflet.css"

export interface MapRouteViewerClientProps {
  pickupLocation: string
  driverLocation: { lat: number; lon: number }
  clientLocation: { lat: number; lon: number }
}

export default function MapRouteViewerClient({
  driverLocation,
  clientLocation,
}: MapRouteViewerClientProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstance = useRef<L.Map | null>(null)

  useEffect(() => {
    if (!mapRef.current) return

    // Inicializar mapa solo una vez
    if (!mapInstance.current) {
      const centerLat = (driverLocation.lat + clientLocation.lat) / 2
      const centerLon = (driverLocation.lon + clientLocation.lon) / 2

      mapInstance.current = L.map(mapRef.current).setView([centerLat, centerLon], 13)

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "© OpenStreetMap contributors",
        maxZoom: 19,
      }).addTo(mapInstance.current)
    }

    const map = mapInstance.current

    // Limpiar marcadores y líneas anteriores
    map.eachLayer((layer) => {
      if (layer instanceof L.Marker || layer instanceof L.Polyline) {
        map.removeLayer(layer)
      }
    })

    // Función para crear icono SVG
    const createIcon = (color: string) =>
      L.icon({
        iconUrl: `data:image/svg+xml;base64,${
          color === "green"
            ? "PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0Ij48cGF0aCBmaWxsPSIjMTZhMzRhIiBkPSJNMTIgMkM2LjQ4IDIgMiA2LjQ4IDIgMTJzNC40OCAxMCAxMCAxMCAxMC00LjQ4IDEwLTEwUzE3LjUyIDIgMTIgMnptMCA4YzEuMDYgMCAyLS45NCAyLTJzLS45NC0yLTItMi0yIC45NC0yIDIgLjk0IDIgMiAyem0wIDZjLTIuMzMgMC00LjMxLTEuNDYtNS4xMS0zLjVIMTdjLS44IDIuMDQtMi43OCAzLjUtNS4xMSAzLjV6Ii8+PC9zdmc+"
            : "PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0Ij48cGF0aCBmaWxsPSIjMDAxZjNmIiBkPSJNMTIgMkM2LjQ4IDIgMiA2LjQ4IDIgMTJzNC40OCAxMCAxMCAxMCAxMC00LjQ4IDEwLTEwUzE3LjUyIDIgMTIgMnptMCA4YzEuMDYgMCAyLS45NCAyLTJzLS45NC0yLTItMi0yIC45NC0yIDIgLjk0IDIgMiAyem0wIDZjLTIuMzMgMC00LjMxLTEuNDYtNS4xMS0zLjVIMTdjLS44IDIuMDQtMi43OCAzLjUtNS4xMSAzLjV6Ii8+PC9zdmc+"
        }`,
        iconSize: [32, 32],
        iconAnchor: [16, 32],
      })

    // Marcador del conductor (verde)
    L.marker([driverLocation.lat, driverLocation.lon], { icon: createIcon("green") })
      .bindPopup("Ubicación del Taxista")
      .addTo(map)

    // Marcador del cliente (azul)
    L.marker([clientLocation.lat, clientLocation.lon], { icon: createIcon("blue") })
      .bindPopup("Ubicación del Cliente")
      .addTo(map)

    // Línea entre conductor y cliente
    L.polyline(
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
    ).addTo(map)

    // Ajustar vista para incluir ambos puntos
    const bounds = L.latLngBounds([
      [driverLocation.lat, driverLocation.lon],
      [clientLocation.lat, clientLocation.lon],
    ])
    map.fitBounds(bounds, { padding: [50, 50] })

    // Cleanup: solo limpiamos capas, no eliminamos el mapa
    return () => {
      map.eachLayer((layer) => {
        if (layer instanceof L.Marker || layer instanceof L.Polyline) {
          map.removeLayer(layer)
        }
      })
    }
  }, [driverLocation, clientLocation])

  return <div ref={mapRef} className="w-full h-80 rounded-lg border border-orange-200 shadow-md" />
}
