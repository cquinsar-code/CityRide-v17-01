import { type NextRequest, NextResponse } from "next/server"

interface ReverseGeocodeResult {
  address: string
  formatted: string
}

export async function POST(
  request: NextRequest
): Promise<NextResponse<ReverseGeocodeResult | { error: string }>> {
  try {
    const { lat, lon } = await request.json()

    if (!lat || !lon) {
      return NextResponse.json(
        { error: "Latitude and longitude required" },
        { status: 400 }
      )
    }

    const apiKey =
      process.env.GEOAPIFY_API_KEY || "54fbe366feed4818ae535114ba7dc592"

    const response = await fetch(
      `https://api.geoapify.com/v1/geocode/reverse?lat=${lat}&lon=${lon}&apiKey=${apiKey}`
    )
    const data = await response.json()

    if (data.features && data.features.length > 0) {
      const props = data.features[0].properties
      const street = props.street || ""
      const postcode = props.postcode || ""
      const city = props.city || ""
      const county = props.county || ""
      const address = [street, postcode, city, county].filter(Boolean).join(", ")

      return NextResponse.json({
        address: address || "Ubicación desconocida",
        formatted: address || "Ubicación desconocida",
      })
    }

    return NextResponse.json({
      address: "Ubicación desconocida",
      formatted: "Ubicación desconocida",
    })
  } catch (error) {
    console.error("Reverse geocoding error:", error)
    return NextResponse.json({ error: "Failed to reverse geocode" }, { status: 500 })
  }
}
