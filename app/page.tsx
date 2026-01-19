"use client"

import { LanguageProvider } from "@/context/LanguageContext"
import HomePage from "@/components/pages/HomePage"
import { useEffect } from "react"
import { initializeExampleData } from "@/lib/initializeExampleData"

export default function Home() {
  useEffect(() => {
    initializeExampleData()
  }, [])

  return (
    <LanguageProvider>
      <HomePage />
    </LanguageProvider>
  )
}
