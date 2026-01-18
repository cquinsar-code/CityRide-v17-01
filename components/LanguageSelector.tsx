"use client"
import { useLanguage } from "@/context/LanguageContext"

export default function LanguageSelector() {
  const { language, setLanguage } = useLanguage()
  const languages = [
    { code: "en" as const, label: "EN" },
    { code: "es" as const, label: "ES" },
    { code: "de" as const, label: "DE" },
    { code: "it" as const, label: "IT" },
    { code: "fr" as const, label: "FR" },
  ]

  return (
    <div className="flex gap-2 bg-white/90 backdrop-blur-sm rounded-lg p-1">
      {languages.map((lang) => (
        <button
          key={lang.code}
          onClick={() => setLanguage(lang.code)}
          className={`px-3 py-2 rounded-lg font-medium text-sm transition-all ${
            language === lang.code ? "bg-white text-sky-700 shadow-lg" : "bg-white/50 text-sky-600 hover:bg-white/70"
          }`}
        >
          {lang.label}
        </button>
      ))}
    </div>
  )
}
