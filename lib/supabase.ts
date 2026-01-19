// \lib\supabase.ts

import { createBrowserClient, createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// --- Cliente para el navegador ---
export function createClient() {
  return createBrowserClient(supabaseUrl, supabaseAnonKey)
}

// --- Cliente para componentes server-side ---
export async function createServerSupabaseClient() {
  const cookieStore = cookies()

  return createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll()
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          )
        } catch (error) {
          console.error("Error setting Supabase cookies:", error)
        }
      },
    },
  })
}
