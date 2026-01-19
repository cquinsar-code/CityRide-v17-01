"use client"

import { useLanguage } from "@/context/LanguageContext"

type LanguageCode = "en" | "es" | "de" | "it" | "fr"

interface Language {
  code: LanguageCode
  label: string
}

export default function LanguageSelector() {
  const { language, setLanguage } = useLanguage()

  const languages: Language[] = [
    { code: "en", label: "EN" },
    { code: "es", label: "ES" },
    { code: "de", label: "DE" },
    { code: "it", label: "IT" },
    { code: "fr", label: "FR" },
  ]

  return (
    <div className="flex gap-2 bg-white/90 backdrop-blur-sm rounded-lg p-1">
      {languages.map((lang) => (
        <button
          key={lang.code}
          onClick={() => setLanguage(lang.code)}
          className={`px-3 py-2 rounded-lg font-medium text-sm transition-all
            ${
              language === lang.code
                ? "bg-white text-sky-700 shadow-lg"
                : "bg-white/50 text-sky-600 hover:bg-white/70"
            }`}
          aria-label={`Cambiar idioma a ${lang.label}`}
        >
          {lang.label}
        </button>
      ))}
    </div>
  )
}
