// This file only provides fetch wrappers to API routes
// All Geoapify API calls are handled server-side in API routes

interface ReverseGeocodeResult {
  address: string
  formatted: string
}

interface DirectionsResult {
  distance: number
  time: number
  waypoints: Array<{ lat: number; lon: number }>
}

export async function reverseGeocode(lat: number, lon: number): Promise<ReverseGeocodeResult> {
  try {
    const response = await fetch("/api/geolocation/reverse-geocode", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ lat, lon }),
    })

    if (!response.ok) throw new Error("Failed to reverse geocode")
    return await response.json()
  } catch (error) {
    console.error("Error en reverse geocoding:", error)
    return { address: "Error al obtener ubicación", formatted: "Error al obtener ubicación" }
  }
}

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
    return await response.json()
  } catch (error) {
    console.error("Error en directions API:", error)
    return { distance: 0, time: 0, waypoints: [] }
  }
}

export function generateIntermediateWaypoints(
  waypoints: Array<{ lat: number; lon: number }>,
  count = 10,
): Array<{ lat: number; lon: number }> {
  if (waypoints.length < 2) return waypoints

  const intermediate: Array<{ lat: number; lon: number }> = []
  const step = Math.floor(waypoints.length / (count + 1))

  for (let i = 0; i < count; i++) {
    const index = (i + 1) * step
    if (index < waypoints.length) {
      intermediate.push(waypoints[index])
    }
  }

  return intermediate
}
