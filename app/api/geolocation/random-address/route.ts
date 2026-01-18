import { type NextRequest, NextResponse } from "next/server"

const STREETS_BY_MUNICIPALITY: Record<string, string[]> = {
  "Las Palmas": ["Calle Mayor", "Avenida Viera y Clavijo", "Calle Colón", "Plaza Santa Ana", "Calle Presidente Alvear"],
  Maspalomas: ["Avenida de Tirajana", "Calle del Mar", "Paseo Marítimo", "Avenida del Oasis", "Calle Las Retamas"],
  Agüimes: ["Calle Real", "Plaza de la Constitución", "Calle Nueva", "Calle San Agustín", "Avenida de la Paz"],
  "Santa Cruz de Tenerife": [
    "Calle Castillo",
    "Avenida Anaga",
    "Plaza de España",
    "Calle Bethencourt Alfonso",
    "Avenida Ángel Guimerá",
  ],
  "La Orotava": [
    "Calle San Francisco",
    "Calle Carrera",
    "Plaza Juan Iriarte",
    "Calle Real",
    "Avenida Obispo Rey Redondo",
  ],
  "Puerto del Rosario": [
    "Calle Primero de Mayo",
    "Avenida Primera",
    "Plaza Central",
    "Calle Segunda",
    "Avenida Tercera",
  ],
  Arrecife: ["Calle Real", "Avenida Marítima", "Plaza de Las Palmas", "Calle León y Castillo", "Avenida Femes"],
}

const POSTAL_CODES: Record<string, string> = {
  "Las Palmas": "35001",
  Maspalomas: "35100",
  Agüimes: "35260",
  "Santa Cruz de Tenerife": "38001",
  "La Orotava": "38300",
  "Puerto del Rosario": "35600",
  Arrecife: "35500",
}

export async function GET(request: NextRequest) {
  const municipality = request.nextUrl.searchParams.get("municipality")

  if (!municipality || !STREETS_BY_MUNICIPALITY[municipality]) {
    return NextResponse.json({ error: "Invalid municipality" }, { status: 400 })
  }

  const streets = STREETS_BY_MUNICIPALITY[municipality] || []
  const postalCode = POSTAL_CODES[municipality] || "00000"
  const randomStreet = streets[Math.floor(Math.random() * streets.length)]
  const randomNumber = Math.floor(Math.random() * 200) + 1

  const address = `${randomStreet} ${randomNumber}, ${postalCode} ${municipality}`

  return NextResponse.json({ address })
}
