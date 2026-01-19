import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"

export async function POST(req: Request) {
  try {
    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || "",
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "",
      {
        cookies: {
          getAll() {
            return cookieStore.getAll()
          },
        },
      }
    )

    const { type, data } = await req.json()

    if (type === "reservation") {
      const { error } = await supabase
        .from("reservations")
        .insert([{ ...data, is_fake: true }])
      if (error) throw error
    } else if (type === "taxi_driver") {
      const { error } = await supabase
        .from("taxi_drivers")
        .insert([{ ...data, is_fake: true }])
      if (error) throw error
    } else if (type === "activity_log") {
      const { error } = await supabase
        .from("activity_logs")
        .insert([{ ...data, is_fake: true }])
      if (error) throw error
    }

    return Response.json({ success: true })
  } catch (error) {
    console.error("Error saving fake data:", error)
    return Response.json({ error: "Failed to save fake data" }, { status: 500 })
  }
}
