// \lib\geoapify.ts
// Este archivo proporciona wrappers para llamadas a rutas API
// Todas las llamadas reales a Geoapify se manejan en el servidor (API routes)

export interface ReverseGeocodeResult {
  address: string
  formatted: string
}

export interface DirectionsResult {
  distance: number // en metros
  time: number // en segundos
  waypoints: Array<{ lat: number; lon: number }>
}

/**
 * Obtiene la dirección formateada a partir de coordenadas lat/lon
 * @param lat Latitud
 * @param lon Longitud
 * @returns Objeto con address y formatted
 */
export async function reverseGeocode(lat: number, lon: number): Promise<ReverseGeocodeResult> {
  try {
    const response = await fetch("/api/geolocation/reverse-geocode", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ lat, lon }),
    })

    if (!response.ok) throw new Error("Failed to reverse geocode")
    return (await response.json()) as ReverseGeocodeResult
  } catch (error) {
    console.error("Error en reverseGeocode:", error)
    return { address: "Error al obtener ubicación", formatted: "Error al obtener ubicación" }
  }
}

/**
 * Obtiene la ruta y distancia entre dos puntos
 * @param startLat Latitud de inicio
 * @param startLon Longitud de inicio
 * @param endLat Latitud de destino
 * @param endLon Longitud de destino
 * @returns Objeto con distance, time y waypoints
 */
export async function getDirections(
  startLat: number,
  startLon: number,
  endLat: number,
  endLon: number,
): Promise<DirectionsResult> {
  try {
    const response = await fetch("/api/directions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ startLat, startLon, endLat, endLon }),
    })

    if (!response.ok) throw new Error("Failed to get directions")
    return (await response.json()) as DirectionsResult
  } catch (error) {
    console.error("Error en getDirections:", error)
    return { distance: 0, time: 0, waypoints: [] }
  }
}

/**
 * Genera waypoints intermedios a partir de un array de waypoints
 * útil para simulaciones o animaciones de ruta
 * @param waypoints Array de coordenadas {lat, lon}
 * @param count Cantidad de waypoints intermedios a generar
 * @returns Array de waypoints intermedios
 */
export function generateIntermediateWaypoints(
  waypoints: Array<{ lat: number; lon: number }>,
  count = 10,
): Array<{ lat: number; lon: number }> {
  if (waypoints.length < 2 || count <= 0) return []

  const intermediate: Array<{ lat: number; lon: number }> = []
  const step = Math.floor((waypoints.length - 1) / (count + 1))

  for (let i = 0; i < count; i++) {
    const index = (i + 1) * step
    if (index < waypoints.length - 1) {
      intermediate.push(waypoints[index])
    }
  }

  return intermediate
}
