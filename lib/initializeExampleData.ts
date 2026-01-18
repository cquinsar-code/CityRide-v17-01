export function initializeExampleData() {
  // Initialize drivers if not already present
  const existingDrivers = localStorage.getItem("taxi_drivers")
  if (!existingDrivers || JSON.parse(existingDrivers).length === 0) {
    const exampleDrivers = [
      {
        id: "driver1",
        name: "Juan García López",
        username: "juangarcia",
        password: "password123",
        email: "juan.garcia@example.com",
        phone: "+34612345678",
        license: "LIC001234",
        municipality: "Las Palmas",
        island: "Gran Canaria",
        vehicleModel: "Toyota Prius 2023",
        vehiclePlate: "AB-123-CD",
        seats: 4,
        pmrAdapted: true,
        registeredAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: "driver2",
        name: "María Rodríguez Santos",
        username: "mariarod",
        password: "password123",
        email: "maria.rodriguez@example.com",
        phone: "+34623456789",
        license: "LIC005678",
        municipality: "Santa Cruz de Tenerife",
        island: "Tenerife",
        vehicleModel: "Mercedes C-Class",
        vehiclePlate: "CD-456-EF",
        seats: 5,
        pmrAdapted: false,
        registeredAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: "driver3",
        name: "Carlos Fernández Gómez",
        username: "carlosfernandez",
        password: "password123",
        email: "carlos.fernandez@example.com",
        phone: "+34634567890",
        license: "LIC009012",
        municipality: "Arrecife",
        island: "Lanzarote",
        vehicleModel: "Nissan Leaf 2022",
        vehiclePlate: "EF-789-GH",
        seats: 4,
        pmrAdapted: true,
        registeredAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
      },
    ]
    localStorage.setItem("taxi_drivers", JSON.stringify(exampleDrivers))
  }

  // Initialize reservations if not already present
  const existingReservations = localStorage.getItem("reservations")
  if (!existingReservations || JSON.parse(existingReservations).length === 0) {
    const exampleReservations = [
      {
        id: "res1",
        name: "Pedro Martínez",
        phone: "+34645678901",
        pickupDate: new Date().toLocaleDateString("es-ES"),
        pickupTime: "14:30",
        pickupLocation: "Calle Mayor 123, 35002, Las Palmas, Gran Canaria",
        destination: "Playa de Las Canteras",
        adults: 2,
        children: 1,
        pmr: 0,
        observations: "Viaje con maletas",
        sku: "SKU-2025-001",
        acceptedBy: null,
        acceptedAt: null,
        createdAt: new Date().toISOString(),
      },
      {
        id: "res2",
        name: "Ana López Pérez",
        phone: "+34656789012",
        pickupDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toLocaleDateString("es-ES"),
        pickupTime: "09:00",
        pickupLocation: "Aeropuerto de Tenerife Sur, 38000, Tenerife",
        destination: "Hotel Iberostar Playa Blanca",
        adults: 1,
        children: 0,
        pmr: 1,
        observations: "Necesita ayuda con silla de ruedas",
        sku: "SKU-2025-002",
        acceptedBy: "juangarcia",
        acceptedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: "res3",
        name: "Luis Gutiérrez",
        phone: "+34667890123",
        pickupDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toLocaleDateString("es-ES"),
        pickupTime: "18:45",
        pickupLocation: "Puerto de La Luz, 35007, Las Palmas, Gran Canaria",
        destination: "Terminal de Autobuses",
        adults: 3,
        children: 2,
        pmr: 0,
        observations: "Familia numerosa",
        sku: "SKU-2025-003",
        acceptedBy: null,
        acceptedAt: null,
        createdAt: new Date().toISOString(),
      },
      {
        id: "res4",
        name: "Isabel Sánchez",
        phone: "+34678901234",
        pickupDate: new Date().toLocaleDateString("es-ES"),
        pickupTime: "20:00",
        pickupLocation: "Estación de Trenes, 38004, Santa Cruz de Tenerife, Tenerife",
        destination: "Calle Castillo 45",
        adults: 1,
        children: 0,
        pmr: 0,
        observations: "",
        sku: "SKU-2025-004",
        acceptedBy: "mariarod",
        acceptedAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
        createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
      },
    ]
    localStorage.setItem("reservations", JSON.stringify(exampleReservations))
  }

  // Initialize logs if not already present
  const existingLogs = localStorage.getItem("admin_logs")
  if (!existingLogs || JSON.parse(existingLogs).length === 0) {
    const exampleLogs = [
      {
        id: "log1",
        type: "driver_register",
        username: "juangarcia",
        timestamp: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        message: "El taxista juangarcia se ha registrado el 17/12/2024 a las 10:30:45",
      },
      {
        id: "log2",
        type: "driver_login",
        username: "juangarcia",
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        message: "El taxista juangarcia ha iniciado sesión el 16/01/2025 a las 14:22:15",
      },
      {
        id: "log3",
        type: "reservation_accepted",
        username: "juangarcia",
        reservationSku: "SKU-2025-002",
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        message: "El taxista juangarcia ha aceptado la reserva SKU-2025-002 el 16/01/2025 a las 14:20:30",
      },
      {
        id: "log4",
        type: "driver_register",
        username: "mariarod",
        timestamp: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
        message: "El taxista mariarod se ha registrado el 27/12/2024 a las 11:15:22",
      },
      {
        id: "log5",
        type: "reservation_accepted",
        username: "mariarod",
        reservationSku: "SKU-2025-004",
        timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
        message: "El taxista mariarod ha aceptado la reserva SKU-2025-004 el 16/01/2025 a las 19:35:12",
      },
    ]
    localStorage.setItem("admin_logs", JSON.stringify(exampleLogs))
  }
}
