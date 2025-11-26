"use client"

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

const languages = [
  { value: "en", label: "English" },
  { value: "es", label: "Spanish" },
  { value: "fr", label: "French" },
  { value: "de", label: "German" },
  { value: "it", label: "Italian" },
  { value: "pt", label: "Portuguese" },
  { value: "ja", label: "Japanese" },
  { value: "ko", label: "Korean" },
  { value: "zh", label: "Chinese" },
  { value: "hi", label: "Hindi" },
  { value: "ta", label: "Tamil" },
  { value: "te", label: "Telugu" },
  { value: "kn", label: "Kannada" },
  { value: "ml", label: "Malayalam" },
  { value: "bn", label: "Bengali" },
  { value: "auto", label: "auto"},
]

interface LanguageSelectorProps {
  value?: string
  onSelect: (language: string) => void
  label?: string
}

export function LanguageSelector({ value = "en", onSelect, label = "Language" }: LanguageSelectorProps) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-foreground">{label}</label>
      <Select value={value} onValueChange={onSelect}>
        <SelectTrigger className="w-full bg-input border-border text-foreground">
          <SelectValue />
        </SelectTrigger>
        <SelectContent className="bg-card border-border">
          {languages.map((lang) => (
            <SelectItem key={lang.value} value={lang.value} className="text-foreground">
              {lang.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
