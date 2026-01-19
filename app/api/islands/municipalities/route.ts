import { type NextRequest, NextResponse } from "next/server"

const ISLANDS_COORDS = {
  "Gran Canaria": { lat: 28.0, lng: -15.6 },
  Tenerife: { lat: 28.5, lng: -16.3 },
  Fuerteventura: { lat: 28.36, lng: -14.33 },
  Lanzarote: { lat: 29.0, lng: -13.6 },
}

export async function GET(request: NextRequest) {
  const island = request.nextUrl.searchParams.get("island")

  if (!island || !ISLANDS_COORDS[island as keyof typeof ISLANDS_COORDS]) {
    return NextResponse.json({ error: "Invalid island" }, { status: 400 })
  }

  const apiKey = process.env.GEOAPIFY_API_KEY
  if (!apiKey) {
    return NextResponse.json({ error: "Missing API key" }, { status: 500 })
  }

  try {
    const municipalities: Record<string, string[]> = {
      "Gran Canaria": [
        "Las Palmas",
        "Maspalomas",
        "Agüimes",
        "Ingenio",
        "Santa Brígida",
        "Vega de San Mateo",
        "Tejeda",
        "Mogán",
        "San Nicolás",
        "Artenara",
      ],
      Tenerife: [
        "Santa Cruz de Tenerife",
        "San Cristóbal de La Laguna",
        "La Orotava",
        "Puerto de la Cruz",
        "Los Realejos",
        "La Matanza",
        "Icod de los Vinos",
        "Garachico",
        "Güímar",
        "Arafo",
      ],
      Fuerteventura: [
        "Puerto del Rosario",
        "Corralejo",
        "Pajara",
        "Morro Jable",
        "La Oliva",
        "Betancuria",
        "Tuineje",
      ],
      Lanzarote: [
        "Arrecife",
        "San Bartolomé",
        "Tinajo",
        "Haría",
        "Yaiza",
        "Femés",
        "Mozaga",
      ],
    }

    const municipalitiesList = municipalities[island] || []
    return NextResponse.json({ municipalities: municipalitiesList })
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch municipalities" },
      { status: 500 }
    )
  }
}
