const COUNTRY_CODES = [
  { code: "+34", country: "España", prefix: "346" },
  { code: "+44", country: "Gran Bretaña", prefix: "" },
  { code: "+49", country: "Alemania", prefix: "" },
  { code: "+33", country: "Francia", prefix: "" },
  { code: "+39", country: "Italia", prefix: "" },
  { code: "+41", country: "Suiza", prefix: "" },
  { code: "+43", country: "Austria", prefix: "" },
  { code: "+46", country: "Suecia", prefix: "" },
  { code: "+47", country: "Noruega", prefix: "" },
  { code: "+1", country: "EEUU", prefix: "" },
  { code: "+61", country: "Australia", prefix: "" },
]

const FIRST_NAMES = [
  "Juan",
  "María",
  "Carlos",
  "Ana",
  "Pedro",
  "Rosa",
  "Luis",
  "Carmen",
  "José",
  "Isabel",
  "Manuel",
  "Francisca",
]
const LAST_NAMES = [
  "García",
  "López",
  "González",
  "Martínez",
  "Rodríguez",
  "Pérez",
  "Sánchez",
  "Díaz",
  "Fernández",
  "Moreno",
]
const CAR_MODELS = [
  "Ford Fiesta",
  "Seat Ibiza",
  "Volkswagen Golf",
  "Renault Clio",
  "Peugeot 206",
  "Fiat Panda",
  "Toyota Corolla",
  "Honda Civic",
]

export function generateRandomPhone(): string {
  const countryData = COUNTRY_CODES[Math.floor(Math.random() * COUNTRY_CODES.length)]
  let number = ""

  if (countryData.prefix === "346") {
    // Spanish number starting with +346
    number =
      countryData.code +
      countryData.prefix +
      Math.floor(Math.random() * 1000000000)
        .toString()
        .padStart(7, "0")
  } else {
    // Other countries: random 9 digits
    number =
      countryData.code +
      Math.floor(Math.random() * 1000000000)
        .toString()
        .padStart(9, "0")
  }

  return number
}

export function generateRandomName(): string {
  const firstName = FIRST_NAMES[Math.floor(Math.random() * FIRST_NAMES.length)]
  const lastName = LAST_NAMES[Math.floor(Math.random() * LAST_NAMES.length)]
  return `${firstName} ${lastName}`
}

export function generateRandomEmail(): string {
  const name = generateRandomName().toLowerCase().replace(" ", ".")
  const domains = ["gmail.com", "yahoo.com", "hotmail.com", "outlook.com"]
  const domain = domains[Math.floor(Math.random() * domains.length)]
  return `${name}@${domain}`
}

export function generateRandomLicenseNumber(): string {
  return Math.random().toString(36).substring(2, 10).toUpperCase()
}

export function generateRandomVehiclePlate(): string {
  const letters = Math.random().toString(36).substring(2, 5).toUpperCase()
  const numbers = Math.floor(Math.random() * 10000)
    .toString()
    .padStart(4, "0")
  return `${letters}-${numbers}`
}

export function generateRandomSKU(): string {
  return Math.floor(Math.random() * 10000000)
    .toString()
    .padStart(7, "0")
}

export function generateRandomDate(daysOffset = 0): { date: string; time: string } {
  const date = new Date()
  date.setDate(date.getDate() + Math.floor((Math.random() - 0.5) * 30) + daysOffset)

  const hours = Math.floor(Math.random() * 24)
    .toString()
    .padStart(2, "0")
  const minutes = Math.floor(Math.random() * 60)
    .toString()
    .padStart(2, "0")

  return {
    date: date.toISOString().split("T")[0],
    time: `${hours}:${minutes}`,
  }
}

export function generateRandomPassengers(): { adults: number; children: number; pmr: number } {
  return {
    adults: Math.floor(Math.random() * 3) + 1,
    children: Math.floor(Math.random() * 3),
    pmr: Math.random() > 0.7 ? 1 : 0,
  }
}

export const VEHICLE_MODELS = CAR_MODELS

export async function generateRandomReservation(municipality: string, island: string): Promise<any> {
  const { date, time } = generateRandomDate()
  const passengers = generateRandomPassengers()

  try {
    const addressResponse = await fetch(`/api/geolocation/random-address?municipality=${municipality}`)
    const addressData = await addressResponse.json()

    return {
      sku: generateRandomSKU(),
      client_name: generateRandomName(),
      client_phone: generateRandomPhone(),
      pickup_date: date,
      pickup_time: time,
      pickup_location: addressData.address || municipality,
      destination: "Destino " + Math.random().toString(36).substring(7),
      adults: passengers.adults,
      children: passengers.children,
      pmr: passengers.pmr,
      special_observations: "",
      status: "pending",
      is_fake: true, // Marcar como ficticio
      created_at: new Date().toISOString(),
    }
  } catch (error) {
    console.error("Error generating random reservation:", error)
    throw error
  }
}

export function generateRandomTaxiDriver(): any {
  const name = generateRandomName()
  const username = name.toLowerCase().replace(" ", "_")
  const password = username // La contraseña es igual al usuario en minúsculas

  return {
    name,
    phone: generateRandomPhone(),
    email: generateRandomEmail(),
    license_number: generateRandomLicenseNumber(),
    island: ["Gran Canaria", "Tenerife", "Fuerteventura", "Lanzarote"][Math.floor(Math.random() * 4)],
    municipality: "Municipio " + Math.random().toString(36).substring(7),
    vehicle_plate: generateRandomVehiclePlate(),
    vehicle_model: CAR_MODELS[Math.floor(Math.random() * CAR_MODELS.length)],
    available_seats: Math.floor(Math.random() * 4) + 1,
    pmr_adapted: Math.random() > 0.5,
    username,
    password,
    is_fake: true, // Marcar como ficticio
    created_at: new Date().toISOString(),
  }
}

export function generateRandomActivityLog(): any {
  const logTypes = [
    "taxi_login",
    "taxi_logout",
    "taxi_registration",
    "reservation_accepted",
    "reservation_rejected",
    "reservation_completed",
  ]
  const logType = logTypes[Math.floor(Math.random() * logTypes.length)]

  return {
    log_type: logType,
    taxi_driver_id: Math.floor(Math.random() * 100) + 1,
    reservation_id: Math.floor(Math.random() * 1000) + 1,
    details: "Log generado automáticamente",
    is_fake: true, // Marcar como ficticio
    created_at: new Date().toISOString(),
  }
}
