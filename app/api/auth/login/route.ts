import { createServerClientComponent } from "@/lib/supabase"
import { verifyPassword } from "@/lib/auth"
import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    const supabase = await createServerClientComponent()

    // Get user from database
    const { data: users, error: queryError } = await supabase
      .from("taxi_drivers")
      .select("*")
      .eq("email", email)
      .single()

    if (queryError || !users) {
      return NextResponse.json({ error: "Usuario o contraseña incorrectos" }, { status: 401 })
    }

    // Verify password
    const isValidPassword = await verifyPassword(password, users.password_hash)

    if (!isValidPassword) {
      return NextResponse.json({ error: "Usuario o contraseña incorrectos" }, { status: 401 })
    }

    return NextResponse.json({
      id: users.id,
      name: users.name,
      email: users.email,
      username: users.username,
      phone: users.phone,
      license: users.license,
      municipality: users.municipality,
      island: users.island,
      vehicleModel: users.vehicle_model,
      vehiclePlate: users.vehicle_plate,
      seats: users.seats,
      pmrAdapted: users.pmr_adapted,
      locationTrackingEnabled: users.location_tracking_enabled,
    })
  } catch (error) {
    console.error("Login error:", error)
    return NextResponse.json({ error: "Error al iniciar sesión" }, { status: 500 })
  }
}
