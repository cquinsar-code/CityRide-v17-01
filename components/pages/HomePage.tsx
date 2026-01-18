"use client"
import { useLanguage } from "@/context/LanguageContext"
import LanguageSelector from "@/components/LanguageSelector"
import ReservationForm from "@/components/ReservationForm"
import ReservationChecker from "@/components/ReservationChecker"
import SuggestionsCard from "@/components/pages/SuggestionsCard"
import Link from "next/link"
import { Shield, Car } from "lucide-react"

export default function HomePage() {
  const { t } = useLanguage()

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-400 via-cyan-300 to-blue-400 relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-yellow-300/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-orange-300/20 rounded-full blur-3xl" />
      </div>

      <header className="relative z-10 px-4 py-4 md:px-8 md:py-6">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <LanguageSelector />
          <Link href="/taxi-driver">
            <button className="bg-white/80 border border-white text-sky-700 hover:bg-white hover:border-sky-500 transition-all duration-300 backdrop-blur-sm font-medium px-4 py-2 rounded-lg flex items-center gap-2">
              <Car className="w-4 h-4" />
              {t("header.taxi_driver")}
            </button>
          </Link>
        </div>
      </header>

      <main className="relative z-10 px-4 py-8 md:py-16">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <ReservationForm />
          </div>
          <div className="lg:sticky lg:top-24 h-fit space-y-6">
            <ReservationChecker />
            <SuggestionsCard />
          </div>
        </div>
      </main>

      <Link href="/admin" className="fixed bottom-6 right-6 z-20">
        <div className="w-12 h-12 rounded-full bg-white/80 border border-white backdrop-blur-xl flex items-center justify-center cursor-pointer hover:bg-white hover:border-sky-500 transition-all duration-300 shadow-lg">
          <Shield className="w-5 h-5 text-sky-700" />
        </div>
      </Link>
    </div>
  )
}
