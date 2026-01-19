// \lib\utils.ts

import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

/**
 * Combina clases condicionales con clsx y mergea con tailwind-merge.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(...inputs))
}
