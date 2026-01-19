// \lib\randomDataGenerator.ts

interface CountryCode {
  code: string
  country: string
  prefix: string
}

interface RandomPassengers {
  adults: number
  children: number
  pmr: number
}

interface RandomReservation {
  sku: string
  clientName: string
  clientPhone: string
  pickupDate: string
  pickupTime: string
  pickupLocation: string
  destination: string
  adults: number
  children: number
  pmr: number
  specialObservations: string
  status: string
  isFake: boolean
  createdAt: string
}

interface RandomTaxiDriver {
  name: string
  phone: string
  email: string
  licenseNumber: string
  island: string
  municipality: string
  vehiclePlate: string
  vehicleModel: string
  availableSeats: number
  pmrAdapted: boolean
  username: string
  password: string
  isFake: boolean
  createdAt: string
}

const COUNTRY_CODES: CountryCode[] = [
  { code: "+34", country: "España", prefix: "6" },
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

const FIRST_NAMES = ["Juan","María","Carlos","Ana","Pedro","Rosa","Luis","Carmen","José","Isabel","Manuel","Francisca"]
const LAST_NAMES = ["García","López","González","Martínez","Rodríguez","Pérez","Sánchez","Díaz","Fernández","Moreno"]
const CAR_MODELS = ["Ford Fiesta","Seat Ibiza","Volkswagen Golf","Renault Clio","Peugeot 206","Fiat Panda","Toyota Corolla","Honda Civic"]

// --- Generadores básicos ---
export function generateRandomPhone(): string {
  const countryData = COUNTRY_CODES[Math.floor(Math.random() * COUNTRY_CODES.length)]
  let number = ""

  if (countryData.code === "+34") {
    // Spanish number: +34 + 9 dígitos
    number = countryData.code + countryData.prefix + Math.floor(Math.random() * 1_000_000_000).toString().padStart(8, "0")
  } else {
    // Otros países: 9 dígitos
    number = countryData.code + Math.floor(Math.random() * 1_000_000_000).toString().padStart(9, "0")
  }

  return number
}

export function generateRandomName(): string {
  const firstName = FIRST_NAMES[Math.floor(Math.random() * FIRST_NAMES.length)]
  const lastName = LAST_NAMES[Math.floor(Math.random() * LAST_NAMES.length)]
  return `${firstName} ${lastName}`
}

export function generateRandomEmail(): string {
  const name = generateRandomName().toLowerCase().replace(/\s+/g, ".")
  const domains = ["gmail.com", "yahoo.com", "hotmail.com", "outlook.com"]
  const domain = domains[Math.floor(Math.random() * domains.length)]
  return `${name}@${domain}`
}

export function generateRandomLicenseNumber(): string {
  return Math.random().toString(36).substring(2, 10).toUpperCase()
}

export function generateRandomVehiclePlate(): string {
  const letters = Math.random().toString(36).substring(2, 5).toUpperCase()
  const numbers = Math.floor(Math.random() * 10000).toString().padStart(4, "0")
  return `${letters}-${numbers}`
}

export function generateRandomSKU(): string {
  return Math.floor(Math.random() * 10_000_000).toString().padStart(7, "0")
}

export function generateRandomDate(daysOffset = 0): { date: string; time: string } {
  const date = new Date()
  date.setDate(date.getDate() + Math.floor((Math.random() - 0.5) * 30) + daysOffset)

  const hours = Math.floor(Math.random() * 24).toString().padStart(2, "0")
  const minutes = Math.floor(Math.random() * 60).toString().padStart(2, "0")

  return { date: date.toISOString().split("T")[0], time: `${hours}:${minutes}` }
}

export function generateRandomPassengers(): RandomPassengers {
  return {
    adults: Math.floor(Math.random() * 3) + 1,
    children: Math.floor(Math.random() * 3),
    pmr: Math.random() > 0.7 ? 1 : 0,
  }
}

// --- Generadores de entidades ---
export async function generateRandomReservation(municipality: string, island: string): Promise<RandomReservation> {
  const { date, time } = generateRandomDate()
  const passengers = generateRandomPassengers()

  try {
    const addressResponse = await fetch(`/api/geolocation/random-address?municipality=${municipality}`)
    const addressData = await addressResponse.json()

    return {
      sku: generateRandomSKU(),
      clientName: generateRandomName(),
      clientPhone: generateRandomPhone(),
      pickupDate: date,
      pickupTime: time,
      pickupLocation: addressData.address || municipality,
      destination: "Destino " + Math.random().toString(36).substring(7),
      adults: passengers.adults,
      children: passengers.children,
      pmr: passengers.pmr,
      specialObservations: "",
      status: "pending",
      isFake: true,
      createdAt: new Date().toISOString(),
    }
  } catch (error) {
    console.error("Error generating random reservation:", error)
    throw error
  }
}

export function generateRandomTaxiDriver(): RandomTaxiDriver {
  const name = generateRandomName()
  const username = name.toLowerCase().replace(/\s+/g, "_")
  const password = username // Contraseña igual al username

  return {
    name,
    phone: generateRandomPhone(),
    email: generateRandomEmail(),
    licenseNumber: generateRandomLicenseNumber(),
    island: ["Gran Canaria","Tenerife","Fuerteventura","Lanzarote"][Math.floor(Math.random() * 4)],
    municipality: "Municipio " + Math.random().toString(36).substring(7),
    vehiclePlate: generateRandomVehiclePlate(),
    vehicleModel: CAR_MODELS[Math.floor(Math.random() * CAR_MODELS.length)],
    availableSeats: Math.floor(Math.random() * 4) + 1,
    pmrAdapted: Math.random() > 0.5,
    username,
    password,
    isFake: true,
    createdAt: new Date().toISOString(),
  }
}

export function generateRandomActivityLog() {
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
    logType,
    taxiDriverId: Math.floor(Math.random() * 100) + 1,
    reservationId: Math.floor(Math.random() * 1000) + 1,
    details: "Log generado automáticamente",
    isFake: true,
    createdAt: new Date().toISOString(),
  }
}
