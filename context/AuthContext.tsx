"use client"

import { createContext, useContext, useState, useEffect, ReactNode } from "react"

export interface AuthUser {
  id: string
  name: string
  email: string
  username: string
  phone: string
  license?: string
  municipality?: string
  island?: string
  vehicleModel?: string
  vehiclePlate?: string
  seats?: number
  pmrAdapted?: boolean
  locationTrackingEnabled?: boolean
}

interface AuthContextType {
  user: AuthUser | null
  loading: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => void
  isAuthenticated: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

interface AuthProviderProps {
  children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [loading, setLoading] = useState(true)

  // Carga inicial del usuario desde localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedUser = localStorage.getItem("cityride_user")
      if (storedUser) {
        try {
          setUser(JSON.parse(storedUser))
        } catch (err) {
          console.error("Error parsing stored user:", err)
          localStorage.removeItem("cityride_user")
        }
      }
      setLoading(false)
    }
  }, [])

  const login = async (email: string, password: string) => {
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Login failed")
      }

      const userData: AuthUser = await response.json()
      setUser(userData)
      localStorage.setItem("cityride_user", JSON.stringify(userData))
    } catch (err) {
      console.error("Login error:", err)
      throw err
    }
  }

  const logout = () => {
    setUser(null)
    if (typeof window !== "undefined") {
      localStorage.removeItem("cityride_user")
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        logout,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

// Hook personalizado para consumir el contexto
export function useAuth(): AuthContextType {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
