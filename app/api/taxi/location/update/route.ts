import { createServerClientComponent } from "@/lib/supabase"
import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { driverId, lat, lon, address } = await request.json()

    if (!driverId || lat === undefined || lon === undefined) {
      return NextResponse.json(
        { error: "Driver ID and coordinates required" },
        { status: 400 }
      )
    }

    const supabase = await createServerClientComponent()

    const { error } = await supabase.from("taxi_locations").upsert(
      {
        driver_id: driverId,
        latitude: lat,
        longitude: lon,
        address: address || "Ubicación",
        updated_at: new Date().toISOString(),
      },
      { onConflict: "driver_id" }
    )

    if (error) {
      throw error
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Location update error:", error)
    return NextResponse.json({ error: "Failed to update location" }, { status: 500 })
  }
}
