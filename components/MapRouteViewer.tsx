"use client"
import dynamic from "next/dynamic"

interface MapRouteViewerProps {
  pickupLocation: string
  driverLocation: { lat: number; lon: number }
  clientLocation: { lat: number; lon: number }
}

// Dynamic import for Leaflet to avoid SSR issues
const MapRouteViewer = dynamic(() => import("./MapRouteViewerClient"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-72 bg-gray-100 rounded-lg flex items-center justify-center">Cargando mapa...</div>
  ),
})

export default MapRouteViewer
