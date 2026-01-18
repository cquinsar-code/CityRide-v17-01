"use client"
import { useState } from "react"
import AdminLogin from "@/components/pages/AdminLogin"
import AdminDashboard from "@/components/pages/AdminDashboard"

interface AdminSession {
  username: string
}

export default function AdminPage() {
  const [admin, setAdmin] = useState<AdminSession | null>(null)

  if (admin) {
    return <AdminDashboard admin={admin} onLogout={() => setAdmin(null)} />
  }

  return <AdminLogin onLogin={setAdmin} />
}
