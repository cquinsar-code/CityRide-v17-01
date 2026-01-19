import { createServerClientComponent } from "@/lib/supabase"
import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { driverId } = await request.json()

    if (!driverId) {
      return NextResponse.json({ error: "Driver ID required" }, { status: 400 })
    }

    const supabase = await createServerClientComponent()

    const { data, error } = await supabase
      .from("taxi_locations")
      .select("*")
      .eq("driver_id", driverId)
      .single()

    if (error || !data) {
      return NextResponse.json({ error: "Location not found" }, { status: 404 })
    }

    return NextResponse.json({
      lat: data.latitude,
      lon: data.longitude,
      address: data.address,
      updatedAt: data.updated_at,
    })
  } catch (error) {
    console.error("Get location error:", error)
    return NextResponse.json({ error: "Failed to get location" }, { status: 500 })
  }
}
