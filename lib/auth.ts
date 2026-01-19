import bcrypt from "bcryptjs"

/**
 * Hashea una contraseña usando bcrypt con 12 rondas de sal.
 * @param password Contraseña en texto plano
 * @returns Hash seguro de la contraseña
 */
export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(12)
  const hashedPassword = await bcrypt.hash(password, salt)
  return hashedPassword
}

/**
 * Verifica si una contraseña coincide con un hash
 * @param password Contraseña en texto plano
 * @param hash Hash de la contraseña
 * @returns true si coincide, false si no
 */
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash)
}

/**
 * Genera un SKU único basado en timestamp y caracteres aleatorios
 * @returns SKU en mayúsculas, único y legible
 */
export function generateSKU(): string {
  // Parte basada en timestamp en base36
  const timestampPart = Date.now().toString(36).toUpperCase()
  // Parte aleatoria de 6 caracteres alfanuméricos
  const randomPart = Math.random().toString(36).substring(2, 8).toUpperCase()
  return `${timestampPart}-${randomPart}`
}
