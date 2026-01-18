import { type NextRequest, NextResponse } from "next/server"

interface DirectionsResult {
  distance: number
  time: number
  waypoints: Array<{ lat: number; lon: number }>
  intermediateWaypoints: Array<{ lat: number; lon: number }>
}

export async function POST(request: NextRequest): Promise<NextResponse<DirectionsResult | { error: string }>> {
  try {
    const { startLat, startLon, endLat, endLon } = await request.json()

    if (!startLat || !startLon || !endLat || !endLon) {
      return NextResponse.json({ error: "All coordinates required" }, { status: 400 })
    }

    const apiKey = process.env.GEOAPIFY_API_KEY || "54fbe366feed4818ae535114ba7dc592"

    const response = await fetch(
      `https://api.routeoptimizer.geoapify.com/v1/routing?apiKey=${apiKey}&mode=drive&waypoints=${startLat},${startLon}|${endLat},${endLon}`,
    )
    const data = await response.json()

    if (data.routes && data.routes.length > 0) {
      const route = data.routes[0]
      const distance = Math.round(((route.distance || 0) / 1000) * 10) / 10
      const time = Math.round((route.time || 0) / 60)

      const waypoints: Array<{ lat: number; lon: number }> = []
      if (route.geometry && route.geometry.coordinates) {
        route.geometry.coordinates.forEach((coord: [number, number]) => {
          waypoints.push({ lat: coord[1], lon: coord[0] })
        })
      }

      const intermediate: Array<{ lat: number; lon: number }> = []
      const step = Math.floor(waypoints.length / 16)
      for (let i = 0; i < 15; i++) {
        const index = (i + 1) * step
        if (index < waypoints.length) {
          intermediate.push(waypoints[index])
        }
      }

      return NextResponse.json({ distance, time, waypoints, intermediateWaypoints: intermediate })
    }

    return NextResponse.json({ distance: 0, time: 0, waypoints: [], intermediateWaypoints: [] })
  } catch (error) {
    console.error("Directions API error:", error)
    return NextResponse.json({ error: "Failed to get directions" }, { status: 500 })
  }
}
