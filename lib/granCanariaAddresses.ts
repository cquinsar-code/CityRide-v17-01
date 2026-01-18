export const granCanariaAddresses = {
  "Las Palmas de Gran Canaria": [
    { street: "Avenida Marítima", number: "1", postalCode: "35007", municipality: "Las Palmas de Gran Canaria" },
    { street: "Calle Vegueta", number: "15", postalCode: "35001", municipality: "Las Palmas de Gran Canaria" },
    { street: "Paseo Las Canteras", number: "42", postalCode: "35007", municipality: "Las Palmas de Gran Canaria" },
    { street: "Calle Mayor de Triana", number: "88", postalCode: "35003", municipality: "Las Palmas de Gran Canaria" },
    {
      street: "Avenida José Mesa y López",
      number: "23",
      postalCode: "35003",
      municipality: "Las Palmas de Gran Canaria",
    },
  ],
  Maspalomas: [
    { street: "Avenida de Tirajana", number: "1", postalCode: "35100", municipality: "Maspalomas" },
    { street: "Calle Retama", number: "45", postalCode: "35100", municipality: "Maspalomas" },
    { street: "Avenida de Océano", number: "67", postalCode: "35100", municipality: "Maspalomas" },
    { street: "Calle Primavera", number: "12", postalCode: "35100", municipality: "Maspalomas" },
    { street: "Avenida de las Naciones", number: "89", postalCode: "35100", municipality: "Maspalomas" },
  ],
  "Puerto de Mogán": [
    { street: "Calle Muelle", number: "5", postalCode: "35130", municipality: "Puerto de Mogán" },
    { street: "Avenida Principal", number: "22", postalCode: "35130", municipality: "Puerto de Mogán" },
    { street: "Calle Pescador", number: "8", postalCode: "35130", municipality: "Puerto de Mogán" },
    { street: "Paseo Marítimo", number: "18", postalCode: "35130", municipality: "Puerto de Mogán" },
    { street: "Calle San Agustín", number: "34", postalCode: "35130", municipality: "Puerto de Mogán" },
  ],
  Agaete: [
    { street: "Calle Mateos", number: "10", postalCode: "35460", municipality: "Agaete" },
    { street: "Avenida Marítima", number: "25", postalCode: "35460", municipality: "Agaete" },
    { street: "Calle Gáldar", number: "7", postalCode: "35460", municipality: "Agaete" },
    { street: "Plaza de la Constitución", number: "3", postalCode: "35460", municipality: "Agaete" },
    { street: "Calle Juan Perdomo", number: "19", postalCode: "35460", municipality: "Agaete" },
  ],
  Telde: [
    { street: "Avenida Marítima", number: "55", postalCode: "35200", municipality: "Telde" },
    { street: "Calle Mayor", number: "31", postalCode: "35200", municipality: "Telde" },
    { street: "Paseo de San Juan", number: "14", postalCode: "35200", municipality: "Telde" },
    { street: "Calle Real", number: "42", postalCode: "35201", municipality: "Telde" },
    { street: "Avenida Canaria", number: "66", postalCode: "35200", municipality: "Telde" },
  ],
  Gáldar: [
    { street: "Calle Mayor", number: "29", postalCode: "35460", municipality: "Gáldar" },
    { street: "Plaza Santa María de Gáldar", number: "2", postalCode: "35460", municipality: "Gáldar" },
    { street: "Calle Teror", number: "11", postalCode: "35460", municipality: "Gáldar" },
    { street: "Avenida Principal", number: "47", postalCode: "35460", municipality: "Gáldar" },
    { street: "Calle San Juan", number: "23", postalCode: "35460", municipality: "Gáldar" },
  ],
  "Santa Lucía de Tirajana": [
    { street: "Calle Centro", number: "16", postalCode: "35360", municipality: "Santa Lucía de Tirajana" },
    { street: "Avenida de la Paz", number: "38", postalCode: "35360", municipality: "Santa Lucía de Tirajana" },
    { street: "Calle San Juan", number: "9", postalCode: "35360", municipality: "Santa Lucía de Tirajana" },
    { street: "Plaza Mayor", number: "4", postalCode: "35360", municipality: "Santa Lucía de Tirajana" },
    { street: "Calle Comercio", number: "21", postalCode: "35360", municipality: "Santa Lucía de Tirajana" },
  ],
  "San Bartolomé de Tirajana": [
    { street: "Avenida Tirajana", number: "50", postalCode: "35290", municipality: "San Bartolomé de Tirajana" },
    { street: "Calle Mayor", number: "13", postalCode: "35290", municipality: "San Bartolomé de Tirajana" },
    { street: "Paseo Marítimo", number: "35", postalCode: "35290", municipality: "San Bartolomé de Tirajana" },
    { street: "Calle Real", number: "26", postalCode: "35290", municipality: "San Bartolomé de Tirajana" },
    { street: "Avenida del Mar", number: "62", postalCode: "35290", municipality: "San Bartolomé de Tirajana" },
  ],
}

export function getRandomAddress(municipality: string) {
  const addresses = granCanariaAddresses[municipality as keyof typeof granCanariaAddresses]
  if (!addresses || addresses.length === 0) {
    return `Calle Principal, 1, 35000, ${municipality}`
  }
  const randomAddress = addresses[Math.floor(Math.random() * addresses.length)]
  return `${randomAddress.street}, ${randomAddress.number}, ${randomAddress.postalCode}, ${randomAddress.municipality}`
}
