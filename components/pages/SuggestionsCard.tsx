"use client"

import { useState } from "react"
import { useLanguage } from "@/context/LanguageContext"
import { CheckCircle } from "lucide-react"

export default function SuggestionsCard() {
  const { t } = useLanguage()
  const [suggestion, setSuggestion] = useState("")
  const [success, setSuccess] = useState(false)

  const safeGetSuggestions = () => {
    try {
      const raw = localStorage.getItem("suggestions")
      return raw ? JSON.parse(raw) : []
    } catch {
      return []
    }
  }

  const handleSubmit = () => {
    const text = suggestion.trim()
    if (!text) return

    const suggestions = safeGetSuggestions()

    suggestions.push({
      id: Math.random().toString(36).slice(2, 11),
      text,
      timestamp: new Date().toISOString(),
    })

    localStorage.setItem("suggestions", JSON.stringify(suggestions))

    setSuggestion("")
    setSuccess(true)
    setTimeout(() => setSuccess(false), 3000)
  }

  return (
    <div className="bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl p-6">
      <h3 className="text-lg font-semibold text-sky-900 mb-3">
        {t("suggestions.title")}
      </h3>

      {success && (
        <div className="mb-4 flex items-start gap-3 p-3 bg-green-50 border border-green-200 rounded-lg">
          <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
          <p className="text-green-700 text-sm">
            Sugerencia enviada correctamente
          </p>
        </div>
      )}

      <textarea
        value={suggestion}
        onChange={(e) => setSuggestion(e.target.value.slice(0, 1000))}
        maxLength={1000}
        placeholder={t("suggestions.placeholder")}
        className="w-full px-4 py-3 border border-sky-200 rounded-lg focus:ring-2 focus:ring-orange-400 focus:border-transparent min-h-32 resize-none text-sm"
      />

      <div className="flex justify-between items-center mt-3">
        <span className="text-xs text-sky-500">{suggestion.length}/1000</span>

        <button
          onClick={handleSubmit}
          disabled={!suggestion.trim()}
          className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 disabled:bg-gray-300 transition font-medium text-sm"
        >
          {t("suggestions.submit")}
        </button>
      </div>
    </div>
  )
}
