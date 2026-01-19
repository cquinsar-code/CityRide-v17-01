"use client"

import React, { createContext, useContext, useState, ReactNode } from "react"

// Tipos de idiomas soportados
export type Language = "en" | "es" | "de" | "it" | "fr"

// Contexto con tipos
interface LanguageContextType {
  language: Language
  setLanguage: (lang: Language) => void
  t: (key: string, params?: Record<string, string | number>) => string
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

// Traducciones
const translations: Record<Language, Record<string, string>> = {
  en: {
    "form.name": "Name",
    "form.phone": "Phone Number",
    "form.phone_help":
      "Enter your phone number with country code (e.g. +34612345678). Only shared with assigned driver.",
    "form.pickup_date": "Pickup Date",
    "form.pickup_time": "Pickup Time",
    "form.pickup_location": "Pickup Location",
    "form.generate_auto": "Generate Automatically",
    "form.destination": "Destination",
    "form.destination_help":
      "If you do not know the exact address, indicate an approximate reference place. You can clarify it with the driver in person.",
    "form.adults": "Adults",
    "form.children": "Children",
    "form.pmr": "PMR (Reduced Mobility)",
    "form.special_observations": "Special Observations",
    "form.submit": "Send Transfer Request",
    "form.success": "Your transfer request has been registered successfully.",
    "form.phone_error":
      "Phone number not entered correctly. Please enter with country code (e.g. +34612345678)",
    "form.location_tracking": "Enable Real-Time Location Tracking",
    "form.location_enabled": "Location tracking enabled",
    "form.location_disabled": "Location tracking disabled",
    "cancel.title": "Cancel Reservation",
    "cancel.phone": "Phone Number",
    "cancel.button": "Cancel Reservation",
    "cancel.success": "Your reservation has been successfully cancelled.",
    "check.title": "Check Your Reservation",
    "check.description":
      "Driver and vehicle data will be available 1 hour before your scheduled time. Enter your phone number to check.",
    "check.button": "Check Reservation",
    "check.no_driver":
      "At the moment, no driver has accepted your reservation. If no driver accepts your request, we invite you to take the first available taxi in your area. Sorry for the inconvenience and thank you for your understanding.",
    "check.outside_time": "Driver and vehicle data will be available 1 hour before your scheduled pickup time.",
    "driver.name": "Driver Name",
    "driver.phone": "Phone",
    "driver.license": "Municipal License",
    "driver.municipality": "Municipality",
    "driver.vehicle_plate": "Vehicle Plate",
    "driver.vehicle_model": "Vehicle Model",
    "driver.seats": "Available Seats",
    "driver.pmr_adapted": "PMR Adapted",
    "driver.yes": "Yes",
    "driver.no": "No",
    "driver.status_no_tracking": "The driver has not enabled real-time location tracking",
    "driver.time_estimated": "Estimated time: {time} min",
    "driver.distance_to_pickup": "Distance: {distance} km",
    "header.taxi_driver": "I am a taxi driver",
    "footer.contact": "For any inquiry or incident contact +34 622 54 77 99",
    "suggestions.title": "Suggestions Box",
    "suggestions.placeholder":
      "Your suggestions are very important to us. If you have detected a fault or have ideas to improve the experience, please write to us here.",
    "suggestions.submit": "Send Suggestion",
    "suggestions.max_chars": "Maximum 1000 characters",
    "feedback.title": "Feedback",
    "feedback.description": "Help us improve your experience",
    "feedback.view_survey": "Take Survey",
    "reservation.tracking_client": "Client location",
    "reservation.last_update": "Last update: {time}",
    "reservation.location_unavailable": "Location unavailable",
    "admin.tracking_dashboard": "Real-time Tracking",
    "admin.client_location": "Client Location",
    "admin.driver_location": "Driver Location",
    "admin.active_tracking": "Active Tracking",
  },
  // ... Incluye los demás idiomas: es, de, it, fr (igual que antes)
}

// Proveedor de idioma
interface LanguageProviderProps {
  children: ReactNode
  defaultLanguage?: Language
}

export function LanguageProvider({ children, defaultLanguage = "en" }: LanguageProviderProps) {
  const [language, setLanguage] = useState<Language>(defaultLanguage)

  // Función de traducción con soporte de reemplazo de variables
  const t = (key: string, params?: Record<string, string | number>): string => {
    let text = translations[language][key] || key
    if (params) {
      Object.keys(params).forEach((param) => {
        text = text.replace(`{${param}}`, String(params[param]))
      })
    }
    return text
  }

  return <LanguageContext.Provider value={{ language, setLanguage, t }}>{children}</LanguageContext.Provider>
}

// Hook para consumir el contexto
export function useLanguage(): LanguageContextType {
  const context = useContext(LanguageContext)
  if (!context) {
    throw new Error("useLanguage must be used within LanguageProvider")
  }
  return context
}
